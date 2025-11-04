import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import Ball from "./canvas/Ball";
import CanvasLoader from "./Loader";

const Tech = () => {
  return (
    <div className="w-full h-[500px]">
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />

          {/* Position each ball in 3D space */}
          {technologies.map((tech, index) => {
            const radius = 4;
            const angle = (index / technologies.length) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.6; // spread vertically

            return (
              <group key={tech.name} position={[x, y, 0]}>
                <Ball imgUrl={tech.icon} scale={1.5} />
              </group>
            );
          })}

          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default SectionWrapper(Tech, "");
