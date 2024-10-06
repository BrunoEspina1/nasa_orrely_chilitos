import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';


// Componente Ring Mejorado
function Ring({ rings }) {
  const ringRef = useRef();
  const ringTexture = useLoader(THREE.TextureLoader, rings.textureUrl);

  // Crear una geometría de anillo personalizada
  const ringGeometry = useMemo(() => {
    const geometry = new THREE.RingGeometry(
      rings.innerRadius,
      rings.outerRadius,
      64, // Mayor resolución para suavizar
      1,
      0,
      Math.PI * 2
    );

    // Obtener los atributos de posición y UV
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    // Ajustar las coordenadas UV en función de la distancia radial
    for (let i = 0; i < position.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
      const distance = vertex.length();
      // Si la distancia es menor que un umbral, asignar UV diferentes
      if (distance < (rings.innerRadius + rings.outerRadius) / 2) {
        uv.setXY(i, 0, 1);
      } else {
        uv.setXY(i, 1, 1);
      }
    }

    geometry.attributes.uv.needsUpdate = true;
    return geometry;
  }, [rings.innerRadius, rings.outerRadius]);

  // Material optimizado para los anillos
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8, // Ajusta la opacidad según tus necesidades
        depthWrite: false,
        blending: THREE.NormalBlending,
        metalness: 0.0,
        roughness: 1.0,
      }),
    [ringTexture]
  );

  return (
    <mesh
      ref={ringRef}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={ringGeometry}
      material={ringMaterial}
    />
  );
}



