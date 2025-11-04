import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Decal, Float, useTexture } from "@react-three/drei";
import * as THREE from "three";

const Ball = ({ imgUrl, scale = 2 }) => {
  const meshRef = useRef();
  const [decal] = useTexture([imgUrl]);

  const rotationVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetRotation = new THREE.Vector3(0, 0, 0);
  const baseStiffness = 0.05;
  const damping = 0.85;

  useFrame(() => {
    if (!meshRef.current) return;
    const rot = meshRef.current.rotation;
    const speed = rotationVelocity.current.length();
    const stiffness = baseStiffness + speed * 0.5;
    const forceX = (targetRotation.x - rot.x) * stiffness;
    const forceY = (targetRotation.y - rot.y) * stiffness;

    rotationVelocity.current.x =
      (rotationVelocity.current.x + forceX) * damping;
    rotationVelocity.current.y =
      (rotationVelocity.current.y + forceY) * damping;

    rot.x += rotationVelocity.current.x;
    rot.y += rotationVelocity.current.y;
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={meshRef} castShadow receiveShadow scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#fff8eb"
          polygonOffset
          polygonOffsetFactor={-5}
          flatShading
        />
        <Decal
          position={[0, 0, 1]}
          rotation={[0, 0, 0]}
          scale={1}
          map={decal}
        />
      </mesh>
    </Float>
  );
};

export default Ball;
