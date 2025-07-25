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
#include "esp_sntp.h"

#define WIFI_SSID       "imyogen_2"
#define WIFI_PASS       "imyogen@123456"
#define API_URL         "https://pyroalert-tdty.onrender.com/api/v1/alert"
#define FLAME_GPIO      GPIO_NUM_6
#define SMOKE_ADC_CH    ADC1_CHANNEL_1
#define SMOKE_THRESHOLD 1500
#define DEVICE_NAME     "ESP32 Fire Monitor"
#define SMOKE_HIGH_THRESHOLD 2500

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
    esp_sntp_setservername(0, "pool.ntp.org");
    esp_sntp_init();

    time_t now = 0;
    struct tm timeinfo = {};
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
extern const uint8_t server_cert_pem_start[] asm("_binary_server_cert_pem_start");
extern const uint8_t server_cert_pem_end[]   asm("_binary_server_cert_pem_end");
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
            "\"detection_method\": \"MQ2 + Flame\"," 
            "\"alert_source\": \"automated_detection\"," 
            "\"device_name\": \"%s\""
        "}"
        "}",
        now, 0.95f, DEVICE_NAME);

    esp_http_client_config_t config = { };
        config.url = API_URL;
        config.method = HTTP_METHOD_POST;
        config.cert_pem = (const char *)server_cert_pem_start;
        config.transport_type = HTTP_TRANSPORT_OVER_SSL;  // ✅ Add this line


   

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


extern "C" void app_main(void) {
    ESP_LOGI(TAG, "Starting Fire Detection System");

    ESP_ERROR_CHECK(nvs_flash_init());
    wifi_init();

    initialize_sntp();

    gpio_set_direction(FLAME_GPIO, GPIO_MODE_INPUT);
    adc1_config_width(ADC_WIDTH_BIT_12);
    adc1_config_channel_atten(SMOKE_ADC_CH, ADC_ATTEN_DB_12);

    while (true) {
        int smoke_val = adc1_get_raw(SMOKE_ADC_CH);
        int flame_val = gpio_get_level(FLAME_GPIO);

        ESP_LOGI(TAG, "Smoke: %d | Flame: %s", smoke_val, flame_val == 0 ? "🔥 YES" : "✅ NO");

        static time_t detection_start_time = 0;
        static bool waiting_for_cooldown = false;

        time_t now = time(NULL);
        bool flame_detected = (flame_val == 0);
        bool high_smoke_detected = (smoke_val > SMOKE_HIGH_THRESHOLD);
        bool low_smoke_detected = (smoke_val > SMOKE_THRESHOLD);

        if (!waiting_for_cooldown) {
            if (flame_detected && high_smoke_detected) {
                if (detection_start_time == 0) {
                    detection_start_time = now;
                    ESP_LOGI(TAG, "🔥 Fast path started (flame + high smoke)");
                }
                if ((now - detection_start_time) >= 3) {
                    ESP_LOGW(TAG, "🔥🔥 FIRE CONFIRMED (Fast path)!");
                    send_fire_alert_http();
                    waiting_for_cooldown = true;
                }
            } else if (low_smoke_detected && !flame_detected) {
                if (detection_start_time == 0) {
                    detection_start_time = now;
                    ESP_LOGI(TAG, "⚠️ Slow path started (only smoke)");
                }
                if ((now - detection_start_time) >= 12) {
                    ESP_LOGW(TAG, "🔥🔥 FIRE CONFIRMED (Slow path)!");
                    send_fire_alert_http();
                    waiting_for_cooldown = true;
                }
            } else {
                if (detection_start_time != 0) {
                    ESP_LOGI(TAG, "🟡 Detection condition changed. Timer reset.");
                }
                detection_start_time = 0;
            }
        }

        if (!low_smoke_detected && !flame_detected && waiting_for_cooldown) {
            ESP_LOGI(TAG, "✅ Environment normal. Cooldown reset.");
            waiting_for_cooldown = false;
            detection_start_time = 0;
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
