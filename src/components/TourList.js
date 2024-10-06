// src/components/TourList.js
import React from 'react';

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

export default TourList;
