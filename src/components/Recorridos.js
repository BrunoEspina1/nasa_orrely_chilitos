// src/components/Recorridos.js
import React, { useState } from 'react';

function Recorridos({ setTourType, setTourIndex }) {
  const [showOptions, setShowOptions] = useState(false);

  const handleRecorridosClick = () => {
    if (showOptions) {
      // Si el menú está abierto y se hace clic, cierra el TourList
      setTourType(null); // Esto cierra el TourList
    }
    setShowOptions(!showOptions); // Alterna el estado del menú
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

export default Recorridos;
