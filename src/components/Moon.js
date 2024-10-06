// src/components/Moon.js
import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

function Moon({
  moonData,
  speedMultiplier,
  setSelectedObject,
  setHoveredObject,
}) {
  const moonRef = useRef();
  const moonMeshRef = useRef();
  const texture = useLoader(THREE.TextureLoader, moonData.textureUrl);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * speedMultiplier;
    const orbitPosition = time * moonData.orbitSpeed;
    const x = moonData.orbitRadius * Math.cos(orbitPosition);
    const z = moonData.orbitRadius * Math.sin(orbitPosition);

    moonRef.current.position.set(x, 0, z);

    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y += moonData.rotationSpeed * speedMultiplier;
    }
  });

  const handleMoonClick = () => {
    if (moonRef.current) {
      setSelectedObject({ ref: moonRef, data: moonData });
    }
  };

  const handlePointerOver = () => {
    setHoveredObject(moonData.name);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHoveredObject(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group ref={moonRef}>
      <mesh
        onClick={handleMoonClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        ref={moonMeshRef}
      >
        <sphereGeometry args={[moonData.size, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
}

export default Moon;
