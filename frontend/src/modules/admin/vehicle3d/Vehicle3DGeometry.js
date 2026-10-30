import * as THREE from 'three';

/**
 * Creates reusable materials for vehicle construction
 */
function createMaterials() {
  return {
    schoolYellow: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.1,
    }),
    schoolYellowWarm: new THREE.MeshStandardMaterial({
      color: 0xed8936,
      roughness: 0.28,
      metalness: 0.1,
    }),
    orangeStripe: new THREE.MeshStandardMaterial({
      color: 0xdd6b20,
      roughness: 0.35,
      metalness: 0.05,
    }),
    blackMatte: new THREE.MeshStandardMaterial({
      color: 0x1a202c,
      roughness: 0.7,
      metalness: 0.2,
    }),
    darkGrey: new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.5,
      metalness: 0.3,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.1,
      metalness: 0.9,
    }),
    tintedGlass: new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.05,
      transmission: 0.4,
      thickness: 0.1,
      transparent: true,
      opacity: 0.85,
      metalness: 0.3,
    }),
    windshieldGlass: new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      roughness: 0.05,
      transmission: 0.5,
      thickness: 0.1,
      transparent: true,
      opacity: 0.75,
      metalness: 0.4,
    }),
    headlightGlow: new THREE.MeshBasicMaterial({
      color: 0xfffbeb,
    }),
    amberIndicator: new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
    }),
    redTaillight: new THREE.MeshBasicMaterial({
      color: 0xef4444,
    }),
    tireRubber: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.05,
    }),
    wheelRim: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.8,
    }),
    whiteRoof: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.05,
    }),
    shadowMaterial: new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
    }),
  };
}

/**
 * Creates a detailed wheel assembly (tire + rim + hub)
 */
function createWheel(materials, radius = 0.25, width = 0.14) {
  const wheelGroup = new THREE.Group();

  // Tire (outer rubber)
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
  tireGeo.rotateZ(Math.PI / 2);
  const tireMesh = new THREE.Mesh(tireGeo, materials.tireRubber);
  wheelGroup.add(tireMesh);

  // Rim (inner metallic wheel)
  const rimGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.005, 16);
  rimGeo.rotateZ(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, materials.wheelRim);
  wheelGroup.add(rimMesh);

  // Central hubcap / lug bolts accent
  const hubGeo = new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, width + 0.015, 8);
  hubGeo.rotateZ(Math.PI / 2);
  const hubMesh = new THREE.Mesh(hubGeo, materials.chrome);
  wheelGroup.add(hubMesh);

  return wheelGroup;
}

/**
 * Creates 3D School Bus Model (Large yellow bus)
 */
