import DivAnimation from "@/components/animations/DivAnimation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, useScroll } from "motion/react";
import { useRef } from "react";

function Home() {
  const navigate = useNavigate();
  const element = useRef(null);
  const { scrollYProgress } = useScroll({
    target: element,
    offset: ["0 1", "0 0.25"],
  });
  return (
    <div className="w-screen ">
      {/* Hero Section */}
      <section className="bg-[url(/homepage.jpg)] bg-cover text-white py-20 lg:py-32 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <DivAnimation className="">
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-semibold mb-6 leading-tight font-bitter">
                  SMART FIRE ALERT & RESPONSE SYSTEM
                </h1>
              </DivAnimation>
              <p className="text-lg sm:text-xl mb-8 opacity-90 leading-relaxed font-roboto">
                Protect your property with our cutting-edge fire detection
                technology. Get instant alerts and comprehensive monitoring
                solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <DivAnimation className="">
                  <Button
                    className="px-8 py-6 bg-orange-400 text-white font-semibold rounded-lg hover:bg-orange-500 transition-all duration-300 transform hover:-translate-y-1 text-lg"
                    onClick={() => navigate("/joinus/login")}
                  >
                    Get Started
                  </Button>
                </DivAnimation>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16 text-gray-800">
            Why Choose PyroAlert?
          </h2> */}
          <motion.div
            ref={element}
            style={{ scale: scrollYProgress }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-center mb-16 text-gray-800 font-bitter"
          >
            <p>Why Choose PyroAlert?</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Instant Detection
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced sensors detect fire threats in seconds, giving you
                precious time to respond.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-5xl mb-6">📱</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Email Alerts
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Receive immediate notifications on your smartphone.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-5xl mb-6">🛡️</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                24/7 Monitoring
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Round-the-clock surveillance ensures your property is always
                protected.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-5xl mb-6">🔧</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Easy Installation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Professional installation service with minimal disruption to
                your routine.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
