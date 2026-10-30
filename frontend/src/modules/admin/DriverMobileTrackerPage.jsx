import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  LuBus,
  LuPower,
  LuRadio,
  LuCompass,
  LuGauge,
  LuMapPin,
  LuTriangleAlert,
  LuCopy,
  LuCheck,
  LuArrowLeft,
  LuSparkles,
  LuShieldCheck,
  LuMap,
  LuSend,
} from 'react-icons/lu';
import { apiRequest } from '../../services/api';
import nashikRoadWaypoints from './nashikRoadWaypoints.json';

const gpsBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('school_gps_channel')
  : null;

function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

export default function DriverMobileTrackerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vehicleId = searchParams.get('vehicle_id') || searchParams.get('vehicle') || '1';

  const [vehicle, setVehicle] = useState(null);
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [mode, setMode] = useState('real_gps'); // Default to real device GPS
  const [copied, setCopied] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Live telemetry data (initialized with real location or Khutawad Nagar fallback)
  const [currentCoords, setCurrentCoords] = useState({
    latitude: 19.9725,
    longitude: 73.762197,
    heading: 0,
    speed: 0,
    accuracy: 4.0,
  });

  const [pingCount, setPingCount] = useState(0);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [pingStatus, setPingStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [simIndex, setSimIndex] = useState(0);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  const watchIdRef = useRef(null);
  const pingIntervalRef = useRef(null);

  // Default Stops for the route
  const stops = [
    { name: 'Khutawad Nagar (Gate 1)', time: '07:15 AM', students: 0 },
    { name: 'ITI Signal / Trimbak Naka', time: '07:25 AM', students: 6 },
    { name: 'College Road / ABB Circle', time: '07:38 AM', students: 8 },
    { name: 'Canada Corner Junction', time: '07:48 AM', students: 5 },
    { name: 'CBS Ashok Stambh', time: '08:00 AM', students: 7 },
    { name: 'Panchavati Circle (Terminus)', time: '08:15 AM', students: 12 },
  ];

  // Request actual hardware GPS from phone / device
  const requestRealGps = (onSuccess = null) => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const rawSpeed = pos.coords.speed;
        const speedKmh = rawSpeed !== null && rawSpeed > 0.4 ? Math.round(rawSpeed * 3.6) : 0;
        const coords = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          heading: pos.coords.heading && pos.coords.heading >= 0 ? Math.round(pos.coords.heading) : 0,
          speed: speedKmh,
          accuracy: Math.round(pos.coords.accuracy || 4),
        };
        setCurrentCoords(coords);
        if (onSuccess) {
          onSuccess(coords);
        } else if (isOnline) {
          sendPing(coords);
        }
      },
      (err) => {
        setGpsError(`Location Access: ${err.message}. Please allow location permission in your browser.`);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Immediate real GPS acquisition on component mount
  useEffect(() => {
    requestRealGps();
  }, []);

  // Fetch all fleet vehicles for instant vehicle switching
  useEffect(() => {
    apiRequest('/driver/vehicles')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setAllVehicles(res.data);
          const found = res.data.find((v) => String(v.id) === String(vehicleId));
          if (found) {
            setVehicle(found);
            setIsOnline(!!found.is_online);
          }
        }
      })
      .catch((err) => console.warn('Vehicles list fetch:', err));
  }, [vehicleId]);

  // Fetch initial vehicle info
  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/driver/vehicle/${vehicleId}`);
        if (res.success && res.data) {
          setVehicle(res.data);
          setIsOnline(!!res.data.is_online);
          // If vehicle already has live coordinates and we don't have GPS fix yet
          if (res.data.current_latitude && res.data.current_longitude && mode !== 'real_gps') {
            setCurrentCoords({
              latitude: Number(res.data.current_latitude),
              longitude: Number(res.data.current_longitude),
              heading: Number(res.data.current_heading || 0),
              speed: Number(res.data.current_speed || 0),
              accuracy: 4,
            });
          }
        }
      } catch (err) {
        console.warn('Driver vehicle fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [vehicleId]);

  // Transmit GPS ping to backend
  const sendPing = async (coords) => {
    setPingStatus('sending');

    // Instant zero-delay cross-tab broadcast to admin map
    if (gpsBroadcast) {
      try {
        gpsBroadcast.postMessage({
          type: 'GPS_PING',
          vehicle_id: String(vehicleId),
          latitude: coords.latitude,
          longitude: coords.longitude,
          heading: coords.heading || 0,
          speed: coords.speed || 0,
          is_online: true,
          last_ping_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Broadcast channel post:', e);
      }
    }

    try {
      const payload = {
        vehicle_id: vehicleId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading || 0,
        speed: coords.speed || 0,
        accuracy: coords.accuracy || 3.5,
      };

      const res = await apiRequest.post('/driver/gps-ping', payload);

      if (res && res.success) {
        setPingStatus('success');
        setPingCount((c) => c + 1);
        setLastPingTime(new Date().toLocaleTimeString());
      } else {
        setPingStatus('error');
      }
    } catch {
      setPingStatus('error');
    }
  };

  // Handle Online / Offline Toggle (Uber-Style Trip Activation)
  const handleToggleTrip = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);

    // If turning online, immediately request hardware GPS from device with zero cache
    if (nextState && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const rawSpeed = pos.coords.speed;
          const speedKmh = rawSpeed !== null && rawSpeed > 0.4 ? Math.round(rawSpeed * 3.6) : 0;
          const fresh = {
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            heading: pos.coords.heading && pos.coords.heading >= 0 ? Math.round(pos.coords.heading) : 0,
            speed: speedKmh,
            accuracy: Math.round(pos.coords.accuracy || 4),
          };
          setCurrentCoords(fresh);
          currentCoordsRef.current = fresh;
          sendPing(fresh);
          if (gpsBroadcast) {
            try {
              gpsBroadcast.postMessage({
                type: 'TRIP_TOGGLE',
                vehicle_id: String(vehicleId),
                is_online: true,
                latitude: fresh.latitude,
                longitude: fresh.longitude,
                heading: fresh.heading,
                speed: fresh.speed,
                last_ping_at: new Date().toISOString(),
              });
            } catch (e) {
              console.warn('Broadcast channel post:', e);
            }
          }
        },
        (err) => console.warn('Instant GPS fix on Go Online:', err.message),
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    }

    const coordsToSend = currentCoordsRef.current || currentCoords;

    // Instant zero-delay cross-tab broadcast to admin map
    if (gpsBroadcast) {
      try {
        gpsBroadcast.postMessage({
          type: 'TRIP_TOGGLE',
          vehicle_id: String(vehicleId),
          is_online: nextState,
          latitude: coordsToSend?.latitude,
          longitude: coordsToSend?.longitude,
          heading: coordsToSend?.heading || 0,
          speed: coordsToSend?.speed || 0,
          last_ping_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Broadcast channel post:', e);
      }
    }

    try {
      await apiRequest.post('/driver/toggle-trip', {
        vehicle_id: vehicleId,
        is_online: nextState,
        latitude: coordsToSend?.latitude,
        longitude: coordsToSend?.longitude,
        heading: coordsToSend?.heading || 0,
        speed: coordsToSend?.speed || 0,
      });
    } catch (e) {
      console.warn('Trip toggle status sync:', e);
    }

    if (nextState) {
      // Going online: immediately send current real physical coordinates
      if (coordsToSend?.latitude && coordsToSend?.longitude) {
        sendPing(coordsToSend);
      }
      if (mode === 'real_gps') {
        requestRealGps((freshCoords) => {
          sendPing(freshCoords);
        });
      }
    }
  };

  // Keep a ref of current coordinates for heartbeat transmission
  const currentCoordsRef = useRef(currentCoords);
  useEffect(() => {
    currentCoordsRef.current = currentCoords;
  }, [currentCoords]);

  // Real Hardware Phone / Laptop GPS Watcher
  useEffect(() => {
    if (!isOnline || mode !== 'real_gps') {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser. Switching to simulation mode.');
      setMode('simulate');
      return;
    }

    const processPosition = (pos) => {
      // If stationary or device provides no speed, speed is strictly 0 km/h
      const rawSpeed = pos.coords.speed;
      const speedKmh = rawSpeed !== null && rawSpeed > 0.4 ? Math.round(rawSpeed * 3.6) : 0;
      let headingVal = pos.coords.heading !== null && !isNaN(pos.coords.heading) && pos.coords.heading >= 0
        ? Math.round(pos.coords.heading)
        : null;

      if (headingVal === null && currentCoordsRef.current?.latitude && currentCoordsRef.current?.longitude) {
        const dLat = Math.abs(pos.coords.latitude - currentCoordsRef.current.latitude);
        const dLng = Math.abs(pos.coords.longitude - currentCoordsRef.current.longitude);
        if (dLat > 0.00002 || dLng > 0.00002) {
          headingVal = calculateBearing(
            currentCoordsRef.current.latitude,
            currentCoordsRef.current.longitude,
            pos.coords.latitude,
            pos.coords.longitude
          );
        } else {
          headingVal = currentCoordsRef.current.heading || 0;
        }
      } else if (headingVal === null) {
        headingVal = currentCoordsRef.current?.heading || 0;
      }

      const coords = {
        latitude: Number(pos.coords.latitude.toFixed(6)),
        longitude: Number(pos.coords.longitude.toFixed(6)),
        heading: headingVal,
        speed: speedKmh,
        accuracy: Math.round(pos.coords.accuracy || 4),
      };

      setCurrentCoords(coords);
      sendPing(coords);
    };

    // Immediate initial fix
    navigator.geolocation.getCurrentPosition(
      processPosition,
      (err) => console.warn('Initial GPS fix error:', err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );

    // Continuous watch position for real movement
    watchIdRef.current = navigator.geolocation.watchPosition(
      processPosition,
      (err) => {
        console.warn('GPS watch error:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    // Steady heartbeat ping every 2.5 seconds (so admin map stays updated even while stationary at 0 km/h)
    const heartbeatTimer = setInterval(() => {
      if (currentCoordsRef.current) {
        sendPing(currentCoordsRef.current);
      }
    }, 2500);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      clearInterval(heartbeatTimer);
    };
  }, [isOnline, mode]);

  // Simulation Mode along actual Nashik road waypoints
  useEffect(() => {
    if (!isOnline || mode !== 'simulate') {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      return;
    }

    pingIntervalRef.current = setInterval(() => {
      setSimIndex((prev) => {
        const next = (prev + 1) % nashikRoadWaypoints.length;
        const p1 = nashikRoadWaypoints[prev];
        const p2 = nashikRoadWaypoints[next];

        // Calculate heading
        const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
        const y = Math.sin(dLon) * Math.cos((p2[0] * Math.PI) / 180);
        const x =
          Math.cos((p1[0] * Math.PI) / 180) * Math.sin((p2[0] * Math.PI) / 180) -
          Math.sin((p1[0] * Math.PI) / 180) * Math.cos((p2[0] * Math.PI) / 180) * Math.cos(dLon);
        const bearing = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);

        const newCoords = {
          latitude: p1[0],
          longitude: p1[1],
          heading: bearing,
          speed: Math.floor(32 + Math.random() * 12),
          accuracy: 2.8,
        };

        setCurrentCoords(newCoords);
        sendPing(newCoords);

        return next;
      });
    }, 1200); // Send ping every 1.2 seconds for ultra-smooth road movement

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [isOnline, mode]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const displayStops = useMemo(() => {
    let s = vehicle?.route_stops;
    if (typeof s === 'string') {
      try {
        s = JSON.parse(s);
      } catch (e) {
        s = null;
      }
    }
    if (Array.isArray(s) && s.length > 0) {
      return s.map((item, idx) => ({
        name: item.name || `Stop ${idx + 1}`,
        time: item.time || (idx === 0 ? 'Start' : idx === s.length - 1 ? 'Terminus' : ''),
        students: item.students || 0,
      }));
    }
    return stops;
  }, [vehicle?.route_stops]);

  const nextStop = displayStops[currentStopIndex] || displayStops[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start p-3 sm:p-5 font-sans select-none">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col pb-5">
        {/* Top Header & Status Bar */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('/school-vehicles')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Return to fleet roster"
            >
              <LuArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/school-vehicles?track_id=${vehicleId}&view=gps`)}
              className="px-2.5 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
              title="View on Live Track Route Map"
            >
              <LuMap className="w-3.5 h-3.5 text-orange-400" />
              <span>Map View</span>
            </button>
          </div>

          <div className="text-center">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Driver Console</div>
            <div className="text-xs font-extrabold flex items-center justify-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
              <span className={isOnline ? 'text-emerald-400' : 'text-slate-400'}>
                {isOnline ? 'ONLINE' : 'STANDBY'}
              </span>
            </div>
          </div>

          <button
            onClick={copyShareLink}
            title="Copy driver phone link"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {copied ? <LuCheck className="w-4 h-4 text-emerald-400" /> : <LuCopy className="w-4 h-4" />}
          </button>
        </div>

        {/* Assigned Vehicle & Driver Card */}
        <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                <LuBus className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-black text-white leading-tight truncate">
                  {vehicle?.vehicle_number || 'MH15AB1234'}
                </div>
                <div className="text-xs text-orange-400 font-bold truncate">
                  {vehicle?.route_name || 'Assigned School Route'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Driver: <strong className="text-slate-200">{vehicle?.driver_name || 'Raj Sharma'}</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isOnline
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {isOnline ? 'Live GPS' : 'Offline'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentCoords.speed > 0 ? `${currentCoords.speed} km/h` : 'Parked'}
              </span>
            </div>
          </div>

          {/* Quick Vehicle Switcher (if multiple vehicles exist) */}
          {allVehicles.length > 1 && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">Select Bus:</span>
              <select
                value={vehicleId}
                onChange={(e) => navigate(`/driver-tracker?vehicle_id=${e.target.value}`)}
                className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-white px-2.5 py-1.5 flex-1 max-w-[220px] cursor-pointer focus:outline-none focus:border-orange-500"
              >
                {allVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicle_number} — {v.driver_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clean Real GPS Signal Status Pill */}
          <div className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {isOnline ? 'Device GPS Connected & Broadcasting' : 'Device GPS Ready (High Accuracy)'}
            </span>
            <button
              onClick={() => requestRealGps()}
              className="text-orange-400 hover:text-orange-300 text-[10px] font-bold transition-colors cursor-pointer"
              title="Refresh GPS location fix"
            >
              Refresh Fix
            </button>
          </div>

          {gpsError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300">
              {gpsError}
            </div>
          )}
        </div>

        {/* Hero Big Action Button */}
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <button
            onClick={handleToggleTrip}
            className={`relative group w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl ${
              isOnline
                ? 'bg-gradient-to-tr from-rose-600 to-red-600 text-white shadow-rose-600/30 hover:shadow-rose-600/50'
                : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-emerald-600/30 hover:scale-105'
            }`}
          >
            {isOnline && (
              <span className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping pointer-events-none"></span>
            )}
            <LuPower className={`w-14 h-14 mb-2 ${isOnline ? 'text-white' : 'text-emerald-100'}`} />
            <span className="text-base font-black tracking-wider uppercase">
              {isOnline ? 'STOP TRIP' : 'GO ONLINE'}
            </span>
            <span className="text-[10px] font-semibold text-white/80 mt-1">
              {isOnline ? 'Tap to End Route' : 'Tap to Start Route'}
            </span>
          </button>

          <p className="text-xs text-slate-400 mt-3 font-medium">
            {isOnline ? '📍 Broadcasting live location to school & parents' : 'Tap to start broadcasting your bus location'}
          </p>
        </div>

        {/* 2 Clean Useful Stats Cards */}
        <div className="px-4 grid grid-cols-2 gap-2.5 mb-4">
          {/* Speed Card */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
              <LuGauge className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Speed</div>
              <div className="text-lg font-black text-white font-mono leading-tight flex items-baseline gap-1 mt-0.5">
                <span>{currentCoords.speed}</span>
                <span className="text-xs font-normal text-slate-400">km/h</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                {currentCoords.speed > 0 ? (
                  <span className="text-emerald-400">In Transit</span>
                ) : (
                  <span className="text-amber-400">Parked</span>
                )}
              </div>
            </div>
          </div>

          {/* Next Stop Card */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <LuMapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Next Stop</div>
              <div className="text-xs font-black text-white truncate mt-0.5" title={nextStop.name}>
                {nextStop.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {nextStop.time || (nextStop.students ? `${nextStop.students} Students` : 'Scheduled')}
              </div>
            </div>
          </div>
        </div>

        {/* Route Checkpoints (Stops Checklist) */}
        <div className="px-4 mb-4">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-200">
                <LuMapPin className="w-3.5 h-3.5 text-orange-500" /> Route Checkpoints
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Tap stop upon arrival</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {displayStops.map((stop, idx) => {
                const isPassed = idx < currentStopIndex;
                const isCurrent = idx === currentStopIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentStopIndex(idx)}
                    className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all border ${
                      isCurrent
                        ? 'bg-orange-500/15 border-orange-500/50 text-orange-300 shadow-xs'
                        : isPassed
                        ? 'bg-slate-900/40 border-slate-800/40 text-slate-500 line-through'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCurrent
                          ? 'bg-orange-600 text-white'
                          : isPassed
                          ? 'bg-emerald-600/30 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold truncate">{stop.name}</span>
                    </div>

                    <div className="text-[10px] font-mono shrink-0 text-slate-400 pl-2">
                      {stop.students ? `${stop.students} Students` : stop.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Emergency SOS Bar */}
        <div className="px-4 mt-auto">
          <a
            href="tel:112"
            className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-black flex items-center justify-center gap-2 transition-colors"
          >
            <LuTriangleAlert className="w-4 h-4" /> Emergency SOS Assistance
          </a>
        </div>

        {/* Discrete Demo Simulator Toggle (For testing without driving) */}
        <div className="mt-3 text-center">
          <button
            onClick={() => {
              const nextMode = mode === 'real_gps' ? 'simulate' : 'real_gps';
              setMode(nextMode);
              if (nextMode === 'real_gps') requestRealGps();
            }}
            className="text-[10px] text-slate-400 hover:text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <LuSparkles className="w-3 h-3 text-orange-400" />
            <span>{mode === 'simulate' ? 'Active: Demo Simulator (Tap for Real GPS)' : 'Demo Test Simulator'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