export function build3DBusModel() {
  const materials = createMaterials();
  const root = new THREE.Group();
  const chassis = new THREE.Group();
  root.add(chassis);

  // Main dimensions
  const length = 4.2;
  const width = 1.35;
  const height = 1.45;
  const wheelRadius = 0.26;
  const groundOffset = wheelRadius + 0.12;

  // 1. Lower chassis frame
  const frameGeo = new THREE.BoxGeometry(width * 0.9, 0.12, length * 0.95);
  const frameMesh = new THREE.Mesh(frameGeo, materials.blackMatte);
  frameMesh.position.y = groundOffset;
  chassis.add(frameMesh);

  // 2. Main Bus Body
  const bodyGeo = new THREE.BoxGeometry(width, height, length);
  const bodyMesh = new THREE.Mesh(bodyGeo, materials.schoolYellow);
  bodyMesh.position.y = groundOffset + height / 2;
  chassis.add(bodyMesh);

  // 3. Roof (white cap with rounded edges)
  const roofGeo = new THREE.BoxGeometry(width * 0.98, 0.1, length * 0.98);
  const roofMesh = new THREE.Mesh(roofGeo, materials.whiteRoof);
  roofMesh.position.y = groundOffset + height + 0.05;
  chassis.add(roofMesh);

  // Roof Emergency Escape Hatches
  [-1.0, 1.0].forEach((zPos) => {
    const hatch = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.04, 0.5),
      materials.darkGrey
    );
    hatch.position.set(0, groundOffset + height + 0.12, zPos);
    chassis.add(hatch);
  });

  // 4. Black Rub Rails (Upper and lower protective safety bars)
  [-1, 1].forEach((side) => {
    [-0.2, 0.2].forEach((yOffset) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.05, length * 0.96),
        materials.blackMatte
      );
      rail.position.set(side * (width / 2 + 0.015), groundOffset + height / 2 + yOffset, 0);
      chassis.add(rail);
    });
  });

  // 5. Front Windshield & Nose Slope
  const frontWindshield = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.88, height * 0.42, 0.05),
    materials.windshieldGlass
  );
  frontWindshield.position.set(0, groundOffset + height * 0.68, length / 2 + 0.005);
  frontWindshield.rotation.x = -0.15;
  chassis.add(frontWindshield);

  // "STARLINE SCHOOL" / "SCHOOL BUS" front header
  const signHeader = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.82, 0.14, 0.04),
    materials.blackMatte
  );
  signHeader.position.set(0, groundOffset + height * 0.94, length / 2 + 0.01);
  chassis.add(signHeader);

  // Amber warning lights on front roof brow
  [-0.45, 0.45].forEach((xPos) => {
    const light = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12),
      materials.amberIndicator
    );
    light.rotation.x = Math.PI / 2;
    light.position.set(xPos, groundOffset + height + 0.02, length / 2 + 0.01);
    chassis.add(light);
  });

  // 6. Side Passenger Windows (5 per side)
  const windowCount = 5;
  const winWidth = 0.55;
  const winHeight = 0.38;
  const startZ = -length / 2 + 0.7;
  const stepZ = (length - 1.4) / (windowCount - 1);

  for (let i = 0; i < windowCount; i++) {
    const zPos = startZ + i * stepZ;
    [-1, 1].forEach((side) => {
      const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, winHeight, winWidth),
        materials.tintedGlass
      );
      windowMesh.position.set(side * (width / 2 + 0.005), groundOffset + height * 0.68, zPos);
      chassis.add(windowMesh);
    });
  }

  // 7. Rear Windshield & Taillights
  const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.85, height * 0.38, 0.05),
    materials.windshieldGlass
  );
  rearWindow.position.set(0, groundOffset + height * 0.68, -length / 2 - 0.005);
  chassis.add(rearWindow);

  [-0.48, 0.48].forEach((xPos) => {
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.22, 0.04),
      materials.redTaillight
    );
    taillight.position.set(xPos, groundOffset + height * 0.32, -length / 2 - 0.015);
    chassis.add(taillight);
  });

  // 8. Front Radiator Grille & Headlights
  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.65, 0.35, 0.05),
    materials.blackMatte
  );
  grille.position.set(0, groundOffset + height * 0.25, length / 2 + 0.02);
  chassis.add(grille);

  // Chrome grille slats
  [-0.08, 0, 0.08].forEach((yOff) => {
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.62, 0.02, 0.06),
      materials.chrome
    );
    slat.position.set(0, groundOffset + height * 0.25 + yOff, length / 2 + 0.025);
    chassis.add(slat);
  });

  // Dual Headlights
  [-0.45, 0.45].forEach((xPos) => {
    const headlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16),
      materials.headlightGlow
    );
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(xPos, groundOffset + height * 0.28, length / 2 + 0.025);
    chassis.add(headlight);
  });

  // Heavy Bumpers
  const frontBumper = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.02, 0.16, 0.12),
    materials.blackMatte
  );
  frontBumper.position.set(0, groundOffset + 0.08, length / 2 + 0.06);
  chassis.add(frontBumper);

  const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.02, 0.16, 0.12),
    materials.blackMatte
  );
  rearBumper.position.set(0, groundOffset + 0.08, -length / 2 - 0.06);
  chassis.add(rearBumper);

  // 9. Wheels Setup (Steerable front wheels, rolling axles)
  const wheelZPositions = [1.35, -1.35]; // Front, Rear
  const wheels = [];
  const frontWheelPivots = [];

  // Front Wheels with Steering Pivots
  [-1, 1].forEach((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * (width / 2 - 0.02), wheelRadius, wheelZPositions[0]);
    const wheel = createWheel(materials, wheelRadius, 0.16);
    pivot.add(wheel);
    root.add(pivot);

    frontWheelPivots.push(pivot);
    wheels.push(wheel);
  });

  // Rear Wheels (Rigid axle)
  [-1, 1].forEach((side) => {
    const wheel = createWheel(materials, wheelRadius, 0.16);
    wheel.position.set(side * (width / 2 - 0.02), wheelRadius, wheelZPositions[1]);
    root.add(wheel);
    wheels.push(wheel);
  });

  // 10. Asphalt Ground Shadow
  const shadowGeo = new THREE.PlaneGeometry(width * 1.3, length * 1.15);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.shadowMaterial);
  shadowMesh.position.y = 0.01;
  root.add(shadowMesh);

  return {
    root,
    chassis,
    wheels,
    frontWheelPivots,
    wheelRadius,
    dimensions: { length, width, height },
  };
}

