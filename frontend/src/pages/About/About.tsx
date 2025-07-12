
import ImageAnimationVertical from "@/components/animations/ImageAnimationVertical";
import React from "react";
import MVCard from "./MVCard";
import { motion } from "motion/react";
import TeamCard from "./TeamCard";


interface TeamMember {
  name: string;
  image: string;
}


const About: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Sumina Shrestha",
      image: "/homepage.jpg"
    },
    {
      name: "Somash Manandhar",
      image: "/team/somashPhoto.jpg"
    },
    {
      name: "Shirshak Shahi",
      image: "/homepage.jpg"
    },
    {
      name: "Deepa Gurung",
      image: "/homepage.jpg"

    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-screen mt-20"
    >
      {/* Hero Section */}
      <section className=" text-white bg-orange-400 py-20 lg:py-32 text-center">
        <ImageAnimationVertical>
          <div className=" sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-bitter">
              About PyroAlert
            </h1>
            <p className="text-lg sm:text-xl opacity-90 font-roboto">
              Leading the way in fire detection and prevention technology
            </p>
          </div>
        </ImageAnimationVertical>
      </section>

      {/* Content Section */}
      <div className="flex flex-col gap-8 items-center justify-between p-3 text-sm/normal md:text-lg text-justify">
        <MVCard
          title="Mission"
          backgroundImage="/homepage.jpg"
          reverse="flex-row-reverse"
        >
          <p className="font-bitter">
            To protect people from fire by harnessing smart technology—because
            every second counts when lives and landscapes are at stake.
          </p>
        </MVCard>
        <MVCard title="Vision" backgroundImage="/vision.jpg">
          <p className="font-bitter">
            We envision a future where families and firefighters are safer,
            empowered by fast, reliable alerts that give them time to act before
            disaster strikes.
          </p>
        </MVCard>
      </div>
      {/* Team Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-center mb-16 text-gray-800">
            Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member, index) => (
              <TeamCard name= {member.name} image={member.image}/>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
