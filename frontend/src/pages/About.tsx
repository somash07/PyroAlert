import React from "react";

interface TeamMember {
  name: string;
  role: string;
}

interface Stat {
  value: string;
  label: string;
}

const About: React.FC = () => {
  const stats: Stat[] = [
    { value: "100+", label: "Properties Protected" },
    { value: "24/7", label: "Monitoring Service" },
  ];

  const teamMembers: TeamMember[] = [
    {
      name: "Somash Manandhar",
      role: "Frontend developer",
    },
    {
      name: "Shirshak Shahi",
      role: "Hardware Specialist",
    },
    {
      name: "Deepa Gurung",
      role: "Head of Backend",
    },
    {
      name: "Sumina Shrestha",
      role: "AI Specialist",
    },
  ];

  return (
    <div className="w-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-700 to-orange-600 text-white py-20 lg:py-32 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            About PyroAlert
          </h1>
          <p className="text-lg sm:text-xl opacity-90">
            Leading the way in fire detection and prevention technology
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At PyroAlert, we're dedicated to protecting lives and property
                through innovative fire detection technology. Our mission is to
                provide reliable, fast, and intelligent fire safety solutions
                that give our customers peace of mind.
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded in 2025 by a team of fire safety experts and technology
                innovators, PyroAlert emerged from a simple yet powerful vision:
                to revolutionize fire detection and prevention. We've grown from
                a small startup to a trusted leader in the industry, serving
                thousands of customers worldwide.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl h-fit sticky top-24">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <h3 className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">
                      {stat.value}
                    </h3>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16 text-gray-800">
            Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg text-center"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {member.name}
                </h3>
                <p className="text-orange-500 font-semibold mb-4">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