/**
 * Creates 3D School Van Model (Compact yellow van / Maruti Omni / Eeco style)
 */
export function build3DVanModel() {
  const materials = createMaterials();
  const root = new THREE.Group();
  const chassis = new THREE.Group();
  root.add(chassis);

  // Main dimensions
  const length = 2.65;
  const width = 1.15;
  const height = 1.25;
  const wheelRadius = 0.21;
  const groundOffset = wheelRadius + 0.1;

  // 1. Lower chassis frame
  const frameGeo = new THREE.BoxGeometry(width * 0.88, 0.1, length * 0.95);
  const frameMesh = new THREE.Mesh(frameGeo, materials.blackMatte);
  frameMesh.position.y = groundOffset;
  chassis.add(frameMesh);

  // 2. Main Van Body
  const bodyGeo = new THREE.BoxGeometry(width, height * 0.95, length);
  const bodyMesh = new THREE.Mesh(bodyGeo, materials.schoolYellow);
  bodyMesh.position.y = groundOffset + height / 2;
  chassis.add(bodyMesh);

  // 3. Aerodynamic Front Windshield
  const frontWindshield = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.88, height * 0.44, 0.05),
    materials.windshieldGlass
  );
  frontWindshield.position.set(0, groundOffset + height * 0.65, length / 2 + 0.005);
  frontWindshield.rotation.x = -0.32;
  chassis.add(frontWindshield);

  // 4. Side Windows (3 per side)
  const windowCount = 3;
  const winWidth = 0.52;
  const winHeight = 0.35;
  const startZ = -length / 2 + 0.5;
  const stepZ = (length - 1.1) / (windowCount - 1);

  for (let i = 0; i < windowCount; i++) {
    const zPos = startZ + i * stepZ;
    [-1, 1].forEach((side) => {
      const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, winHeight, winWidth),
        materials.tintedGlass
      );
      windowMesh.position.set(side * (width / 2 + 0.005), groundOffset + height * 0.65, zPos);
      chassis.add(windowMesh);
    });
  }

  // Sliding Door accent groove
  [-1, 1].forEach((side) => {
    const doorHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.04, 0.12),
      materials.blackMatte
    );
    doorHandle.position.set(side * (width / 2 + 0.015), groundOffset + height * 0.45, 0.1);
    chassis.add(doorHandle);
  });

  // 5. Rear Windshield & Taillights
  const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.85, height * 0.36, 0.05),
    materials.windshieldGlass
  );
  rearWindow.position.set(0, groundOffset + height * 0.65, -length / 2 - 0.005);
  chassis.add(rearWindow);

  [-0.42, 0.42].forEach((xPos) => {
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.28, 0.04),
      materials.redTaillight
    );
    taillight.position.set(xPos, groundOffset + height * 0.45, -length / 2 - 0.015);
    chassis.add(taillight);
  });

  // 6. Front Grille & Headlights
  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.7, 0.22, 0.05),
    materials.darkGrey
  );
  grille.position.set(0, groundOffset + height * 0.22, length / 2 + 0.015);
  chassis.add(grille);

  [-0.38, 0.38].forEach((xPos) => {
    const headlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16),
      materials.headlightGlow
    );
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(xPos, groundOffset + height * 0.24, length / 2 + 0.02);
    chassis.add(headlight);
  });

  // Bumpers
  const frontBumper = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.98, 0.14, 0.1),
    materials.blackMatte
  );
  frontBumper.position.set(0, groundOffset + 0.07, length / 2 + 0.05);
  chassis.add(frontBumper);

  const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.98, 0.14, 0.1),
    materials.blackMatte
  );
  rearBumper.position.set(0, groundOffset + 0.07, -length / 2 - 0.05);
  chassis.add(rearBumper);

  // 7. Wheels Setup
  const wheelZPositions = [0.82, -0.82];
  const wheels = [];
  const frontWheelPivots = [];

  // Front Wheels with Steering Pivots
  [-1, 1].forEach((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * (width / 2 - 0.02), wheelRadius, wheelZPositions[0]);
    const wheel = createWheel(materials, wheelRadius, 0.14);
    pivot.add(wheel);
    root.add(pivot);

    frontWheelPivots.push(pivot);
    wheels.push(wheel);
  });

  // Rear Wheels
  [-1, 1].forEach((side) => {
    const wheel = createWheel(materials, wheelRadius, 0.14);
    wheel.position.set(side * (width / 2 - 0.02), wheelRadius, wheelZPositions[1]);
    root.add(wheel);
    wheels.push(wheel);
  });

  // 8. Asphalt Ground Shadow
  const shadowGeo = new THREE.PlaneGeometry(width * 1.3, length * 1.15);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.shadowMaterial);
  shadowMesh.position.y = 0.01;
  root.add(shadowMesh);

  return {
    root,
    chassis,
    wheels,
    frontWheelPivots,
    wheelRadius,
    dimensions: { length, width, height },
  };
}

