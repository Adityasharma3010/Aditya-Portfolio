import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { styles } from "../styles";
import { ComputersCanvas } from "./canvas";

const Hero = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const texts = ["Web Developer", "Game Developer", "Software Developer"];

  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);

  useEffect(() => {
    let timeout;
    const currentText = texts[textIndex];

    const typeWriter = () => {
      const currentIndex = charIndexRef.current;
      const isDeleting = isDeletingRef.current;

      if (!isDeleting && currentIndex < currentText.length) {
        setDisplayedText((prev) => prev + currentText[currentIndex]);
        charIndexRef.current += 1;
        timeout = setTimeout(typeWriter, 100);
      } else if (isDeleting && currentIndex > 0) {
        setDisplayedText((prev) => prev.slice(0, currentIndex - 1));
        charIndexRef.current -= 1;
        timeout = setTimeout(typeWriter, 50);
      } else {
        isDeletingRef.current = !isDeleting;
        if (!isDeletingRef.current) {
          setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
          charIndexRef.current = 0;
        }
        timeout = setTimeout(typeWriter, 1000); // pause before switching
      }
    };

    timeout = setTimeout(typeWriter, 500);

    return () => clearTimeout(timeout);
  }, [textIndex]);

  return (
    <section className="relative w-full h-screen mx-auto">
      <div
        className={`${styles.paddingX} absolute inset-0 top-[120px] max-w-7xl mx-auto flex flex-row items-start gap-5`}
      >
        <div className="flex flex-col items-center justify-center mt-5">
          <div className="w-5 h-5 bg-[#915eff] rounded-full" />
          <div className="w-1 h-44 sm:h-80 violet-gradient" />
        </div>
        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>
            Hi, I'm <span className="text-[#915eff]">Aditya</span>
          </h1>
          <p className={`${styles.heroSubText} mt-2 text-white-100`}>
            An enthusiastic<span className="hidden sm:inline">&nbsp;</span>
            <span className="inline sm:hidden"> </span>
            <span
              style={{
                display: "inline",
                overflow: "hidden",
                whiteSpace: "nowrap",
                borderRight: "3px solid #fff", // Cursor style
              }}
            >
              <span style={{ color: "#fff" }}>
                {displayedText.slice(0, -1)}
              </span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ color: "#fff" }}
              >
                {displayedText.slice(-1)}
              </motion.span>
            </span>{" "}
            <br />
            looking for new opportunities to <br className="hidden sm:block" />
            explore the industry.
          </p>
        </div>
      </div>

      <ComputersCanvas />

      <div className="absolute flex items-center justify-center w-full xs:bottom-10 bottom-32">
        <a href="#about">
          <div className="w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2">
            <motion.div
              animate={{
                y: [0, 24, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="w-3 h-3 mb-1 rounded-full bg-secondary"
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
