import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Planet({ orbitRadius, color, size, orbitSpeed, setSelectedPlanetRef, hasRings, speedMultiplier }) {
  const planetRef = useRef();

  const handlePlanetClick = () => {
    if (planetRef.current) {
      setSelectedPlanetRef(planetRef);
    }
  };

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    planetRef.current.position.x = orbitRadius * Math.cos(time * orbitSpeed * speedMultiplier); // Aplicamos el multiplicador de velocidad
    planetRef.current.position.z = orbitRadius * Math.sin(time * orbitSpeed * speedMultiplier);
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
  const [speedMultiplier, setSpeedMultiplier] = useState(1.5); // Estado para el multiplicador de velocidad
  const orbitControlsRef = useRef();

  const handleSpeedChange = (e) => {
    setSpeedMultiplier(e.target.value);
  };

  // Datos de los planetas
  const planetsData = [
    { name: 'Sun', orbitRadius: 0, size: 2, color: 'yellow', orbitSpeed: 0 },
    { name: 'Mercury', orbitRadius: 8, size: 0.4, color: 'white', orbitSpeed: 0.24 },
    { name: 'Venus', orbitRadius: 12, size: 0.6, color: 'orange', orbitSpeed: 0.18 },
    { name: 'Earth', orbitRadius: 16, size: 0.65, color: 'blue', orbitSpeed: 0.16 },
    { name: 'Mars', orbitRadius: 21, size: 0.55, color: 'red', orbitSpeed: 0.13 },
    { name: 'Jupiter', orbitRadius: 35, size: 1.3, color: 'brown', orbitSpeed: 0.05 },
    { name: 'Saturn', orbitRadius: 55, size: 1.1, color: 'goldenrod', orbitSpeed: 0.03, hasRings: true },
    { name: 'Uranus', orbitRadius: 80, size: 0.8, color: 'lightblue', orbitSpeed: 0.01 },
    { name: 'Neptune', orbitRadius: 100, size: 0.8, color: 'darkblue', orbitSpeed: 0.006},
  ];

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* Slider para ajustar la velocidad */}
      <input
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        value={speedMultiplier}
        onChange={handleSpeedChange}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '300px',
          zIndex: 1, // Asegura que el slider esté por encima del canvas
        }}
      />
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'black', height: '100vh' }}
        onPointerMissed={() => setSelectedPlanetRef(null)}
      >
        <ambientLight intensity={0.3} />
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
            speedMultiplier={speedMultiplier} // Pasamos el multiplicador de velocidad
            hasRings={planetData.hasRings}
          />
        ))}
      </Canvas>
    </div>
  );
};


function App() {
  return (
    <div style={{ height: '100vh' }}>
      <SolarSystem />
    </div>
  );
}

export default App;
