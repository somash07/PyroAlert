import { motion } from "motion/react";

const DivAnimation = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ amount: 0.2,once:true }}
      transition={{ delay: 0.2, ease: "easeIn" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default DivAnimation;
