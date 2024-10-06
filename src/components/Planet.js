// src/components/Planet.js
import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import Ring from './Ring';
import Moon from './Moon';

function Planet({
  planetData,
  setSelectedObject,
  speedMultiplier,
  setHoveredObject,
  setPlanetRefs,
}) {
  const planetRef = useRef();
  const planetMeshRef = useRef();
  const texture = useLoader(THREE.TextureLoader, planetData.textureUrl);

  const handlePlanetClick = () => {
    if (planetRef.current) {
      setSelectedObject({ ref: planetRef, data: planetData });
    }
  };

  const handlePointerOver = () => {
    setHoveredObject(planetData.name);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHoveredObject(null);
    document.body.style.cursor = 'auto';
  };

  useEffect(() => {
    if (setPlanetRefs && planetRef.current) {
      setPlanetRefs((prevRefs) => ({
        ...prevRefs,
        [planetData.name]: planetRef,
      }));
    }
  }, [planetData.name, setPlanetRefs]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * speedMultiplier;
    const orbitPosition = time * planetData.orbitSpeed;
    planetRef.current.rotation.y += planetData.rotationSpeed * speedMultiplier;
    planetRef.current.position.x =
      planetData.orbitRadius * Math.cos(orbitPosition);
    planetRef.current.position.z =
      planetData.orbitRadius * Math.sin(orbitPosition);
  });

  return (
    <group ref={planetRef}>
      <mesh
        onClick={handlePlanetClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        ref={planetMeshRef}
      >
        <sphereGeometry args={[planetData.size, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Renderizar los anillos si existen */}
      {planetData.rings && <Ring rings={planetData.rings} />}

      {/* Renderizar las lunas si existen */}
      {planetData.moons &&
        planetData.moons.map((moonData, index) => (
          <Moon
            key={index}
            moonData={moonData}
            speedMultiplier={speedMultiplier}
            setSelectedObject={setSelectedObject}
            setHoveredObject={setHoveredObject}
          />
        ))}
    </group>
  );
}

export default Planet;
