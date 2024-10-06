import React from 'react';
import traduccion from '../data/translations.json';

function TourList({
  tourType,
  planetsData,
  asteroidsData,
  tourIndex,
  setTourIndex,
  setSelectedObjectByIndex,
  idioma
}) {
  if (!tourType) return null;

  const dataList = tourType === 'planetas' ? planetsData : asteroidsData;

  // Listas para los nombres de los planetas y del Sol traducidos
  const planetasSpanish = [];
  const planetasEnglish = [];
  const planetasZapotecos = [];

  // Incluir el nombre del Sol al inicio de las listas de nombres
  const sunData = traduccion.solar_system.sun;
  planetasSpanish.push(sunData.name.spanish);
  planetasEnglish.push(sunData.name.english);
  planetasZapotecos.push(sunData.name.zapoteco);

  // Poblar las listas de nombres desde el JSON de traducción
  const planetCount = traduccion.solar_system.planets.length;
  for (let i = 0; i < planetCount; i++) {
    const planet = traduccion.solar_system.planets[i];
    planetasSpanish.push(planet.name.spanish);
    planetasEnglish.push(planet.name.english);
    planetasZapotecos.push(planet.name.zapoteco);
  }

  // Traducción de las etiquetas
  const labels = {
    planets: {
      english: 'Planets',
      spanish: 'Planetas',
      zapoteco: 'Planetas' // Puedes ajustar aquí la traducción en zapoteco si es distinta
    },
    next: {
      english: 'Next',
      spanish: 'Siguiente',
      zapoteco: 'Sicarú' // Traducción al zapoteco si la tienes disponible
    }
  };

  // Seleccionar la lista de nombres de acuerdo al idioma
  let planetNames;
  if (idioma === 'spanish') {
    planetNames = planetasSpanish;
  } else if (idioma === 'zapoteco') {
    planetNames = planetasZapotecos;
  } else {
    planetNames = planetasEnglish;
  }

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
        left: '20px',
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
        {tourType === 'planetas' ? labels.planets[idioma] : 'Asteroides'}
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
            {/* Mostrar el nombre traducido del planeta o el Sol según el idioma */}
            {tourType === 'planetas' ? planetNames[index] : item.name}
          </li>
        ))}
      </ul>
      <button
        onClick={handleNextClick}
        style={{
          marginTop: '10px',
          backgroundColor: '#1B3262',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {labels.next[idioma]}
      </button>
    </div>
  );
}

export default TourList;
