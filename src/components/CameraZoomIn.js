// src/components/CameraZoomIn.js
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

export default CameraZoomIn;
