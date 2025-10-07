import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Decal,
  Float,
  OrbitControls,
  Preload,
  useTexture,
} from "@react-three/drei";
import CanvasLoader from "../Loader";
import * as THREE from "three";

const Ball = ({ imgUrl }) => {
  const meshRef = useRef();
  const [decal] = useTexture([imgUrl]);

  const rotationVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetRotation = new THREE.Vector3(0, 0, 0);
  const baseStiffness = 0.05; // base spring stiffness
  const damping = 0.85;

  const lastPointer = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useFrame(() => {
    if (!meshRef.current) return;
    const rot = meshRef.current.rotation;

    // Dynamic stiffness: faster drag → stronger spring
    const speed = rotationVelocity.current.length();
    const stiffness = baseStiffness + speed * 0.5;

    // Spring physics
    const forceX = (targetRotation.x - rot.x) * stiffness;
    const forceY = (targetRotation.y - rot.y) * stiffness;

    rotationVelocity.current.x =
      (rotationVelocity.current.x + forceX) * damping;
    rotationVelocity.current.y =
      (rotationVelocity.current.y + forceY) * damping;

    rot.x += rotationVelocity.current.x;
    rot.y += rotationVelocity.current.y;
  });

  const handlePointerDown = (x, y) => {
    isDragging.current = true;
    lastPointer.current = { x, y };
  };

  const handlePointerMove = (x, y) => {
    if (!isDragging.current) return;

    const deltaX = x - lastPointer.current.x;
    const deltaY = y - lastPointer.current.y;

    rotationVelocity.current.y += deltaX * 0.003; // horizontal drag
    rotationVelocity.current.x += deltaY * 0.003; // vertical drag

    lastPointer.current = { x, y };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
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
        onPointerDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onPointerMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handlePointerDown(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handlePointerMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={handlePointerUp}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#fff8eb"
          polygonOffset
          polygonOffsetFactor={-5}
          flatShading
        />
        <Decal
          position={[0, 0, 1]}
          rotation={[0, 0, 0]} // decal stays aligned
          scale={1}
          map={decal}
          flatShading
        />
      </mesh>
    </Float>
  );
};

const BallCanvas = ({ icon }) => {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
        <Ball imgUrl={icon} />
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default BallCanvas;
