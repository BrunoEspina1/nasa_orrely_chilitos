import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Planet({ orbitRadius, color, size, orbitSpeed, setSelectedPlanetRef, hasRings }) {
  const planetRef = useRef();

  const handlePlanetClick = () => {
    if (planetRef.current) {
      setSelectedPlanetRef(planetRef);
    }
  };

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    planetRef.current.position.x = orbitRadius * Math.cos(time * orbitSpeed);
    planetRef.current.position.z = orbitRadius * Math.sin(time * orbitSpeed);
  });

  return (
    <group ref={planetRef}>
      <mesh onClick={handlePlanetClick}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {hasRings && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.2, size * 2, 32]} />
          <meshStandardMaterial color={'goldenrod'} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function CameraController({ selectedPlanetRef, orbitControlsRef }) {
  const { camera } = useThree();
  const [isMovingToPlanet, setIsMovingToPlanet] = useState(false);
  const [targetCameraPosition, setTargetCameraPosition] = useState(new THREE.Vector3());

  useEffect(() => {
    if (selectedPlanetRef && selectedPlanetRef.current) {
      const planetPosition = selectedPlanetRef.current.position.clone();
      const offset = new THREE.Vector3(5, 5, 5);
      const desiredCameraPosition = planetPosition.clone().add(offset);

      setTargetCameraPosition(desiredCameraPosition);
      setIsMovingToPlanet(true);

      orbitControlsRef.current.target.copy(planetPosition);
    } else {
      setTargetCameraPosition(new THREE.Vector3(10, 10, 10));
      setIsMovingToPlanet(true);

      orbitControlsRef.current.target.set(0, 0, 0);
    }
  }, [selectedPlanetRef]);

  useFrame(() => {
    if (isMovingToPlanet) {
      camera.position.lerp(targetCameraPosition, 0.1);

      if (camera.position.distanceTo(targetCameraPosition) < 0.01) {
        camera.position.copy(targetCameraPosition);
        setIsMovingToPlanet(false);
      }

      orbitControlsRef.current.update();
    }

    if (selectedPlanetRef && selectedPlanetRef.current) {
      const planetPosition = selectedPlanetRef.current.position.clone();
      orbitControlsRef.current.target.copy(planetPosition);
      orbitControlsRef.current.update();
    }
  });

  return null;
}

function SolarSystem() {
  const [selectedPlanetRef, setSelectedPlanetRef] = useState(null);
  const orbitControlsRef = useRef();

  // Función para restablecer la cámara al hacer clic fuera de los planetas
  const resetCamera = () => {
    setSelectedPlanetRef(null);
  };

  // Datos de los planetas
  const planetsData = [
    {
      name: 'Sun',
      orbitRadius: 0,
      size: 2,
      color: 'yellow',
      orbitSpeed: 0,
    },
    {
      name: 'Mercury',
      orbitRadius: 3,
      size: 0.2,
      color: 'white',
      orbitSpeed: 0.04,
    },
    {
      name: 'Venus',
      orbitRadius: 5,
      size: 0.5,
      color: 'orange',
      orbitSpeed: 0.03,
    },
    {
      name: 'Earth',
      orbitRadius: 7,
      size: 0.5,
      color: 'blue',
      orbitSpeed: 0.02,
    },
    {
      name: 'Mars',
      orbitRadius: 9,
      size: 0.3,
      color: 'red',
      orbitSpeed: 0.015,
    },
    {
      name: 'Jupiter',
      orbitRadius: 12,
      size: 1,
      color: 'brown',
      orbitSpeed: 0.008,
    },
    {
      name: 'Saturn',
      orbitRadius: 15,
      size: 0.9,
      color: 'goldenrod',
      orbitSpeed: 0.006,
      hasRings: true, // Añadimos esta propiedad para los anillos
    },
    {
      name: 'Uranus',
      orbitRadius: 18,
      size: 0.4,
      color: 'lightblue',
      orbitSpeed: 0.004,
    },
    {
      name: 'Neptune',
      orbitRadius: 21,
      size: 0.4,
      color: 'darkblue',
      orbitSpeed: 0.002,
    },
  ];

  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: 'black' }}
      onPointerMissed={resetCamera}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={1.5} />
      <OrbitControls ref={orbitControlsRef} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

      <CameraController
        selectedPlanetRef={selectedPlanetRef}
        orbitControlsRef={orbitControlsRef}
      />

      {planetsData.map((planetData, index) => (
        <Planet
          key={index}
          setSelectedPlanetRef={setSelectedPlanetRef}
          orbitRadius={planetData.orbitRadius}
          color={planetData.color}
          size={planetData.size}
          orbitSpeed={planetData.orbitSpeed}
          hasRings={planetData.hasRings} // Pasamos la propiedad para mostrar los anillos
        />
      ))}
    </Canvas>
  );
}

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <SolarSystem />
    </div>
  );
}

export default App;
