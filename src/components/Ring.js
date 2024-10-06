// src/components/Ring.js
import React, { useRef, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

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

export default Ring;
