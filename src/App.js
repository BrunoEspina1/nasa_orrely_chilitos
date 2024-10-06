// App.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Importa el archivo JSON de los asteroides
import asteroidsDataJson from './asteroids_data.json';

// Componente para dibujar las órbitas como líneas
function Orbit({ radius, position = [0, 0, 0] }) {
  const points = useMemo(() => {
    const temp = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * 2 * Math.PI;
      temp.push(
        new THREE.Vector3(
          Math.cos(angle) * radius + position[0],
          position[1],
          Math.sin(angle) * radius + position[2]
        )
      );
    }
    return temp;
  }, [radius, position]);

  const orbitGeometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points]
  );

  return (
    <line geometry={orbitGeometry}>
      <lineBasicMaterial color="white" transparent={true} opacity={0.3} />
    </line>
  );
}

// Componente Moon
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

// Componente Planet con texturas y lunas
function Planet({
  planetData,
  setSelectedObject,
  speedMultiplier,
  setHoveredObject,
  planetRef, // <-- Aceptamos planetRef
}) {
  const planetGroupRef = useRef(); // <-- useRef() se llama incondicionalmente
  const planetMeshRef = useRef();
  const texture = useLoader(THREE.TextureLoader, planetData.textureUrl);

  // Sincronizamos planetRef si está definido
  useEffect(() => {
    if (planetRef) {
      planetRef.current = planetGroupRef.current;
    }
  }, [planetRef]);

  const handlePlanetClick = () => {
    if (planetGroupRef.current) {
      setSelectedObject({ ref: planetGroupRef, data: planetData });
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

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * speedMultiplier;
    const orbitPosition = time * planetData.orbitSpeed;
    planetGroupRef.current.rotation.y += planetData.rotationSpeed * speedMultiplier;
    planetGroupRef.current.position.x =
      planetData.orbitRadius * Math.cos(orbitPosition);
    planetGroupRef.current.position.z =
      planetData.orbitRadius * Math.sin(orbitPosition);
  });

  return (
    <group ref={planetGroupRef}>
      <mesh
        onClick={handlePlanetClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        ref={planetMeshRef}
      >
        <sphereGeometry args={[planetData.size, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>

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

// Componente para cada asteroide con su referencia
function AsteroidWithRef({
  asteroidData,
  speedMultiplier,
  setSelectedObject,
  setHoveredObject,
  setAsteroidRefs,
  earthRef, // <-- Aceptamos earthRef
}) {
  const asteroidRef = useRef();
  const initialAngle = useMemo(() => Math.random() * 2 * Math.PI, []);

  // Ajustamos para que los asteroides orbiten alrededor de la Tierra
  const orbitRadius = 4 + Math.random() * 2; // Entre 4 y 6 unidades para evitar solapamiento con la Tierra
  const orbitSpeed = 0.01 + Math.random() * 0.005; // Velocidad orbital

  // Cargar la textura de la Luna para los asteroides
  const asteroidTexture = useLoader(THREE.TextureLoader, 'textures/Moon/2k_moon.jpg'); // <-- Cambio: Usar textura de la Luna

  const handleAsteroidClick = () => {
    setSelectedObject({ ref: asteroidRef, data: asteroidData });
  };

  const handlePointerOver = () => {
    setHoveredObject(asteroidData.fullname || asteroidData.des || asteroidData.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHoveredObject(null);
    document.body.style.cursor = 'auto';
  };

  useEffect(() => {
    setAsteroidRefs((prevRefs) => ({
      ...prevRefs,
      [asteroidData.id]: asteroidRef,
    }));
  }, [asteroidData.id, setAsteroidRefs]);

  useFrame(({ clock }) => {
    if (earthRef.current) {
      const time = clock.getElapsedTime() * speedMultiplier;
      const orbitPosition = initialAngle + time * orbitSpeed;
      const x = orbitRadius * Math.cos(orbitPosition);
      const z = orbitRadius * Math.sin(orbitPosition);

      const earthPosition = new THREE.Vector3();
      earthRef.current.getWorldPosition(earthPosition);

      asteroidRef.current.position.set(
        earthPosition.x + x,
        earthPosition.y,
        earthPosition.z + z
      );
    }
  });

  return (
    <mesh
      ref={asteroidRef}
      onClick={handleAsteroidClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Ajuste del factor de escala a 0.2 para hacer los asteroides más pequeños */}
      <sphereGeometry args={[asteroidData.diameter * 2 || 0.5, 20, 20]} /> {/* <-- Tamaño ajustado y mayor detalle de geometría */}
      
      {/* Aplicar la textura de la Luna */}
      <meshStandardMaterial
        map={asteroidTexture}
        // Si la textura no está cargada, usar un color gris para asegurar visibilidad
        color={asteroidTexture ? undefined : 'gray'}
      />
    </mesh>
  );
}

function CameraZoomIn({ orbitControlsRef }) {
  const { camera } = useThree();
  const [isZooming, setIsZooming] = useState(true);

  // Posición inicial más lejana
  const initialPosition = new THREE.Vector3(1250, 1250, 1250);

  // Posición final
  const finalPosition = new THREE.Vector3(50, 50, 50);

  const totalDuration = 2;
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    camera.position.copy(initialPosition);
  }, [camera]);

  useFrame((_, delta) => {
    if (isZooming) {
      const timeFactor = elapsedTime / totalDuration;
      if (timeFactor < 1) {
        camera.position.lerpVectors(initialPosition, finalPosition, timeFactor);
        setElapsedTime((prev) => prev + delta);
      } else {
        camera.position.copy(finalPosition);
        setIsZooming(false);
      }

      camera.lookAt(0, 0, 0);
    }
    if (orbitControlsRef.current) {
      orbitControlsRef.current.update();
    }
  });

  return null;
}

// Componente para controlar la cámara y seguir al objeto seleccionado
function CameraController({ selectedObject, orbitControlsRef }) {
  const { camera } = useThree();
  const [isMovingToObject, setIsMovingToObject] = useState(false);
  const [targetCameraPosition, setTargetCameraPosition] = useState(
    new THREE.Vector3()
  );

  useEffect(() => {
    if (selectedObject && selectedObject.ref && selectedObject.ref.current) {
      const objectWorldPosition = new THREE.Vector3();
      selectedObject.ref.current.getWorldPosition(objectWorldPosition);
      const offset = new THREE.Vector3(5, 5, 5);
      const desiredCameraPosition = objectWorldPosition.clone().add(offset);
      setTargetCameraPosition(desiredCameraPosition);
      setIsMovingToObject(true);
    } else {
      const initialPosition = new THREE.Vector3(10, 10, 10);
      setTargetCameraPosition(initialPosition);
      setIsMovingToObject(true);
    }
  }, [selectedObject]);

  useFrame(() => {
    if (isMovingToObject) {
      camera.position.lerp(targetCameraPosition, 0.1);
      if (camera.position.distanceTo(targetCameraPosition) < 0.01) {
        camera.position.copy(targetCameraPosition);
        setIsMovingToObject(false);
      }
    }
    if (selectedObject && selectedObject.ref && selectedObject.ref.current) {
      const objectWorldPosition = new THREE.Vector3();
      selectedObject.ref.current.getWorldPosition(objectWorldPosition);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.copy(objectWorldPosition);
        orbitControlsRef.current.update();
      }
    }
  });

  return null;
}

// Componente para mostrar la lista de asteroides
function AsteroidList({ asteroids, setSelectedObject, asteroidRefs }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        zIndex: 10,
        borderRadius: '5px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <h3>Asteroides</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {asteroids.map((asteroid, index) => (
          <li
            key={index}
            style={{ cursor: 'pointer', marginBottom: '5px' }}
            onClick={() => {
              const asteroidRef = asteroidRefs[asteroid.id];
              if (asteroidRef && asteroidRef.current) {
                setSelectedObject({ ref: asteroidRef, data: asteroid });
              }
            }}
          >
            {asteroid.fullname || asteroid.des || asteroid.id}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Componente PlanetInfo para mostrar la información del planeta, luna o asteroide seleccionado
function PlanetInfo({ selectedObject, setSelectedObject }) {
  if (!selectedObject || !selectedObject.data) {
    return null;
  }

  const { data } = selectedObject;
  const isAsteroid = data.diameter !== undefined;
  const isPlanet =
    data.textureUrl !== undefined && data.estimated_diameter === undefined;

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        zIndex: 10,
        borderRadius: '5px',
        width: '300px',
      }}
    >
      <h2>{data.fullname || data.name}</h2>
      {isPlanet ? (
        <>
          <p>
            <strong>Tamaño:</strong> {data.size}
          </p>
          <p>
            <strong>Radio de Órbita:</strong> {data.orbitRadius}
          </p>
          <p>
            <strong>Velocidad de Rotación:</strong> {data.rotationSpeed}
          </p>
          <p>
            <strong>Velocidad Orbital:</strong> {data.orbitSpeed}
          </p>
        </>
      ) : isAsteroid ? (
        <>
          <p>
            <strong>Diámetro:</strong> {data.diameter} km
          </p>
          <p>
            <strong>Probabilidad de Impacto (IP):</strong> {data.ip}
          </p>
          <p>
            <strong>Velocidad relativa (v_inf):</strong> {data.v_inf} km/s
          </p>
          <p>
            <strong>Número de impactos previstos (n_imp):</strong> {data.n_imp}
          </p>
          <p>
            <strong>Última observación:</strong> {data.last_obs}
          </p>
        </>
      ) : (
        <p>Información no disponible.</p>
      )}
      <button onClick={() => setSelectedObject(null)} style={{ marginTop: '10px' }}>
        Cerrar
      </button>
    </div>
  );
}

function SolarSystem() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.5);
  const [asteroidRefs, setAsteroidRefs] = useState({});
  const orbitControlsRef = useRef();
  const [asteroidsData, setAsteroidsData] = useState([]);
  const [showAsteroids, setShowAsteroids] = useState(true);
  const earthRef = useRef(); // <-- Referencia a la Tierra

  const handleSpeedChange = (e) => {
    setSpeedMultiplier(parseFloat(e.target.value));
  };

  useEffect(() => {
    // Combinar los asteroides cercanos y potencialmente peligrosos
    const combinedAsteroids = [
      ...asteroidsDataJson.near_earth_asteroids,
      ...asteroidsDataJson.potentially_hazardous_asteroids,
    ];

    setAsteroidsData(combinedAsteroids);
  }, []);

  // Datos de los planetas con las URLs de las texturas y lunas
  const planetsData = [
    {
      name: 'Sun',
      orbitRadius: 0,
      size: 6.0,
      textureUrl: 'textures/Sun/2k_sun.jpg',
      orbitSpeed: 0,
      rotationSpeed: 0.0005,
    },
    {
      name: 'Mercury',
      orbitRadius: 12.0,
      size: 0.45,
      textureUrl: 'textures/Mercury/mercurymap.jpg',
      orbitSpeed: 0.0047,
      rotationSpeed: 0.004,
    },
    {
      name: 'Venus',
      orbitRadius: 18.0,
      size: 1.125,
      textureUrl: 'textures/Venus/ven0aaa2.jpg',
      orbitSpeed: 0.0035,
      rotationSpeed: 0.003,
    },
    {
      name: 'Earth',
      orbitRadius: 24.0,
      size: 1.2,
      textureUrl: 'textures/Earth/ear0xuu2.jpg',
      orbitSpeed: 0.003,
      rotationSpeed: 0.002,
      moons: [
        {
          name: 'Luna',
          orbitRadius: 2.0,
          size: 0.3,
          textureUrl: 'textures/Moon/2k_moon.jpg',
          orbitSpeed: 0.01,
          rotationSpeed: 0.01,
        },
      ],
    },
    {
      name: 'Mars',
      orbitRadius: 30.0,
      size: 0.6,
      textureUrl: 'textures/Mars/2k_mars.jpg',
      orbitSpeed: 0.0024,
      rotationSpeed: 0.018,
      moons: [
        {
          name: 'Fobos',
          orbitRadius: 1.5,
          size: 0.1,
          textureUrl: 'textures/Moon/2k_moon.jpg',
          orbitSpeed: 0.02,
          rotationSpeed: 0.01,
        },
        {
          name: 'Deimos',
          orbitRadius: 2.5,
          size: 0.1,
          textureUrl: 'textures/Moon/2k_moon.jpg',
          orbitSpeed: 0.015,
          rotationSpeed: 0.01,
        },
      ],
    },
    {
      name: 'Jupiter',
      orbitRadius: 45.0,
      size: 3.0,
      textureUrl: 'textures/Jupiter/jup0vss1.jpg',
      orbitSpeed: 0.0013,
      rotationSpeed: 0.002,
      moons: [
        {
          name: 'Ganímedes',
          orbitRadius: 4.0,
          size: 0.4,
          textureUrl: 'textures/Moon/2k_moon.jpg',
          orbitSpeed: 0.008,
          rotationSpeed: 0.01,
        },
        {
          name: 'Calisto',
          orbitRadius: 5.0,
          size: 0.38,
          textureUrl: 'textures/Moon/2k_moon.jpg',
          orbitSpeed: 0.007,
          rotationSpeed: 0.01,
        },
        // Puedes agregar más lunas si lo deseas
      ],
    },
    {
      name: 'Saturn',
      orbitRadius: 67.5,
      size: 2.7,
      textureUrl: 'textures/Saturn/sat0fds1.jpg',
      orbitSpeed: 0.00096,
      rotationSpeed: 0.0005,
      moons: [
        {
          name: 'Titán',
          orbitRadius: 3.5,
          size: 0.35,
          textureUrl: 'textures/Moon/2k_moon.jpg',
          orbitSpeed: 0.009,
          rotationSpeed: 0.01,
        },
        // Puedes agregar más lunas si lo deseas
      ],
    },
    {
      name: 'Uranus',
      orbitRadius: 90.0,
      size: 1.5,
      textureUrl: 'textures/Uranus/uranusmap.jpg',
      orbitSpeed: 0.00068,
      rotationSpeed: 0.03,
      moons: [
        {
          name: 'Titania',
          orbitRadius: 3.0,
          size: 0.2,
          textureUrl: 'textures/Moon/2k_moon.jpg',
          orbitSpeed: 0.01,
          rotationSpeed: 0.01,
        },
        // Puedes agregar más lunas si lo deseas
      ],
    },
    {
      name: 'Neptune',
      orbitRadius: 112.5,
      size: 1.425,
      textureUrl: 'textures/Neptune/neptunemap.jpg',
      orbitSpeed: 0.00054,
      rotationSpeed: 0.029,
      moons: [
        {
          name: 'Tritón',
          orbitRadius: 3.0,
          size: 0.2,
          textureUrl: 'textures/Moon/2k_moon.jpg',
          orbitSpeed: 0.01,
          rotationSpeed: 0.01,
        },
        // Puedes agregar más lunas si lo deseas
      ],
    },
  ];

  // Función para restablecer la cámara al hacer clic fuera de los objetos
  const resetCamera = () => {
    setSelectedObject(null);
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <input
        type="range"
        min="1"
        max="50"
        step="1"
        value={speedMultiplier}
        onChange={handleSpeedChange}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '300px',
          zIndex: 1,
        }}
      />
      <button
        onClick={() => setShowAsteroids(!showAsteroids)}
        style={{
          position: 'absolute',
          top: '60px',
          left: '20px',
          zIndex: 1,
        }}
      >
        {showAsteroids ? 'Ocultar Asteroides' : 'Mostrar Asteroides'}
      </button>

      {/* Mostrar el nombre del objeto sobre el que estamos pasando el mouse */}
      {hoveredObject && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '5px',
          }}
        >
          {hoveredObject}
        </div>
      )}

      {/* Mostrar información del planeta, luna o asteroide seleccionado */}
      <PlanetInfo
        selectedObject={selectedObject}
        setSelectedObject={setSelectedObject}
      />

      {showAsteroids && (
        <AsteroidList
          asteroids={asteroidsData}
          setSelectedObject={setSelectedObject}
          asteroidRefs={asteroidRefs}
        />
      )}

      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'black', height: '100vh' }}
        onPointerMissed={resetCamera}
      >
        {/* Iluminación Mejorada */}
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={1.5} />
        <directionalLight position={[100, 100, 100]} intensity={0.5} />
        <directionalLight position={[-100, -100, -100]} intensity={0.5} />

        <OrbitControls ref={orbitControlsRef} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />

        {/* Componente de zoom inicial */}
        <CameraZoomIn orbitControlsRef={orbitControlsRef} />

        <CameraController
          selectedObject={selectedObject}
          orbitControlsRef={orbitControlsRef}
        />

        {planetsData
          .filter((planet) => planet.orbitRadius > 0)
          .map((planet, index) => (
            <Orbit key={`orbit-${index}`} radius={planet.orbitRadius} />
          ))}

        {planetsData.map((planetData, index) => (
          <Planet
            key={index}
            setSelectedObject={setSelectedObject}
            planetData={planetData}
            speedMultiplier={speedMultiplier}
            setHoveredObject={setHoveredObject}
            planetRef={planetData.name === 'Earth' ? earthRef : undefined} // <-- Pasamos earthRef
          />
        ))}

        {showAsteroids &&
          asteroidsData.map((asteroidData, index) => (
            <AsteroidWithRef
              key={index}
              asteroidData={asteroidData}
              speedMultiplier={speedMultiplier}
              setSelectedObject={setSelectedObject}
              setHoveredObject={setHoveredObject}
              setAsteroidRefs={setAsteroidRefs}
              earthRef={earthRef} // <-- Pasamos earthRef
            />
          ))}
      </Canvas>
    </div>
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
