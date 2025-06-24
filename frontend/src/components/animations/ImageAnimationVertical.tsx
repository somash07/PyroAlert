import { motion } from "motion/react";

const ImageAnimationVertical = ({children}: {children: React.ReactNode}) => {
  return (
    <motion.div
      initial={{ y: -200, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      viewport={{ once: true }}
      className="h-full w-screen"
    >
      {children}
    </motion.div>
  );
};

export default ImageAnimationVertical;