// Componente para dibujar las órbitas como líneas
function Orbit({ radius }) {
  const points = useMemo(() => {
    const temp = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * 2 * Math.PI;
      temp.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        )
      );
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
// Componente Planet con texturas, lunas y anillos
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
      {planetData.rings && (
        <Ring rings={planetData.rings} />
      )}

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
}) {
  const asteroidRef = useRef();
  const orbitRadius =
    parseFloat(asteroidData.close_approach_data[0].miss_distance.kilometers) /
    100000;
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
      
      const objectSize = selectedObject.data.size || 1;
      
      // Puedes ajustar el multiplicador según tus necesidades
      let offsetMultiplier = 3;
      if (selectedObject.data.name === 'Sun') {
        offsetMultiplier = 2; // Mayor distancia para el Sol
      }
      
      const offset = new THREE.Vector3(
        offsetMultiplier * objectSize,
        offsetMultiplier * objectSize,
        offsetMultiplier * objectSize
      );
      
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


// Componente Recorridos
function Recorridos({ setTourType, setTourIndex }) {
  const [showOptions, setShowOptions] = useState(false);

  const handleRecorridosClick = () => {
    if (showOptions) {
      // Si el menú está abierto y se hace clic, cierra el TourList
      setTourType(null);  // Esto cierra el TourList
    }
    setShowOptions(!showOptions);  // Alterna el estado del menú
  };

  const handleOptionClick = (type) => {
    setTourType(type); // 'planetas' o 'asteroides'
    setTourIndex(0);
    setShowOptions(false); // Cierra el menú al seleccionar una opción
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        left: '20px', // Cambiado a la izquierda
        padding: '10px',
        zIndex: 10,
      }}
    >
      <button
        onClick={handleRecorridosClick}
        style={{
          backgroundColor: '#1B3262', // Mejor diseño del botón
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Recorridos
      </button>
      {showOptions && (
        <div
          style={{
            marginTop: '5px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            borderRadius: '5px',
            padding: '10px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              cursor: 'pointer',
              marginBottom: '5px',
              padding: '5px',
              borderBottom: '1px solid #fff',
            }}
            onClick={() => handleOptionClick('planetas')}
          >
            Planetas
          </div>
          <div
            style={{
              cursor: 'pointer',
              padding: '5px',
            }}
            onClick={() => handleOptionClick('asteroides')}
          >
            Asteroides
          </div>
        </div>
      )}
    </div>
  );
}


// Componente TourList
// Componente TourList
function TourList({
  tourType,
  planetsData,
  asteroidsData,
  tourIndex,
  setTourIndex,
  setSelectedObjectByIndex,
}) {
  if (!tourType) return null;

  const dataList = tourType === 'planetas' ? planetsData : asteroidsData;

  const handleItemClick = (index) => {
    setTourIndex(index);
    setSelectedObjectByIndex(index);
  };

  const handleNextClick = () => {
    const nextIndex = (tourIndex + 1) % dataList.length;
    setTourIndex(nextIndex);
    setSelectedObjectByIndex(nextIndex);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '120px',
        left: '20px', // Cambiado a la izquierda
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        zIndex: 10,
        borderRadius: '5px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      <h3 style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        {tourType === 'planetas' ? 'Planetas' : 'Asteroides'}
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {dataList.map((item, index) => (
          <li
            key={index}
            style={{
              cursor: 'pointer',
              marginBottom: '5px',
              fontWeight: index === tourIndex ? 'bold' : 'normal',
              padding: '5px',
              borderBottom: '1px solid #fff',
            }}
            onClick={() => handleItemClick(index)}
          >
            {item.name}
          </li>
        ))}
      </ul>
      <button
        onClick={handleNextClick}
        style={{
          marginTop: '10px',
          backgroundColor: '#1B3262', // Mejor diseño del botón
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Siguiente
      </button>
    </div>
  );
}


// Componente PlanetInfo para mostrar la información del planeta o luna seleccionada
function PlanetInfo({ selectedObject, setSelectedObject }) {
  if (!selectedObject || !selectedObject.data) {
    return null;
  }

  const { data } = selectedObject;
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
  const [planetRefs, setPlanetRefs] = useState({});
  const orbitControlsRef = useRef();
  const [asteroidsData, setAsteroidsData] = useState([]);

  const [tourType, setTourType] = useState(null); // 'planetas', 'asteroides', or null
  const [tourIndex, setTourIndex] = useState(0);

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
    const apiKey = 'kgqNA0vvMqyYCwufVZD8hKG64B5XeE99CXXiyubT'; // Reemplaza 'DEMO_KEY' con tu propia API key de NASA

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
      textureUrl: 'textures/saturnmap.jpg',
      orbitSpeed: 0.00096,
      rotationSpeed: 0.0005,
      rings: {
        innerRadius: 3.0,
        outerRadius: 5.0,
        textureUrl: 'textures/anillito.gif', // Asegúrate de tener esta textura
      },
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
      rings: {
        innerRadius: 2.0,
        outerRadius: 3.0,
        textureUrl: 'textures/uranusringtrans.gif', // Asegúrate de tener esta textura
      },
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
  

  const setSelectedObjectByIndex = (index) => {
    if (tourType === 'planetas') {
      const planetName = planetsData[index].name;
      const planetRef = planetRefs[planetName];
      if (planetRef) {
        setSelectedObject({ ref: planetRef, data: planetsData[index] });
      }
    } else if (tourType === 'asteroides') {
      const asteroidName = asteroidsData[index].name;
      const asteroidRef = asteroidRefs[asteroidName];
      if (asteroidRef) {
        setSelectedObject({ ref: asteroidRef, data: asteroidsData[index] });
      }
    }
  };

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

      {/* Mostrar información del planeta o luna seleccionada */}
      <PlanetInfo
        selectedObject={selectedObject}
        setSelectedObject={setSelectedObject}
      />

      {/* Reemplazamos AsteroidList con TourList */}
      <TourList
        tourType={tourType}
        planetsData={planetsData}
        asteroidsData={asteroidsData}
        tourIndex={tourIndex}
        setTourIndex={setTourIndex}
        setSelectedObjectByIndex={setSelectedObjectByIndex}
      />

      {/* Agregamos el componente Recorridos */}
      <Recorridos setTourType={setTourType} setTourIndex={setTourIndex} />

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
            setPlanetRefs={setPlanetRefs}
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