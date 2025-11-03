import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import CanvasLoader from "../Loader";

const SceneManager = ({ children, camera = {}, controls = true }) => {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      shadows
      gl={{ preserveDrawingBuffer: true }}
      camera={camera}
    >
      <Suspense fallback={<CanvasLoader />}>
        {controls && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
          />
        )}
        {children}
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default SceneManager;
