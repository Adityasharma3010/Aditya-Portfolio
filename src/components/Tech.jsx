import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import Ball from "./canvas/Ball";
import CanvasLoader from "./Loader";

// ✅ Create a component that runs inside <Canvas>
const RotatingRing = () => {
  const groupRef = React.useRef();

  // useFrame hook is safe here, because it's inside Canvas
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {technologies.map((tech, index) => {
        const radius = 6;
        const angle = (index / technologies.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.5;

        return (
          <group key={tech.name} position={[x, y, 0]}>
            <Ball imgUrl={tech.icon} scale={1.5} />
          </group>
        );
      })}
    </group>
  );
};

const Tech = () => {
  return (
    <div className="w-full h-[600px]">
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 12], fov: 45 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} />

          {/* ✅ Rotating ring component inside Canvas */}
          <RotatingRing />

          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default SectionWrapper(Tech, "");
