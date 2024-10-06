// App.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Componente para dibujar las órbitas como líneas
function Orbit({ radius }) {
  const points = useMemo(() => {
    const temp = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * 2 * Math.PI;
      temp.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return temp;
  }, [radius]);

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

// Componente Planet con texturas
function Planet({
  planetData,
  setSelectedObject,
  speedMultiplier,
  setHoveredObject,
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

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * speedMultiplier;
    const orbitPosition = time * planetData.orbitSpeed;

    planetRef.current.position.x =
      planetData.orbitRadius * Math.cos(orbitPosition);
    planetRef.current.position.z =
      planetData.orbitRadius * Math.sin(orbitPosition);

    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y +=
        planetData.rotationSpeed * speedMultiplier;
    }
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
}) {
  const asteroidRef = useRef();

  const orbitRadius =
    parseFloat(asteroidData.close_approach_data[0].miss_distance.kilometers) /
    100000; // Escalar distancia
  const orbitSpeed = 0.05 / (orbitRadius / 10);

  const initialAngle = useMemo(() => Math.random() * 2 * Math.PI, []);

  const handleAsteroidClick = () => {
    setSelectedObject({ ref: asteroidRef, data: asteroidData });
  };

  const handlePointerOver = () => {
    setHoveredObject(asteroidData.name);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHoveredObject(null);
    document.body.style.cursor = 'auto';
  };

  useEffect(() => {
    setAsteroidRefs((prevRefs) => ({
      ...prevRefs,
      [asteroidData.name]: asteroidRef,
    }));
  }, [asteroidData.name, setAsteroidRefs]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * speedMultiplier;
    const orbitPosition = initialAngle + time * orbitSpeed;

    const x = orbitRadius * Math.cos(orbitPosition);
    const z = orbitRadius * Math.sin(orbitPosition);

    asteroidRef.current.position.set(x, 0, z);
  });

  return (
    <mesh
      ref={asteroidRef}
      onClick={handleAsteroidClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={'white'} />
    </mesh>
  );
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
      const objectPosition = selectedObject.ref.current.position.clone();
      const offset = new THREE.Vector3(5, 5, 5);
      const desiredCameraPosition = objectPosition.clone().add(offset);

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
      const objectPosition = selectedObject.ref.current.position;
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.copy(objectPosition);
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
              const asteroidRef = asteroidRefs[asteroid.name];
              if (asteroidRef) {
                setSelectedObject({ ref: asteroidRef, data: asteroid });
              }
            }}
          >
            {asteroid.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Componente PlanetInfo para mostrar la información del planeta seleccionado
function PlanetInfo({ selectedObject, setSelectedObject }) {
  if (!selectedObject || !selectedObject.data) {
    return null;
  }

  const { data } = selectedObject;
  const isPlanet = data.textureUrl !== undefined; // Verificar si es un planeta

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
      <h2>{data.name}</h2>
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
      ) : (
        <>
          <p>
            <strong>Diámetro Estimado:</strong>{' '}
            {data.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
              2
            )}{' '}
            km
          </p>
          <p>
            <strong>Distancia de Aproximación:</strong>{' '}
            {parseFloat(
              data.close_approach_data[0].miss_distance.kilometers
            ).toFixed(2)}{' '}
            km
          </p>
          <p>
            <strong>Velocidad:</strong>{' '}
            {parseFloat(
              data.close_approach_data[0].relative_velocity
                .kilometers_per_hour
            ).toFixed(2)}{' '}
            km/h
          </p>
        </>
      )}
      <button
        onClick={() => setSelectedObject(null)}
        style={{ marginTop: '10px' }}
      >
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

  const handleSpeedChange = (e) => {
    setSpeedMultiplier(parseFloat(e.target.value));
  };

  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const startDate = getCurrentDate();
    const apiKey = 'DEMO_KEY'; // Reemplaza 'DEMO_KEY' con tu propia API key de NASA

    fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${startDate}&api_key=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        setAsteroidsData(data.near_earth_objects[startDate] || []);
      })
      .catch((error) => {
        console.error('Error fetching asteroid data:', error);
      });
  }, []);

  // Datos de los planetas con las URLs de las texturas
  const planetsData = [
    {
      name: 'Sun',
      orbitRadius: 0,
      size: 3,
      textureUrl: 'textures/Sun/2k_sun.jpg',
      orbitSpeed: 0,
      rotationSpeed: 0.0005,
    },
    {
      name: 'Mercury',
      orbitRadius: 6.245,
      size: 0.5,
      textureUrl: 'textures/Mercury/mercurymap.jpg',
      orbitSpeed: 0.207,
      rotationSpeed: 0.004,
    },
    {
      name: 'Venus',
      orbitRadius: 8.485,
      size: 1.2,
      textureUrl: 'textures/Venus/ven0aaa2.jpg',
      orbitSpeed: 0.0811,
      rotationSpeed: 0.003,
    },
    {
      name: 'Earth',
      orbitRadius: 10.0,
      size: 1.3,
      textureUrl: 'textures/Earth/ear0xuu2.jpg',
      orbitSpeed: 0.05,
      rotationSpeed: 0.002,
    },
    {
      name: 'Mars',
      orbitRadius: 12.329,
      size: 0.7,
      textureUrl: 'textures/Mars/2k_mars.jpg',
      orbitSpeed: 0.0266,
      rotationSpeed: 0.018,
    },
    {
      name: 'Jupiter',
      orbitRadius: 22.804,
      size: 3,
      textureUrl: 'textures/Jupiter/jup0vss1.jpg',
      orbitSpeed: 0.0042,
      rotationSpeed: 0.002,
      hasRings: true,
    },
    {
      name: 'Saturn',
      orbitRadius: 30.95,
      size: 2.5,
      textureUrl: 'textures/Saturn/sat0fds1.jpg',
      orbitSpeed: 0.001698,
      rotationSpeed: 0.0005,
      hasRings: true,
    },
    {
      name: 'Uranus',
      orbitRadius: 43.818,
      size: 1.7,
      textureUrl: 'textures/Uranus/uranusmap.jpg',
      orbitSpeed: 0.0005966,
      rotationSpeed: 0.03,
      hasRings: true,
    },
    {
      name: 'Neptune',
      orbitRadius: 54.82,
      size: 1.6,
      textureUrl: 'textures/Neptune/neptunemap.jpg',
      orbitSpeed: 0.000305,
      rotationSpeed: 0.029,
      hasRings: false,
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
          zIndex: 1,
        }}
      />

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

      {/* Mostrar información del planeta seleccionado */}
      <PlanetInfo
        selectedObject={selectedObject}
        setSelectedObject={setSelectedObject}
      />

      <AsteroidList
        asteroids={asteroidsData}
        setSelectedObject={setSelectedObject}
        asteroidRefs={asteroidRefs}
      />

      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'black', height: '100vh' }}
        onPointerMissed={resetCamera}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={1.5} />
        <OrbitControls ref={orbitControlsRef} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />

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
          />
        ))}

        {asteroidsData.map((asteroidData, index) => (
          <AsteroidWithRef
            key={index}
            asteroidData={asteroidData}
            speedMultiplier={speedMultiplier}
            setSelectedObject={setSelectedObject}
            setHoveredObject={setHoveredObject}
            setAsteroidRefs={setAsteroidRefs}
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
