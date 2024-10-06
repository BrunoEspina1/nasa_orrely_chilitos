import React from 'react';
import traduccion from '../data/translations.json';

function PlanetInfo({ selectedObject, setSelectedObject, idioma }) {
  if (!selectedObject || !selectedObject.data) {
    return null;
  }

  const { data } = selectedObject;
  const isPlanet = data.textureUrl !== undefined && data.estimated_diameter === undefined;

  // Traducciones de etiquetas
  const labels = {
    diameter: {
      english: 'Diameter',
      spanish: 'Diámetro',
      zapoteco: 'Diámetru',
    },
    distance_to_sun: {
      english: 'Distance to Sun',
      spanish: 'Distancia al Sol',
      zapoteco: 'Nabé zitu nuu Gubidxa',
    },
    year_duration: {
      english: 'Year Duration',
      spanish: 'Duración del año',
      zapoteco: 'Duración stiʼ iza',
    },
    day_duration: {
      english: 'Day Duration',
      spanish: 'Duración del día',
      zapoteco: 'Duración stiʼ ti dxi',
    },
    temperature_max_day: {
      english: 'Max Day Temperature',
      spanish: 'Temperatura máxima del día',
      zapoteco: 'Temperatura jma naroʼbaʼ stiʼ dxi',
    },
    temperature_min_night: {
      english: 'Min Night Temperature',
      spanish: 'Temperatura mínima de la noche',
      zapoteco: 'Temperatura ni jma nahuiiniʼ ti gueelaʼ',
    },
    number_of_moons: {
      english: 'Number of Moons',
      spanish: 'Número de lunas',
      zapoteco: 'Número stiʼ ca beeu',
    },
    atmosphere: {
      english: 'Atmosphere',
      spanish: 'Atmósfera',
      zapoteco: 'Atmósfera',
    },
    age: {
      english: 'Age',
      spanish: 'Edad',
      zapoteco: 'Edad stiʼ',
    },
    core_material: {
      english: 'Core Material',
      spanish: 'Material del núcleo',
      zapoteco: 'Material stiʼ núcleo',
    },
    facts: {
      english: 'Facts',
      spanish: 'Curiosidades',
      zapoteco: 'Curiosidades',
    },
  };

  let name = data.name;
  let translatedName;
  let diameter;
  let distance_to_sun;
  let age;
  let facts;

  // Datos específicos para planetas
  let year_duration;
  let day_duration;
  let temperature_max_day;
  let temperature_min_night;
  let number_of_moons;
  let atmosphere;
  let core_material;

  if (name === 'Sun') {
    // Datos específicos del Sol según el idioma
    const sunData = traduccion.solar_system.sun;
    translatedName = sunData.name[idioma];
    diameter = sunData.diameter[idioma];
    distance_to_sun = sunData.average_distance_from_earth[idioma];
    age = sunData.age[idioma];
    facts = sunData.facts[idioma];
  } else {
    // Datos de los planetas según el idioma
    const planetData = traduccion.solar_system.planets.find(
      (planet) => planet.name.english.toLowerCase() === name.toLowerCase()
    );

    if (planetData) {
      translatedName = planetData.name[idioma];
      diameter = planetData.diameter[idioma];
      distance_to_sun = planetData.distance_to_sun[idioma];
      year_duration = planetData.year_duration[idioma];
      day_duration = planetData.day_duration[idioma];
      temperature_max_day = planetData.temperature_max_day ? planetData.temperature_max_day[idioma] : 'N/A';
      temperature_min_night = planetData.temperature_min_night ? planetData.temperature_min_night[idioma] : 'N/A';
      number_of_moons = planetData.number_of_moons[idioma];
      atmosphere = planetData.atmosphere[idioma];
      age = planetData.age ? planetData.age[idioma] : 'N/A';
      core_material = planetData.core_material ? planetData.core_material[idioma] : 'N/A';
      facts = planetData.facts[idioma];
    }
  }

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
      <h2>{translatedName}</h2>
      <p>
        <strong>{labels.diameter[idioma]}:</strong> {diameter}
      </p>
      <p>
        <strong>{labels.distance_to_sun[idioma]}:</strong> {distance_to_sun}
      </p>
      {isPlanet && (
        <>
          {year_duration && (
            <p>
              <strong>{labels.year_duration[idioma]}:</strong> {year_duration}
            </p>
          )}
          {day_duration && (
            <p>
              <strong>{labels.day_duration[idioma]}:</strong> {day_duration}
            </p>
          )}
          {temperature_max_day && (
            <p>
              <strong>{labels.temperature_max_day[idioma]}:</strong> {temperature_max_day}
            </p>
          )}
          {temperature_min_night && (
            <p>
              <strong>{labels.temperature_min_night[idioma]}:</strong> {temperature_min_night}
            </p>
          )}
          {number_of_moons && (
            <p>
              <strong>{labels.number_of_moons[idioma]}:</strong> {number_of_moons}
            </p>
          )}
          {atmosphere && (
            <p>
              <strong>{labels.atmosphere[idioma]}:</strong> {atmosphere}
            </p>
          )}
          {core_material && (
            <p>
              <strong>{labels.core_material[idioma]}:</strong> {core_material}
            </p>
          )}
        </>
      )}
      <p>
        <strong>{labels.age[idioma]}:</strong> {age}
      </p>
      <p>
        <strong>{labels.facts[idioma]}:</strong> {facts}
      </p>
      <button onClick={() => setSelectedObject(null)} style={{ marginTop: '10px' }}>
        Cerrar
      </button>
    </div>
  );
}

export default PlanetInfo;