/**
 * Creates 3D School Mini-bus Model (Force Traveller style commercial van-bus)
 */
export function build3DMiniBusModel() {
  const materials = createMaterials();
  const root = new THREE.Group();
  const chassis = new THREE.Group();
  root.add(chassis);

  // Main dimensions
  const length = 3.35;
  const width = 1.25;
  const height = 1.4;
  const wheelRadius = 0.23;
  const groundOffset = wheelRadius + 0.11;

  // 1. Lower chassis frame
  const frameGeo = new THREE.BoxGeometry(width * 0.9, 0.11, length * 0.95);
  const frameMesh = new THREE.Mesh(frameGeo, materials.blackMatte);
  frameMesh.position.y = groundOffset;
  chassis.add(frameMesh);

  // 2. Main Body with Force Traveller High-Roof Cap
  const bodyGeo = new THREE.BoxGeometry(width, height * 0.85, length);
  const bodyMesh = new THREE.Mesh(bodyGeo, materials.schoolYellow);
  bodyMesh.position.y = groundOffset + (height * 0.85) / 2;
  chassis.add(bodyMesh);

  // Curved Aerodynamic Roof Cap
  const roofCapGeo = new THREE.BoxGeometry(width * 0.94, height * 0.22, length * 0.94);
  const roofCapMesh = new THREE.Mesh(roofCapGeo, materials.schoolYellowWarm);
  roofCapMesh.position.y = groundOffset + height * 0.85 + 0.08;
  chassis.add(roofCapMesh);

  // Force Traveller Orange School Safety Belt
  [-1, 1].forEach((side) => {
    const orangeBelt = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.15, length * 0.96),
      materials.orangeStripe
    );
    orangeBelt.position.set(side * (width / 2 + 0.012), groundOffset + height * 0.44, 0);
    chassis.add(orangeBelt);
  });

  // 3. Swept Aerodynamic Windshield
  const frontWindshield = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.88, height * 0.42, 0.05),
    materials.windshieldGlass
  );
  frontWindshield.position.set(0, groundOffset + height * 0.65, length / 2 + 0.005);
  frontWindshield.rotation.x = -0.28;
  chassis.add(frontWindshield);

  // Header "SCHOOL BUS" sign
  const headerSign = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.72, 0.12, 0.03),
    materials.blackMatte
  );
  headerSign.position.set(0, groundOffset + height * 0.9, length / 2 + 0.01);
  chassis.add(headerSign);

  // 4. Side Windows (4 large panoramic panes per side)
  const windowCount = 4;
  const winWidth = 0.54;
  const winHeight = 0.36;
  const startZ = -length / 2 + 0.6;
  const stepZ = (length - 1.25) / (windowCount - 1);

  for (let i = 0; i < windowCount; i++) {
    const zPos = startZ + i * stepZ;
    [-1, 1].forEach((side) => {
      const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, winHeight, winWidth),
        materials.tintedGlass
      );
      windowMesh.position.set(side * (width / 2 + 0.005), groundOffset + height * 0.68, zPos);
      chassis.add(windowMesh);
    });
  }

  // 5. Rear Windshield & Taillights
  const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.84, height * 0.35, 0.05),
    materials.windshieldGlass
  );
  rearWindow.position.set(0, groundOffset + height * 0.68, -length / 2 - 0.005);
  chassis.add(rearWindow);

  [-0.45, 0.45].forEach((xPos) => {
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.26, 0.04),
      materials.redTaillight
    );
    taillight.position.set(xPos, groundOffset + height * 0.4, -length / 2 - 0.015);
    chassis.add(taillight);
  });

  // 6. Force Front Grille & Modern Trapezoidal Headlights
  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.68, 0.28, 0.06),
    materials.darkGrey
  );
  grille.position.set(0, groundOffset + height * 0.22, length / 2 + 0.02);
  chassis.add(grille);

  // Force Chrome Logo
  const logo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.07, 16),
    materials.chrome
  );
  logo.rotation.x = Math.PI / 2;
  logo.position.set(0, groundOffset + height * 0.24, length / 2 + 0.035);
  chassis.add(logo);

  [-0.42, 0.42].forEach((xPos) => {
    const headlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.12, 0.05),
      materials.headlightGlow
    );
    headlight.position.set(xPos, groundOffset + height * 0.26, length / 2 + 0.025);
    chassis.add(headlight);
  });

  // Bumpers
  const frontBumper = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.01, 0.15, 0.11),
    materials.blackMatte
  );
  frontBumper.position.set(0, groundOffset + 0.08, length / 2 + 0.06);
  chassis.add(frontBumper);

  const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.01, 0.15, 0.11),
    materials.blackMatte
  );
  rearBumper.position.set(0, groundOffset + 0.08, -length / 2 - 0.06);
  chassis.add(rearBumper);

  // 7. Wheels Setup
  const wheelZPositions = [1.05, -1.05];
  const wheels = [];
  const frontWheelPivots = [];

  // Front Wheels with Steering Pivots
  [-1, 1].forEach((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * (width / 2 - 0.02), wheelRadius, wheelZPositions[0]);
    const wheel = createWheel(materials, wheelRadius, 0.15);
    pivot.add(wheel);
    root.add(pivot);

    frontWheelPivots.push(pivot);
    wheels.push(wheel);
  });

  // Rear Wheels
  [-1, 1].forEach((side) => {
    const wheel = createWheel(materials, wheelRadius, 0.15);
    wheel.position.set(side * (width / 2 - 0.02), wheelRadius, wheelZPositions[1]);
    root.add(wheel);
    wheels.push(wheel);
  });

  // 8. Asphalt Ground Shadow
  const shadowGeo = new THREE.PlaneGeometry(width * 1.3, length * 1.15);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMesh = new THREE.Mesh(shadowGeo, materials.shadowMaterial);
  shadowMesh.position.y = 0.01;
  root.add(shadowMesh);

  return {
    root,
    chassis,
    wheels,
    frontWheelPivots,
    wheelRadius,
    dimensions: { length, width, height },
  };
}

/**
 * Factory function to construct the requested 3D model
 */
export function create3DVehicle(type) {
  const t = (type || '').toLowerCase().trim();
  if (t.includes('van')) {
    return build3DVanModel();
  }
  if (t.includes('mini')) {
    return build3DMiniBusModel();
  }
  return build3DBusModel();
}
