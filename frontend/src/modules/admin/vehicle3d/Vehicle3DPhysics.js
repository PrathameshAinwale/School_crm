/**
 * Real-time Vehicle 3D Physics Simulator
 * Simulates:
 * - Road tangent heading tracking with damping
 * - Ackermann front-wheel steering into turns
 * - Angular wheel spin velocity matching road speed
 * - Centrifugal body roll (cornering lean)
 * - Acceleration squat & braking suspension dive
 * - Road asphalt micro-vibrations
 */

// Helper to normalize angle to [-PI, PI]
export function normalizeAngle(angle) {
  let a = angle % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export class Vehicle3DPhysics {
  constructor(vehicleModel) {
    this.model = vehicleModel;
    this.wheelRadius = vehicleModel.wheelRadius || 0.25;

    // Physics States
    this.currentHeading = 0; // radians
    this.targetHeading = 0; // radians
    this.steerAngle = 0; // radians (front wheel turning)
    this.targetSteerAngle = 0;

    this.wheelRotation = 0; // radians (accumulated rolling)
    this.currentSpeedKmh = 0; // km/h
    this.prevSpeedKmh = 0;

    this.pitch = 0; // radians (front dive / rear squat)
    this.roll = 0; // radians (centrifugal cornering lean)
    this.bounce = 0; // meters (vertical suspension travel)

    this.elapsedTime = 0;
  }

  /**
   * Resets heading and state to an initial road bearing
   */
  setInitialHeading(bearingDeg) {
    const rad = Math.PI - (bearingDeg * Math.PI) / 180;
    this.currentHeading = rad;
    this.targetHeading = rad;
    this.steerAngle = 0;
    this.pitch = 0;
    this.roll = 0;
    this.bounce = 0;
    if (this.model?.root) {
      this.model.root.rotation.y = rad;
    }
  }

  /**
   * Main Physics Tick
   * @param {number} deltaSec - Frame delta time in seconds
   * @param {number} roadBearingDeg - Compass bearing of road in degrees [0, 360]
   * @param {number} speedKmh - Vehicle velocity in km/h
   */
  update(deltaSec, roadBearingDeg, speedKmh = 0) {
    if (!this.model) return;

    this.elapsedTime += deltaSec;
    const dt = Math.min(0.1, Math.max(0.001, deltaSec));

    // Convert compass bearing [0 = North, 90 = East, 180 = South, 270 = West]
    // to Three.js world Y rotation angle where vehicle nose points along +Z in local coords
    // (Three.js coordinates: +X = East, -X = West, +Z = South, -Z = North)
    // Three.js angle = Math.PI - (roadBearing * Math.PI) / 180
    this.targetHeading = Math.PI - (roadBearingDeg * Math.PI) / 180;

    // 1. Angular heading tracking with shortest-path interpolation
    const angleDiff = normalizeAngle(this.targetHeading - this.currentHeading);
    const headingLerpSpeed = speedKmh > 0 ? 6.5 : 4.0;
    this.currentHeading += angleDiff * Math.min(1, headingLerpSpeed * dt);
    this.model.root.rotation.y = this.currentHeading;

    // 2. Ackermann Front Wheel Steering Physics
    // When turning into a curve, front wheels turn in the direction of the turn
    // Steer angle is proportional to the rate of turn and clamped to +/- 32 degrees (0.55 rad)
    this.targetSteerAngle = Math.max(-0.55, Math.min(0.55, -angleDiff * 1.7));
    this.steerAngle += (this.targetSteerAngle - this.steerAngle) * Math.min(1, 10 * dt);

    if (this.model.frontWheelPivots) {
      this.model.frontWheelPivots.forEach((pivot) => {
        pivot.rotation.y = this.steerAngle;
      });
    }

    // 3. Wheel Spin Velocity Physics
    // Speed in meters per second
    const speedMps = (speedKmh * 1000) / 3600;
    const angularSpeed = speedMps / this.wheelRadius;
    const deltaWheelAngle = angularSpeed * dt;
    this.wheelRotation += deltaWheelAngle;

    if (this.model.wheels) {
      this.model.wheels.forEach((wheel) => {
        // Rotate along local wheel axle (X axis)
        wheel.rotation.x += deltaWheelAngle;
      });
    }

    // 4. Centrifugal Cornering Roll (Body leans outward from the turn)
    // Centrifugal roll = -angleDiff * (speed / maxSpeed) * factor
    const speedRatio = Math.min(1.5, speedKmh / 50);
    const targetRoll = -Math.max(-0.16, Math.min(0.16, angleDiff * speedRatio * 0.45));
    this.roll += (targetRoll - this.roll) * Math.min(1, 8 * dt);

    // 5. Suspension Pitch (Braking Dive vs Acceleration Squat)
    const acceleration = (speedKmh - this.prevSpeedKmh) / dt;
    this.prevSpeedKmh = speedKmh;

    // If decelerating (braking), nose dips down (pitch > 0)
    // If accelerating, rear squats (pitch < 0)
    const targetPitch = Math.max(-0.08, Math.min(0.12, -acceleration * 0.0035));
    this.pitch += (targetPitch - this.pitch) * Math.min(1, 6 * dt);

    // 6. Suspension Road Micro-Vibrations (Asphalt road contact)
    const vibrationAmp = speedKmh > 0 ? Math.min(0.012, 0.004 + (speedKmh / 80) * 0.008) : 0;
    const targetBounce = Math.sin(this.elapsedTime * 22) * vibrationAmp;
    this.bounce += (targetBounce - this.bounce) * Math.min(1, 15 * dt);

    // Apply pitch, roll, and bounce to chassis
    if (this.model.chassis) {
      this.model.chassis.rotation.x = this.pitch;
      this.model.chassis.rotation.z = this.roll;
      this.model.chassis.position.y = this.bounce;
    }

    this.currentSpeedKmh = speedKmh;
  }
}
