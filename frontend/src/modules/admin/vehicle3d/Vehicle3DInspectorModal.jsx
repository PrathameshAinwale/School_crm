import React, { useState, useEffect, useRef } from 'react';
import {
  LuX,
  LuCompass,
  LuGauge,
  LuCamera,
  LuRotateCcw,
  LuSlidersHorizontal,
  LuSparkles,
  LuBus,
  LuMove,
  LuCheck,
} from 'react-icons/lu';
import { initVehicle3D } from './Vehicle3DManager';
import { getVehicleTypeInfo } from '../VehicleGpsTracker';

export default function Vehicle3DInspectorModal({
  vehicle,
  onClose,
}) {
  const mountRef = useRef(null);
  const controllerRef = useRef(null);

  const [selectedType, setSelectedType] = useState(vehicle?.type || 'Bus');
  const [cameraMode, setCameraMode] = useState('orbit');
  const [testBearing, setTestBearing] = useState(90);
  const [testSpeed, setTestSpeed] = useState(35);
  const [physicsReadout, setPhysicsReadout] = useState({
    headingDeg: 90,
    steerAngleDeg: 0,
    pitchDeg: 0,
    rollDeg: 0,
    speedKmh: 35,
  });

  // Mount 3D Canvas
  useEffect(() => {
    if (!mountRef.current) return;

    const controller = initVehicle3D(mountRef.current, {
      vehicleType: selectedType,
      initialBearing: testBearing,
      initialSpeed: testSpeed,
      cameraMode,
      width: 480,
      height: 340,
      interactive: true,
    });
    controllerRef.current = controller;

    // Polling physics state for UI telemetry
    const interval = setInterval(() => {
      if (controllerRef.current) {
        setPhysicsReadout(controllerRef.current.getPhysicsState());
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
      }
    };
  }, [selectedType]);

  // Update physics when sliders change
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updatePhysics(testBearing, testSpeed);
    }
  }, [testBearing, testSpeed]);

  // Update camera mode
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setCameraMode(cameraMode);
    }
  }, [cameraMode]);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-2xl w-full p-5 sm:p-6 text-white shadow-2xl relative animate-scale-up overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10"
        >
          <LuX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <LuSparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              3D Vehicle Physics & Road Steering Studio
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Interactive WebGL 3D model with Ackermann steering, wheel angular velocity, and road direction physics
            </p>
          </div>
        </div>

        {/* Vehicle Model Switcher */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {['Bus', 'Van', 'Mini-bus'].map((type) => {
            const isSel = selectedType.toLowerCase().includes(type.toLowerCase());
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  isSel
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/60 shadow-md'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>3D {type}</span>
              </button>
            );
          })}
        </div>

        {/* 3D WebGL Canvas Area */}
        <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner group">
          <div ref={mountRef} className="cursor-grab active:cursor-grabbing" />

          {/* Interactive Hint */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-[10px] text-slate-300 font-semibold flex items-center gap-1.5 pointer-events-none">
            <LuMove className="w-3 h-3 text-orange-400 animate-pulse" />
            <span>Click & Drag to Orbit 360°</span>
          </div>

          {/* Camera Mode Toolbar */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 rounded-xl p-1 z-10">
            {[
              { id: 'orbit', label: 'Orbit' },
              { id: 'isometric', label: 'Iso 3D' },
              { id: 'chase', label: 'Chase' },
              { id: 'topdown', label: 'Top' },
            ].map((cam) => (
              <button
                key={cam.id}
                onClick={() => setCameraMode(cam.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  cameraMode === cam.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Floating Physics Telemetry Overlay */}
          <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 gap-1.5 pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-sm p-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Heading</span>
              <span className="text-xs font-black font-mono text-white">{physicsReadout.headingDeg}°</span>
            </div>
            <div className="bg-slate-900/85 backdrop-blur-sm p-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Front Steer</span>
              <span className="text-xs font-black font-mono text-emerald-400">{physicsReadout.steerAngleDeg}°</span>
            </div>
            <div className="bg-slate-900/85 backdrop-blur-sm p-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Body Roll</span>
              <span className="text-xs font-black font-mono text-amber-400">{physicsReadout.rollDeg}°</span>
            </div>
            <div className="bg-slate-900/85 backdrop-blur-sm p-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Pitch</span>
              <span className="text-xs font-black font-mono text-sky-400">{physicsReadout.pitchDeg}°</span>
            </div>
          </div>
        </div>

        {/* Real-time Physics Sliders & Controls */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
          {/* Road Direction (Bearing) Slider */}
          <div>
            <div className="flex items-center justify-between text-slate-300 font-bold mb-1 text-[11px]">
              <span className="flex items-center gap-1.5">
                <LuCompass className="w-3.5 h-3.5 text-orange-400" />
                Road Heading Angle (Direction)
              </span>
              <span className="font-mono text-orange-400">{testBearing}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={testBearing}
              onChange={(e) => setTestBearing(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
              <span>0° (North)</span>
              <span>90° (East)</span>
              <span>180° (South)</span>
              <span>270° (West)</span>
            </div>
          </div>

          {/* Speed & Wheel Angular Velocity Slider */}
          <div>
            <div className="flex items-center justify-between text-slate-300 font-bold mb-1 text-[11px]">
              <span className="flex items-center gap-1.5">
                <LuGauge className="w-3.5 h-3.5 text-emerald-400" />
                Road Speed & Wheel Rotation
              </span>
              <span className="font-mono text-emerald-400">{testSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={testSpeed}
              onChange={(e) => setTestSpeed(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
              <span>0 km/h (Parked)</span>
              <span>45 km/h (Cruising)</span>
              <span>90 km/h (Highway)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
