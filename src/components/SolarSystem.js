// src/components/SolarSystem.js
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Ring from './Ring';
import Orbit from './Orbit';
import Planet from './Planet';
import AsteroidWithRef from './AsteroidWithRef';
import CameraZoomIn from './CameraZoomIn';
import CameraController from './CameraController';
import Recorridos from './Recorridos';
import TourList from './TourList';
import PlanetInfo from './PlanetInfo';

function SolarSystem() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.5);
  const [asteroidRefs, setAsteroidRefs] = useState({});
  const [planetRefs, setPlanetRefs] = useState({});
  const orbitControlsRef = useRef();
  const [asteroidsData, setAsteroidsData] = useState([]);
  const [language, setLanguage] = useState('spanish'); // Estado para el idioma seleccionado


  const [tourType, setTourType] = useState(null); // 'planetas', 'asteroides', or null
  const [tourIndex, setTourIndex] = useState(0);

  const handleSpeedChange = (e) => {
    setSpeedMultiplier(parseFloat(e.target.value));
  };
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
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
    const apiKey = 'kgqNA0vvMqyYCwufVZD8hKG64B5XeE99CXXiyubT'; // Reemplaza con tu propia API key de NASA

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

<select
  value={language}
  onChange={handleLanguageChange}
  style={{
    position: 'absolute',
    top: '20px', // Ajusta la distancia desde la parte superior según prefieras
    right: '20px', // Mantenerlo a la derecha de la pantalla
    zIndex: 1,
    padding: '5px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    border: '1px solid #fff',
    borderRadius: '5px',
    cursor: 'pointer', // Asegura que el puntero cambie a una mano
  }}
>
  <option value="spanish">Español</option>
  <option value="zapoteco">Zapoteco</option>
  <option value="english">English</option>
</select>



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
  idioma={language} // Aquí pasamos el valor del idioma, no la función
/>


      {/* Reemplazamos AsteroidList con TourList */}
      <TourList
        tourType={tourType}
        planetsData={planetsData}
        asteroidsData={asteroidsData}
        tourIndex={tourIndex}
        setTourIndex={setTourIndex}
        setSelectedObjectByIndex={setSelectedObjectByIndex}
        idioma={language}
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

export default SolarSystem;
