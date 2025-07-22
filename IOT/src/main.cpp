#include <stdio.h>
#include <string.h>
#include <time.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "nvs_flash.h"
#include "esp_netif.h"
#include "esp_http_client.h"
#include "driver/adc.h"
#include "driver/gpio.h"
#include "esp_sntp.h" //added

#define WIFI_SSID       "imyogen_2"
#define WIFI_PASS       "imyogen@123456"
#define API_URL         "http://192.168.1.68:8080/api/v1/alert"
#define FLAME_GPIO      GPIO_NUM_6
#define SMOKE_ADC_CH    ADC1_CHANNEL_1
#define SMOKE_THRESHOLD 600
#define DEVICE_NAME     "ESP32 Fire Monitor"
#define ALERT_INTERVAL_MS 5000  // 5 seconds
static time_t last_alert_time = 0;

static const char *TAG = "FIRE_DETECT";
bool alert_sent = false;

// Wi-Fi Event Handler
static void wifi_event_handler(void* arg, esp_event_base_t event_base, int32_t event_id, void* event_data) {
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        ESP_LOGI(TAG, "Disconnected. Reconnecting...");
        esp_wifi_connect();
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ESP_LOGI(TAG, "Connected to Wi-Fi!");
    }
}

// Initializing Wi-Fi
static void wifi_init(void) {
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL, NULL));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL, NULL));

    wifi_config_t wifi_config = {};
    strncpy((char*)wifi_config.sta.ssid, WIFI_SSID, sizeof(wifi_config.sta.ssid) - 1);
    strncpy((char*)wifi_config.sta.password, WIFI_PASS, sizeof(wifi_config.sta.password) - 1);

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
    ESP_ERROR_CHECK(esp_wifi_start());

    ESP_LOGI(TAG, "Wi-Fi initialized");
}

void initialize_sntp(void) {
    ESP_LOGI(TAG, "Initializing SNTP...");
    esp_sntp_setoperatingmode(SNTP_OPMODE_POLL);
    esp_sntp_setservername(0, "pool.ntp.org");  // You can also use a local NTP server
    esp_sntp_init();

    // Wait until time is set
    time_t now = 0;
    struct tm timeinfo = {0};
    int retry = 0;
    const int retry_count = 10;

    while (timeinfo.tm_year < (2020 - 1900) && ++retry < retry_count) {
        ESP_LOGI(TAG, "Waiting for system time to be set... (%d/%d)", retry, retry_count);
        vTaskDelay(2000 / portTICK_PERIOD_MS);
        time(&now);
        localtime_r(&now, &timeinfo);
    }

    if (timeinfo.tm_year >= (2020 - 1900)) {
        ESP_LOGI(TAG, "System time is set.");
    } else {
        ESP_LOGW(TAG, "Failed to get time from SNTP.");
    }
}


// Sending JSON alert to backend
static void send_fire_alert_http(void) {
    time_t now = time(NULL);

    char post_data[1024];
    snprintf(post_data, sizeof(post_data),
        "{"
        "\"location\": \"Factory Zone A\","
        "\"alert_type\": \"fire\","
        "\"timestamp\": %lld,"
        "\"confidence\": %.2f,"
        "\"source_device_id\": \"esp32-c6-001\","
        "\"geo_location\": {\"type\": \"Point\", \"coordinates\": [85.345002, 27.6499376]},"
        "\"additional_info\": {"
            "\"camera_id\": \"camera_001\","
            "\"detection_method\": \"MQ2 + Flame\","
            "\"alert_source\": \"automated_detection\","
            "\"device_name\": \"%s\""
        "}"
        "}",
        now, 0.95f, DEVICE_NAME
    );

    esp_http_client_config_t config = {
        .url = API_URL,
        .method = HTTP_METHOD_POST
    };

    esp_http_client_handle_t client = esp_http_client_init(&config);
    esp_http_client_set_header(client, "Content-Type", "application/json");
    esp_http_client_set_post_field(client, post_data, strlen(post_data));

    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK) {
        ESP_LOGI(TAG, "Alert sent. HTTP Status = %d", esp_http_client_get_status_code(client));
    } else {
        ESP_LOGE(TAG, "HTTP POST failed: %s", esp_err_to_name(err));
    }

    esp_http_client_cleanup(client);
}

// Main logic
extern "C" void app_main(void) {
    ESP_LOGI(TAG, "Starting Fire Detection System");

    // Init NVS and Wi-Fi
    ESP_ERROR_CHECK(nvs_flash_init());
    wifi_init();

    // ✅ Initialize SNTP time sync
    initialize_sntp();

    // Flame sensor setup
    gpio_set_direction(FLAME_GPIO, GPIO_MODE_INPUT);

    // MQ2 smoke sensor setup
    adc1_config_width(ADC_WIDTH_BIT_12);
    adc1_config_channel_atten(SMOKE_ADC_CH, ADC_ATTEN_DB_11);

    while (true) {
        int smoke_val = adc1_get_raw(SMOKE_ADC_CH);
        int flame_val = gpio_get_level(FLAME_GPIO); // 0 = flame detected

        ESP_LOGI(TAG, "Smoke: %d | Flame: %s", smoke_val, flame_val == 0 ? "🔥 YES" : "✅ NO");
        time_t now = time(NULL);

       if (flame_val == 0 && smoke_val > SMOKE_THRESHOLD) {
    if ((now - last_alert_time) >= 5) {
        ESP_LOGW(TAG, "🔥 FIRE DETECTED! Flame: %d, Smoke: %d", flame_val, smoke_val);
        send_fire_alert_http();  // send to your backend
        last_alert_time = now;
    }
} else {
    last_alert_time = 0;  // Reset timer if condition breaks
}

        vTaskDelay(pdMS_TO_TICKS(2000));
    }
}