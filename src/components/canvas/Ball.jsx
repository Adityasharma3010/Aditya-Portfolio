import { useRef, useState } from "react";
import { Float, Decal, useTexture } from "@react-three/drei";
import * as THREE from "three";
import SceneManager from "./SceneManager";
import { Canvas, useFrame } from "@react-three/fiber";

const Ball = ({ imgUrl }) => {
  const meshRef = useRef();
  const [decal] = useTexture([imgUrl]);
  const rotationVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetRotation = new THREE.Vector3(0, 0, 0);
  const baseStiffness = 0.05;
  const damping = 0.85;
  const lastPointer = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useFrame(() => {
    if (!meshRef.current) return;
    const rot = meshRef.current.rotation;
    const speed = rotationVelocity.current.length();
    const stiffness = baseStiffness + speed * 0.5;
    const fx = (targetRotation.x - rot.x) * stiffness;
    const fy = (targetRotation.y - rot.y) * stiffness;
    rotationVelocity.current.x = (rotationVelocity.current.x + fx) * damping;
    rotationVelocity.current.y = (rotationVelocity.current.y + fy) * damping;
    rot.x += rotationVelocity.current.x;
    rot.y += rotationVelocity.current.y;
  });

  const drag = (x, y, isDown) => {
    if (isDown) {
      isDragging.current = true;
      lastPointer.current = { x, y };
    } else {
      isDragging.current = false;
    }
  };

  const move = (x, y) => {
    if (!isDragging.current) return;
    const dx = x - lastPointer.current.x;
    const dy = y - lastPointer.current.y;
    rotationVelocity.current.y += dx * 0.003;
    rotationVelocity.current.x += dy * 0.003;
    lastPointer.current = { x, y };
  };

  return (
    <Float speed={1.75} rotationIntensity={1} floatIntensity={2}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[0, 0, 0.05]} />
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        scale={2.75}
        onPointerDown={(e) => drag(e.clientX, e.clientY, true)}
        onPointerMove={(e) => move(e.clientX, e.clientY)}
        onPointerUp={() => drag(0, 0, false)}
        onPointerLeave={() => drag(0, 0, false)}
        onTouchStart={(e) =>
          drag(e.touches[0].clientX, e.touches[0].clientY, true)
        }
        onTouchMove={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={() => drag(0, 0, false)}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#fff8eb"
          polygonOffset
          polygonOffsetFactor={-5}
          flatShading
        />
        <Decal position={[0, 0, 1]} scale={1} map={decal} flatShading />
      </mesh>
    </Float>
  );
};

const BallCanvas = ({ icon }) => (
  <SceneManager>
    <Ball imgUrl={icon} />
  </SceneManager>
);

export default BallCanvas;
