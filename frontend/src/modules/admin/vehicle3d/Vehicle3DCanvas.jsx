import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { create3DVehicle } from './Vehicle3DGeometry';
import { Vehicle3DPhysics } from './Vehicle3DPhysics';

/**
 * Interactive WebGL Canvas rendering 3D Bus, Van, or Mini-bus with real physics
 */
export default function Vehicle3DCanvas({
  vehicleType = 'Bus',
  bearing = 90,
  speedKmh = 0,
  cameraMode = 'isometric', // 'isometric' | 'topdown' | 'chase' | 'orbit'
  width = 160,
  height = 140,
  interactive = false, // allow mouse rotation in inspect modal
  className = '',
}) {
  const containerRef = useRef(null);
  const physicsRef = useRef(null);
  const bearingRef = useRef(bearing);
  const speedRef = useRef(speedKmh);
  const cameraModeRef = useRef(cameraMode);

  // Keep refs updated for animation loop
  useEffect(() => {
    bearingRef.current = bearing;
  }, [bearing]);

  useEffect(() => {
    speedRef.current = speedKmh;
  }, [speedKmh]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);

    // Initial camera positioning according to mode
    const setCameraPosition = (mode) => {
      if (mode === 'topdown') {
        camera.position.set(0, 7.5, 0.1);
        camera.lookAt(0, 0, 0);
      } else if (mode === 'chase') {
        camera.position.set(0, 2.2, -4.5);
        camera.lookAt(0, 0.8, 1.5);
      } else if (mode === 'orbit') {
        camera.position.set(3.5, 2.8, 4.2);
        camera.lookAt(0, 0.6, 0);
      } else {
        // Isometric 3D angle (Elevated 45-degree map perspective)
        camera.position.set(0, 4.8, 5.2);
        camera.lookAt(0, 0.4, 0);
      }
    };
    setCameraPosition(cameraMode);

    // 2. WebGL Renderer with Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    sunLight.position.set(6, 12, 8);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.1);
    rimLight.position.set(-6, 8, -6);
    scene.add(rimLight);

    const groundLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.8);
    scene.add(groundLight);

    // 4. Construct 3D Vehicle Geometry
    const vehicleObj = create3DVehicle(vehicleType);
    scene.add(vehicleObj.root);

    // 5. Initialize Physics Engine
    const physics = new Vehicle3DPhysics(vehicleObj);
    physics.setInitialHeading(bearingRef.current);
    physicsRef.current = physics;

    // Interactive mouse rotation for modal inspection
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let orbitAzimuth = 0.8;
    let orbitElevation = 0.55;
    const orbitDistance = 5.8;

    const onMouseDown = (e) => {
      if (!interactive) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!interactive || !isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      orbitAzimuth -= deltaX * 0.015;
      orbitElevation = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orbitElevation + deltaY * 0.015));

      camera.position.x = orbitDistance * Math.cos(orbitElevation) * Math.sin(orbitAzimuth);
      camera.position.y = orbitDistance * Math.sin(orbitElevation);
      camera.position.z = orbitDistance * Math.cos(orbitElevation) * Math.cos(orbitAzimuth);
      camera.lookAt(0, 0.6, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    if (interactive) {
      container.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    // 6. Animation Loop
    let animId;
    let lastTime = performance.now();

    const animate = (now) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      // Update vehicle physics with road bearing and velocity
      physics.update(deltaSec, bearingRef.current, speedRef.current);

      // In chase camera mode, position camera dynamically behind the vehicle
      if (cameraModeRef.current === 'chase') {
        const heading = physics.currentHeading;
        const camDistance = 4.2;
        const camHeight = 2.1;
        // Follow behind vehicle (-Z in local coords)
        camera.position.x = -Math.sin(heading) * camDistance;
        camera.position.y = camHeight;
        camera.position.z = -Math.cos(heading) * camDistance;
        camera.lookAt(Math.sin(heading) * 2, 0.7, Math.cos(heading) * 2);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Teardown
    return () => {
      cancelAnimationFrame(animId);
      if (interactive) {
        container.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [vehicleType, width, height, cameraMode, interactive]);

  return (
    <div
      ref={containerRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`relative select-none ${className}`}
    />
  );
}
