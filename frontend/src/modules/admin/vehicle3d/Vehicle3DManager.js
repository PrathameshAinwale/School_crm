import * as THREE from 'three';
import { create3DVehicle } from './Vehicle3DGeometry';
import { Vehicle3DPhysics } from './Vehicle3DPhysics';

/**
 * Initializes and manages a WebGL 3D Vehicle instance inside any DOM container
 * (such as a Leaflet map marker or preview modal)
 */
export function initVehicle3D(container, {
  vehicleType = 'Bus',
  initialBearing = 90,
  initialSpeed = 0,
  cameraMode = 'isometric', // 'isometric' | 'topdown' | 'chase' | 'orbit'
  width = 150,
  height = 130,
  interactive = false,
} = {}) {
  if (!container) return null;

  container.innerHTML = '';

  // 1. Scene & Camera
  const scene = new THREE.Scene();
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);

  let currentCameraMode = cameraMode;
  let targetBearing = initialBearing;
  let currentSpeed = initialSpeed;

  const updateCameraPosition = () => {
    if (currentCameraMode === 'topdown') {
      camera.position.set(0, 6.8, 0.05);
      camera.lookAt(0, 0, 0);
    } else if (currentCameraMode === 'chase') {
      // Dynamic chase positioning is handled in the render loop
    } else if (currentCameraMode === 'orbit') {
      camera.position.set(3.4, 2.6, 4.0);
      camera.lookAt(0, 0.5, 0);
    } else {
      // Default: Isometric 3D angle (Elevated 45-degree map perspective)
      camera.position.set(0, 4.6, 5.0);
      camera.lookAt(0, 0.4, 0);
    }
  };
  updateCameraPosition();

  // 2. WebGL Renderer with High-DPI & Alpha
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  // 3. Realistic Scene Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 1.35);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfffbeb, 2.5);
  sun.position.set(6, 12, 8);
  sun.castShadow = true;
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0x93c5fd, 1.2);
  rim.position.set(-6, 8, -6);
  scene.add(rim);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 0.85);
  scene.add(hemi);

  // 4. Construct 3D Vehicle Model
  let currentType = vehicleType;
  let vehicleObj = create3DVehicle(currentType);
  scene.add(vehicleObj.root);

  // 5. Physics Engine Instance
  let physics = new Vehicle3DPhysics(vehicleObj);
  physics.setInitialHeading(initialBearing);

  // Orbit controls for interactive inspection
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  let azimuth = 0.8;
  let elevation = 0.55;
  const orbitDist = 5.6;

  const onDown = (e) => {
    if (!interactive) return;
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  };

  const onMove = (e) => {
    if (!interactive || !isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    prevX = e.clientX;
    prevY = e.clientY;

    azimuth -= dx * 0.015;
    elevation = Math.max(0.08, Math.min(Math.PI / 2 - 0.05, elevation + dy * 0.015));

    camera.position.x = orbitDist * Math.cos(elevation) * Math.sin(azimuth);
    camera.position.y = orbitDist * Math.sin(elevation);
    camera.position.z = orbitDist * Math.cos(elevation) * Math.cos(azimuth);
    camera.lookAt(0, 0.5, 0);
  };

  const onUp = () => {
    isDragging = false;
  };

  if (interactive) {
    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // 6. Real-time Physics & Render Loop
  let animId;
  let lastTime = performance.now();
  let isRunning = true;

  const tick = (now) => {
    if (!isRunning) return;

    const deltaSec = (now - lastTime) / 1000;
    lastTime = now;

    // Run vehicle physics (road tangent heading, Ackermann steering, wheel roll, suspension)
    physics.update(deltaSec, targetBearing, currentSpeed);

    // Chase Camera Mode: smoothly follows right behind the vehicle
    if (currentCameraMode === 'chase') {
      const heading = physics.currentHeading;
      const camDist = 4.0;
      const camHeight = 2.0;
      camera.position.x = -Math.sin(heading) * camDist;
      camera.position.y = camHeight;
      camera.position.z = -Math.cos(heading) * camDist;
      camera.lookAt(Math.sin(heading) * 2, 0.6, Math.cos(heading) * 2);
    }

    renderer.render(scene, camera);
    animId = requestAnimationFrame(tick);
  };

  animId = requestAnimationFrame(tick);

  // Return Public Controller API
  return {
    updatePhysics(bearingDeg, speedKmh = 0) {
      targetBearing = bearingDeg;
      currentSpeed = speedKmh;
    },

    setCameraMode(newMode) {
      currentCameraMode = newMode;
      updateCameraPosition();
    },

    setVehicleType(newType) {
      if (newType === currentType) return;
      currentType = newType;
      scene.remove(vehicleObj.root);
      vehicleObj = create3DVehicle(newType);
      scene.add(vehicleObj.root);
      physics = new Vehicle3DPhysics(vehicleObj);
      physics.setInitialHeading(targetBearing);
    },

    getPhysicsState() {
      return {
        headingDeg: Math.round(((180 - (physics.currentHeading * 180) / Math.PI) + 360) % 360),
        steerAngleDeg: Math.round((physics.steerAngle * 180) / Math.PI),
        pitchDeg: Math.round((physics.pitch * 180) / Math.PI * 10) / 10,
        rollDeg: Math.round((physics.roll * 180) / Math.PI * 10) / 10,
        speedKmh: currentSpeed,
      };
    },

    destroy() {
      isRunning = false;
      cancelAnimationFrame(animId);

      if (interactive) {
        container.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      }

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
