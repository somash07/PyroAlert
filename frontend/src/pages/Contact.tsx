import React from "react";
import { useState, type ChangeEvent, type FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactInfo {
  icon: string;
  title: string;
  content: string | string[];
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const contactInfo: ContactInfo[] = [
    {
      icon: "📍",
      title: "Address",
      content: ["123 Fire Safety Marg", "Kathmandu 44600, Nepal"],
    },
    {
      icon: "📞",
      title: "Phone",
      content: "+977 (1) 1234567-FIRE",
    },
    {
      icon: "✉️",
      title: "Email",
      content: "info@pyroalert.com",
    },
    {
      icon: "🕒",
      title: "Business Hours",
      content: [
        "Mon - Fri: 8:00 AM - 6:00 PM",
        "Sat: 9:00 AM - 4:00 PM",
        "Sun: Emergency only",
      ],
    },
  ];

  return (
    <div className="w-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-700 to-orange-600 text-white py-20 lg:py-32 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl opacity-90">
            Get in touch with our fire safety experts
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">
                Get In Touch
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                Ready to protect your property? Have questions about our
                services? We're here to help!
              </p>

              <div className="space-y-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="text-2xl mr-4 mt-1">{info.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">
                        {info.title}
                      </h3>
                      {Array.isArray(info.content) ? (
                        info.content.map((line, lineIndex) => (
                          <p key={lineIndex} className="text-gray-600">
                            {line}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-600">{info.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 p-8 lg:p-10 rounded-xl">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors resize-vertical"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
