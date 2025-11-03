import React from "react";
import { useGLTF, OrbitControls } from "@react-three/drei";
import SceneManager from "./SceneManager";

const Earth = () => {
  const earth = useGLTF("/planet/scene.glb");
  return (
    <primitive object={earth.scene} scale={2.5} position-y={0} rotation-y={0} />
  );
};

const EarthCanvas = () => (
  <SceneManager
    camera={{
      fov: 45,
      near: 0.1,
      far: 200,
      position: [-4, 3, 6],
    }}
  >
    <OrbitControls
      autoRotate
      autoRotateSpeed={0.8}
      enableZoom={false}
      enablePan={false}
      maxPolarAngle={Math.PI - 0.2}
      minPolarAngle={0.2}
    />
    <Earth />
  </SceneManager>
);

export default EarthCanvas;
