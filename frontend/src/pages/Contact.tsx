import ImageAnimationVertical from "@/components/animations/ImageAnimationVertical";
import API from "@/config/baseUrl";
import { inquiryFormSchema } from "@/validators/inquiry-form.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";


interface FormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

interface ContactInfo {
  icon: string;
  title: string;
  content: string | string[];
}

const Contact: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>(
    {
      resolver: zodResolver(inquiryFormSchema),
          mode: "all",
          defaultValues: {
            name: "",
            phone: "",
            email: "",
            message: ""
          },
    }
  );

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await API.post("/api/v1/inquiry-form", data);
      toast.success("Your inquiry has been submitted successfully. Please wait for response ");
    } catch (err) {
      console.log(err)
    }

    reset();
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-screen"
    >
      {/* Hero Section */}
      <section className=" text-white bg-orange-400 py-20 lg:py-32 text-center">
        <ImageAnimationVertical>
          <div className=" sm:px-6 lg:px-8 mt-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-bitter">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl opacity-90 font-roboto">
              Get in touch with out team
            </p>
          </div>
        </ImageAnimationVertical>
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Name *
                    </label>
                    <input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg  focus:outline-none transition-colors"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register("email", { required: "Email is required" })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none transition-colors"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
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
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg  focus:outline-none transition-colors"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
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
                    rows={5}
                    {...register("message", {
                      required: "Message is required",
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg  focus:outline-none transition-colors resize-vertical"
                  />
                  {errors.message && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full px-8 py-4 bg-orange-400 text-white font-semibold rounded-lg hover:bg-orange-500 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Contact;
