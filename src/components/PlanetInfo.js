// src/components/PlanetInfo.js
import React from 'react';

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

export default PlanetInfo;
