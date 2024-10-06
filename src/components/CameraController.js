// src/components/CameraController.js
import React, { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

export default CameraController;
