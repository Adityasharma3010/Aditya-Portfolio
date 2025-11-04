import { Suspense, useRef, useFrame } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import Ball from "./canvas/Ball";
import CanvasLoader from "./Loader";
import * as THREE from "three";

const RotatingGroup = () => {
  const groupRef = useRef();

  // auto-rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3; // smooth rotation
    }
  });

  return (
    <group ref={groupRef}>
      {technologies.map((tech, index) => {
        const radius = 5; // spread size
        const angle = (index / technologies.length) * Math.PI * 2;

        // place all balls in circular orbit layout
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(angle * 1.5) * 1.5; // vertical offset for variation

        return (
          <group key={tech.name} position={[x, y, z]}>
            <Ball imgUrl={tech.icon} scale={1.8} />
          </group>
        );
      })}
    </group>
  );
};

const Tech = () => {
  return (
    <div className="w-full h-[550px] flex justify-center items-center">
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 12], fov: 45 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<CanvasLoader />}>
          {/* lighting setup */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, -5, -5]} intensity={0.4} />

          {/* rotating orbit of balls */}
          <RotatingGroup />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            rotateSpeed={0.5}
          />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default SectionWrapper(Tech, "");
