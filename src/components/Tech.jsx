// import { BallCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

const TechCard = ({ index, name, icon }) => {
  return (
    <Tilt className="w-full xs:w-[250px] xs:max-h-[250px]">
      <motion.div
        variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
        className="w-full bg-move tech-card green-pink-gradient p-[1px] rounded-[20px] shadow-card"
      >
        <div
          options={{ max: 45, scale: 1, speed: 450 }}
          className="bg-tertiary transition-none duration-300 shadow-inner green-pink-gradient-shadow rounded-[20px] py-5 px-5 min-h-[280px] xs:min-h-[250px] xs:max-h-[250px] flex justify-center items-center flex-col gap-5"
        >
          <img
            src={icon}
            alt={name}
            className="object-contain w-16 h-16 tech-icon"
          />
          <h3 className="green-pink-text-gradient text-[20px] cursor-default font-bold text-center">
            {name}
          </h3>
        </div>
      </motion.div>
    </Tilt>
  );
};

const Tech = () => {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-8">
      {technologies.map((technology, index) => (
        <TechCard key={index} index={index} {...technology} />
      ))}
    </div>
  );
};

export default SectionWrapper(Tech, "");
