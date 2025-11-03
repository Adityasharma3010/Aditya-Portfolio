import React, { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import SceneManager from "./SceneManager";

const Computers = ({ isMobile }) => {
  const computer = useGLTF("./desktop_pc/scene.glb");
  return (
    <mesh>
      <hemisphereLight intensity={2} groundColor="black" />
      <pointLight intensity={1} />
      <ambientLight intensity={1} />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.7 : 0.75}
        position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
        rotation={[-0.01, -0.2, -0.1]}
      />
    </mesh>
  );
};

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 500px)");
    setIsMobile(mq.matches);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <SceneManager camera={{ position: [20, 3, 5], fov: 25 }} controls={true}>
      <Computers isMobile={isMobile} />
    </SceneManager>
  );
};

export default ComputersCanvas;
