import DivAnimation from "@/components/animations/DivAnimation";
import { motion, useScroll } from "motion/react";
import { useRef } from "react";


const MVCard = ({
  title,
  children,
  backgroundImage,
  reverse,
}: {
  title?: string;
  children: React.ReactNode;
  backgroundImage: string;
  reverse?: "flex-row" | "flex-row-reverse";
}) => {
  const element = useRef(null);
  const { scrollYProgress } = useScroll({
    target: element,
    offset: ["0 1", "0 0.25"],
  });

  const layoutClass = reverse === "flex-row-reverse" ? "lg:flex-row-reverse" : "lg:flex-row";
  return (
    <div
      className={`flex flex-col justify-center items-center ${layoutClass} w-screen `}
    >
      
      <motion.div
        ref={element}
        style={{
          scale: scrollYProgress,
          backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%),
      url(${backgroundImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        className="flex flex-col text-white w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full shadow-md gap-2 justify-center p-4 "
      >
        <h1 className="text-5xl text-center font-bitter font-light ">{title}</h1>
      </motion.div>
      <DivAnimation className="w-1/2 h-auto text-sm md:text-lg p-7 text-center">
        {children}
      </DivAnimation>
    </div>
  );
};

export default MVCard;
