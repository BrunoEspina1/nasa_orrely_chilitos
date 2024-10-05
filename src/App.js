  import React, { useRef, useEffect, useState } from 'react';
  import { Canvas, useFrame, useThree } from '@react-three/fiber';
  import { OrbitControls, Stars } from '@react-three/drei';
  import * as THREE from 'three';

  function Planet({ orbitRadius, textureUrl,ringTextureUrl, size, orbitSpeed, setSelectedPlanetRef, hasRings }) {
    const planetRef = useRef();
    const [texture, setTexture] = useState(null);
    const [ringTexture, setRingTexture] = useState(null); // Estado para la textura de los anillos


    useEffect(() => {
      // Cargar la textura usando TextureLoader
      const loader = new THREE.TextureLoader();
      
      // Cargar la textura
      loader.load(
        textureUrl,
        (loadedTexture) => {
          setTexture(loadedTexture); // Si la carga es exitosa, actualiza el estado
        },
        undefined, // Puedes dejar esto como undefined si no necesitas un callback de progreso
        (error) => {
          console.error('Error al cargar la textura:', error); // Manejo de errores
        }
      );
      // Cargar la textura para los anillos
      if (hasRings) {
        loader.load(
          ringTextureUrl,
          (loadedRingTexture) => {
            setRingTexture(loadedRingTexture);
          },
          undefined,
          (error) => {
            console.error('Error al cargar la textura de los anillos:', error);
          }
        );
      }

      return () => {
        if (texture) {
          texture.dispose();
        }
        if (ringTexture) {
          ringTexture.dispose();
        }
      };
    }, [textureUrl, ringTextureUrl, hasRings]);



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
          <meshStandardMaterial map={texture} />
        </mesh>
        {hasRings && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.2, size * 2, 32]} />
            <meshStandardMaterial map={ringTexture} side={THREE.DoubleSide} transparent opacity={0.7} /> {/* Aplica la textura de los anillos */}
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

    // Datos de los planetas con las URL de las texturas
    const planetsData = [
      {
        name: 'Sun',
        orbitRadius: 0,
        size: 2,
        textureUrl: 'textures/Sun/sunmap.jpg', // Suponiendo que tienes una textura para el sol
        orbitSpeed: 0,
      },
      {
        name: 'Mercury',
        orbitRadius: 3,
        size: 0.2,
        textureUrl: '/textures/Mercury/mercurymap.jpg',
        orbitSpeed: 0.04,
      },
      {
        name: 'Venus',
        orbitRadius: 5,
        size: 0.5,
        textureUrl: 'textures/Venus/ven0aaa2.jpg',
        orbitSpeed: 0.03,
      },
      {
        name: 'Earth',
        orbitRadius: 7,
        size: 0.5,
        textureUrl: 'textures/Earth/ear0xuu2.jpg',
        orbitSpeed: 0.02,
      },
      {
        name: 'Mars',
        orbitRadius: 9,
        size: 0.3,
        textureUrl: 'textures/Mars/2k_mars.jpg',
        orbitSpeed: 0.015,
      },
      {
        name: 'Jupiter',
        orbitRadius: 12,
        size: 1,
        textureUrl: 'textures/Jupiter/jup0vss1.jpg',
        ringTextureUrl: 'textures/Jupiter/JupiterRings.jpg',
        orbitSpeed: 0.008,
      },
      {
        name: 'Saturn',
        orbitRadius: 15,
        size: 0.9,
        textureUrl: 'textures/Saturn/sat0fds1.jpg',
        orbitSpeed: 0.006,
        hasRings: true,
      },
      {
        name: 'Uranus',
        orbitRadius: 18,
        size: 0.4,
        textureUrl: '/textures/Uranus/uranusmap.jpg',
        orbitSpeed: 0.004,
      },
      {
        name: 'Neptune',
        orbitRadius: 21,
        size: 0.4,
        textureUrl: '/textures/Neptune/neptunemap.jpg',
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
            textureUrl={planetData.textureUrl} // Pasamos la URL de la textura
            size={planetData.size}
            orbitSpeed={planetData.orbitSpeed}
            hasRings={planetData.hasRings}
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
