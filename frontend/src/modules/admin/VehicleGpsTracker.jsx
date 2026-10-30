import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  LuBus,
  LuPhone,
  LuPlay,
  LuPause,
  LuRotateCcw,
  LuMaximize2,
  LuMinimize2,
  LuClock,
  LuGauge,
  LuUsers,
  LuFuel,
  LuRadio,
  LuMapPin,
  LuCrosshair,
  LuSlidersHorizontal,
  LuShieldCheck,
  LuSmartphone,
  LuExternalLink,
  LuCopy,
  LuCheck,
  LuX,
  LuBox,
  LuCamera,
  LuLayers,
  LuArrowLeft,
  LuNavigation,
  LuChevronDown,
} from 'react-icons/lu';
import nashikRoadWaypoints from './nashikRoadWaypoints.json';
import { initVehicle3D } from './vehicle3d/Vehicle3DManager';
import Vehicle3DInspectorModal from './vehicle3d/Vehicle3DInspectorModal';
import { fetchRoadDrivingRoute } from '../../services/roadRoutingService';
import { apiRequest } from '../../services/api';

// Pre-defined detailed routes with coordinates and realistic stops
const DEFAULT_PRESET_ROUTES = {
  // Nashik Route (matches database seed) - 100% on actual paved streets
  nashik: {
    center: [19.9725, 73.762197],
    zoom: 17,
    stops: [
      { name: 'Khutawad Nagar (School Gate / Origin)', time: '07:15 AM', students: 0, lat: 19.9725, lng: 73.762197, type: 'start' },
      { name: 'ITI Signal / Trimbak Naka', time: '07:25 AM', students: 6, lat: 19.978579, lng: 73.769011, type: 'stop' },
      { name: 'College Road / ABB Circle', time: '07:38 AM', students: 8, lat: 19.986494, lng: 73.765048, type: 'stop' },
      { name: 'Canada Corner Junction', time: '07:48 AM', students: 5, lat: 19.992816, lng: 73.773521, type: 'stop' },
      { name: 'CBS Ashok Stambh', time: '08:00 AM', students: 7, lat: 19.99975, lng: 73.784469, type: 'stop' },
      { name: 'Panchavati Circle (Terminus)', time: '08:15 AM', students: 12, lat: 20.008718, lng: 73.799511, type: 'end' },
    ],
    // 331 high-precision street centerline coordinates along actual roads
    waypoints: nashikRoadWaypoints,
  },
  // Default alternate route for other cities / generic setups
  generic: {
    center: [28.6139, 77.2090],
    zoom: 17,
    stops: [
      { name: 'Main Campus Terminal', time: '07:20 AM', students: 0, lat: 28.6139, lng: 77.2090, type: 'start' },
      { name: 'Civil Lines Stop', time: '07:35 AM', students: 7, lat: 28.6230, lng: 77.2140, type: 'stop' },
      { name: 'Metro Interchange Station', time: '07:45 AM', students: 9, lat: 28.6310, lng: 77.2190, type: 'stop' },
      { name: 'North Residency Hub', time: '08:00 AM', students: 11, lat: 28.6410, lng: 77.2250, type: 'end' },
    ],
    waypoints: [
      [28.6139, 77.2090],
      [28.6170, 77.2110],
      [28.6200, 77.2125],
      [28.6230, 77.2140],
      [28.6265, 77.2160],
      [28.6288, 77.2175],
      [28.6310, 77.2190],
      [28.6345, 77.2210],
      [28.6380, 77.2230],
      [28.6410, 77.2250],
    ],
  },
};

// Calculate heading angle in degrees between two coordinate points
function calculateBearing(startLat, startLng, destLat, destLng) {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Calculate distance in kilometers between two points
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Vehicle type visual metadata and tracking assets (Uber/Ola Style)
export function getVehicleTypeInfo(type) {
  const t = (type || '').toLowerCase().trim();
  if (t.includes('van')) {
    return {
      type: 'Van',
      image: '/vehicles/van.png',
      label: 'School Van',
    };
  }
  if (t.includes('mini')) {
    return {
      type: 'Mini-bus',
      image: '/vehicles/minibus.png',
      label: 'Mini-Bus (Force Traveller)',
    };
  }
  return {
    type: 'Bus',
    image: '/vehicles/bus.png',
    label: 'School Bus (Starline)',
  };
}

// Create Uber / Ola realistic vehicle map marker with dynamic 3D WebGL model, heading radar, and status pill
export function createVehicleMarkerIcon(vehicle, bearing = 90, speed = 0, isOnline = false) {
  const vNum = vehicle?.vehicle_number || 'VEHICLE';
  const speedLabel = isOnline
    ? (speed > 0 ? `${speed} km/h` : 'LIVE')
    : (speed > 0 ? `${speed} km/h` : 'PARKED');

  return L.divIcon({
    className: 'uber-vehicle-3d-marker-wrapper',
    html: `
      <div id="live-bus-container" class="relative flex flex-col items-center justify-center select-none" style="filter: drop-shadow(0 10px 20px rgba(0,0,0,0.35));">
        <!-- Floating Minimalist Uber-style Pill -->
        <div class="mb-1 px-2.5 py-0.5 rounded-full bg-slate-900/95 backdrop-blur-md text-white border border-white/20 shadow-lg flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold">
          <span class="w-2 h-2 rounded-full ${isOnline || speed > 0 ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}"></span>
          <span class="font-mono tracking-tight text-white">${vNum}</span>
          <span id="vehicle-marker-speed-tag" class="text-[10px] px-1.5 py-0.2 rounded-full ${speed > 0 ? 'bg-emerald-500/25 text-emerald-300' : 'bg-slate-800 text-slate-300'} font-semibold font-mono">
            ${speedLabel}
          </span>
        </div>

        <!-- Real 3D WebGL Vehicle Model with Physics Mount -->
        <div id="three-vehicle-canvas-mount" class="relative w-[130px] h-[105px] flex items-center justify-center pointer-events-none"></div>
      </div>
    `,
    iconSize: [130, 135],
    iconAnchor: [65, 88],
  });
}

// Update vehicle orientation and 3D physics (road tangent heading, Ackermann steering, rolling wheels, and 360-deg radar)
export function updateVehicleMarkerOrientation(bearing, speed = 0, isOnline = false, controller3D = null) {
  if (controller3D) {
    controller3D.updatePhysics(bearing, speed);
  }

  const radarElem = document.getElementById('vehicle-heading-radar');
  if (radarElem) {
    radarElem.style.transform = `rotate(${Math.round(bearing)}deg)`;
  }

  const speedTag = document.getElementById('vehicle-marker-speed-tag');
  if (speedTag) {
    speedTag.textContent = isOnline
      ? (speed > 0 ? `${speed} km/h` : 'LIVE')
      : (speed > 0 ? `${speed} km/h` : 'PARKED');
  }
}

export default function VehicleGpsTracker({
  vehicles = [],
  selectedVehicleId,
  onSelectVehicle,
  onClose,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkerRef = useRef(null);
  const completedPolylineRef = useRef(null);
  const remainingPolylineRef = useRef(null);
  const stopMarkersRef = useRef([]);

  // Active Vehicle Selection
  const activeVehicle = useMemo(() => {
    if (selectedVehicleId) {
      const match = vehicles.find((v) => String(v.id) === String(selectedVehicleId));
      if (match) return match;
    }
    return vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  const [customRoadWaypoints, setCustomRoadWaypoints] = useState(null);

  // When activeVehicle changes, if it has custom stops, fetch vehicular road route along paved streets
  useEffect(() => {
    let customStops = activeVehicle?.route_stops;
    if (typeof customStops === 'string') {
      try {
        customStops = JSON.parse(customStops);
      } catch (e) {
        customStops = null;
      }
    }

    if (Array.isArray(customStops) && customStops.length >= 2) {
      let isMounted = true;
      fetchRoadDrivingRoute(customStops).then((res) => {
        if (isMounted && res?.roadCoords?.length > 0) {
          setCustomRoadWaypoints(res.roadCoords);
        }
      });
      return () => {
        isMounted = false;
      };
    } else {
      setCustomRoadWaypoints(null);
    }
  }, [activeVehicle?.id, activeVehicle?.route_stops]);

  // Route Definition based on selected vehicle
  const routeData = useMemo(() => {
    let customStops = activeVehicle?.route_stops;
    if (typeof customStops === 'string') {
      try {
        customStops = JSON.parse(customStops);
      } catch (e) {
        customStops = null;
      }
    }

    if (Array.isArray(customStops) && customStops.length >= 2) {
      // Use high-precision road waypoints from OSRM driving engine if available
      let waypoints = customRoadWaypoints && customRoadWaypoints.length > 0 ? customRoadWaypoints : [];
      let totalDist = 0;

      if (waypoints.length === 0) {
        for (let i = 0; i < customStops.length - 1; i++) {
          const p1 = customStops[i];
          const p2 = customStops[i + 1];
          totalDist += calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
          const SUB_STEPS = 10;
          for (let s = 0; s < SUB_STEPS; s++) {
            const t = s / SUB_STEPS;
            waypoints.push([
              p1.lat + (p2.lat - p1.lat) * t,
              p1.lng + (p2.lng - p1.lng) * t,
            ]);
          }
        }
        const last = customStops[customStops.length - 1];
        waypoints.push([last.lat, last.lng]);
      } else {
        for (let i = 0; i < waypoints.length - 1; i++) {
          totalDist += calculateDistanceKm(waypoints[i][0], waypoints[i][1], waypoints[i + 1][0], waypoints[i + 1][1]);
        }
      }

      const last = customStops[customStops.length - 1];
      const centerLat = (customStops[0].lat + last.lat) / 2;
      const centerLng = (customStops[0].lng + last.lng) / 2;

      return {
        name: activeVehicle.route_name || `${customStops[0].name} ➔ ${last.name}`,
        distance: `${Math.max(1, totalDist).toFixed(1)} km`,
        duration: `${Math.max(12, Math.round(totalDist * 3.5))} mins`,
        center: [centerLat, centerLng],
        zoom: 14,
        stops: customStops,
        waypoints: waypoints,
      };
    }

    const routeStr = (
      (activeVehicle?.route_name || '') +
      ' ' +
      (activeVehicle?.route_from || '') +
      ' ' +
      (activeVehicle?.route_to || '')
    ).toLowerCase();

    if (routeStr.includes('nashik') || routeStr.includes('panchavati') || routeStr.includes('khutawad') || routeStr.includes('mh15') || routeStr.includes('mh-15')) {
      return DEFAULT_PRESET_ROUTES.nashik;
    }

    // Dynamic generator if custom route names exist
    const base = DEFAULT_PRESET_ROUTES.nashik;
    if (activeVehicle?.route_from && activeVehicle?.route_to) {
      const customStops = [
        { name: `${activeVehicle.route_from} (Origin)`, time: '07:15 AM', students: 0, lat: base.waypoints[0][0], lng: base.waypoints[0][1], type: 'start' },
        { name: 'Central Junction Stop', time: '07:35 AM', students: 8, lat: base.waypoints[6][0], lng: base.waypoints[6][1], type: 'stop' },
        { name: 'City Plaza & Garden', time: '07:50 AM', students: 12, lat: base.waypoints[12][0], lng: base.waypoints[12][1], type: 'stop' },
        { name: `${activeVehicle.route_to} (Terminus)`, time: '08:15 AM', students: 15, lat: base.waypoints[base.waypoints.length - 1][0], lng: base.waypoints[base.waypoints.length - 1][1], type: 'end' },
      ];
      return {
        ...base,
        stops: customStops,
      };
    }

    return base;
  }, [activeVehicle, customRoadWaypoints]);

  // Live simulation & tracking states
  const [isPlaying, setIsPlaying] = useState(false); // Standby by default; only moves when driver drives or demo is played
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 4x
  const [followBus, setFollowBus] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState('streets'); // 'streets' | 'warm'
  const [camera3DMode, setCamera3DMode] = useState('isometric'); // 'isometric' | 'chase' | 'topdown'
  const [show3DInspectorModal, setShow3DInspectorModal] = useState(false);
  const vehicle3DControllerRef = useRef(null);

  // Live Driver Phone Telemetry (Uber Mobile Phone Tracking)
  const [driverTelemetry, setDriverTelemetry] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [triggeringTestDrive, setTriggeringTestDrive] = useState(false);

  // References for Uber-style continuous lerp tweening & real road trail
  const prevGpsPosRef = useRef(null);
  const targetGpsPosRef = useRef(null);
  const lerpStartTimeRef = useRef(0);
  const driverBreadcrumbsRef = useRef([]);
  const firstOnlineFixRef = useRef(false);
  const prevOnlineRef = useRef(false);

  // Sub-step position along waypoints (float index from 0 to waypoints.length - 1)
  const [progressIndex, setProgressIndex] = useState(0); // Start parked at origin stop
  const [speedKmh, setSpeedKmh] = useState(0); // 0 km/h when parked
  const [etaMinutes, setEtaMinutes] = useState(24);
  const [fuelPercentage] = useState(84);
  const [gpsSignal, setGpsSignal] = useState('Standby');
  const [nextStopName, setNextStopName] = useState('ITI Signal / Trimbak Naka');
  const [nextStopDistance, setNextStopDistance] = useState('1.2 km');
  const [boardedStudents, setBoardedStudents] = useState(15);

  // Reset tracking progress and breadcrumbs when vehicle switches
  useEffect(() => {
    setProgressIndex(0);
    setSpeedKmh(0);
    driverBreadcrumbsRef.current = [];
    prevGpsPosRef.current = null;
    targetGpsPosRef.current = null;
    firstOnlineFixRef.current = false;
    prevOnlineRef.current = false;
  }, [activeVehicle?.id]);

  // Recenter map view squarely on vehicle's current real GPS location
  const handleRecenterOnVehicle = () => {
    let targetPos = null;
    if (driverTelemetry?.is_online && driverTelemetry.current_latitude && driverTelemetry.current_longitude) {
      targetPos = [Number(driverTelemetry.current_latitude), Number(driverTelemetry.current_longitude)];
    } else if (targetGpsPosRef.current) {
      targetPos = targetGpsPosRef.current;
    } else if (activeVehicle?.current_latitude && activeVehicle?.current_longitude) {
      targetPos = [Number(activeVehicle.current_latitude), Number(activeVehicle.current_longitude)];
    } else if (busMarkerRef.current) {
      const ll = busMarkerRef.current.getLatLng();
      targetPos = [ll.lat, ll.lng];
    }

    if (targetPos && mapInstanceRef.current) {
      setFollowBus(true);
      mapInstanceRef.current.setView(targetPos, 17, { animate: true });
    }
  };

  // Synchronize 3D Camera Mode
  useEffect(() => {
    if (vehicle3DControllerRef.current) {
      vehicle3DControllerRef.current.setCameraMode(camera3DMode);
    }
  }, [camera3DMode]);

  // Synchronize 3D Vehicle Model geometry
  useEffect(() => {
    if (vehicle3DControllerRef.current && activeVehicle?.type) {
      vehicle3DControllerRef.current.setVehicleType(activeVehicle.type);
    }
  }, [activeVehicle?.type]);

  // Instant cross-tab GPS Broadcast synchronization (0ms delay between driver phone and admin map)
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window) || !activeVehicle?.id) return;
    const channel = new BroadcastChannel('school_gps_channel');

    channel.onmessage = (event) => {
      const msg = event.data;
      if (!msg || String(msg.vehicle_id) !== String(activeVehicle.id)) return;

      if (msg.type === 'GPS_PING' || msg.type === 'TRIP_TOGGLE') {
        if (msg.is_online && msg.latitude && msg.longitude) {
          const newPos = [Number(msg.latitude), Number(msg.longitude)];
          const curSpeed = Math.round(Number(msg.speed || 0));
          const heading = Number(msg.heading || 0);

          setDriverTelemetry({
            id: activeVehicle.id,
            is_online: true,
            current_latitude: newPos[0],
            current_longitude: newPos[1],
            current_speed: curSpeed,
            current_heading: heading,
            last_ping_at: msg.last_ping_at || new Date().toISOString(),
          });

          // Immediate snap to driver's current real hardware position
          firstOnlineFixRef.current = true;
          prevOnlineRef.current = true;
          prevGpsPosRef.current = newPos;
          targetGpsPosRef.current = newPos;
          lerpStartTimeRef.current = performance.now();

          if (busMarkerRef.current) {
            busMarkerRef.current.setLatLng(newPos);
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(newPos, 17, { animate: true });
          }

          updateVehicleMarkerOrientation(heading, curSpeed, true, vehicle3DControllerRef.current);

          // Add to breadcrumb trail
          const lastPt = driverBreadcrumbsRef.current[driverBreadcrumbsRef.current.length - 1];
          if (!lastPt || calculateDistanceKm(lastPt[0], lastPt[1], newPos[0], newPos[1]) > 0.003) {
            driverBreadcrumbsRef.current.push(newPos);
          }
          if (completedPolylineRef.current) {
            completedPolylineRef.current.setLatLngs(driverBreadcrumbsRef.current);
          }

          setSpeedKmh(curSpeed);
          setGpsSignal(curSpeed > 0 ? `Driver Live GPS • ${curSpeed} km/h (Live)` : 'Driver Live GPS • Online (Khutawad Nagar)');
        } else if (msg.type === 'TRIP_TOGGLE' && !msg.is_online) {
          setDriverTelemetry((prev) => (prev ? { ...prev, is_online: false } : null));
          prevOnlineRef.current = false;
          setGpsSignal('Driver Standby');
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [activeVehicle?.id]);

  // Poll driver phone live telemetry from backend via apiRequest every 1.0 second (Ultra-responsive Uber rate)
  useEffect(() => {
    if (!activeVehicle?.id) return;

    let isMounted = true;
    const fetchDriverGps = async () => {
      try {
        const res = await apiRequest(`/driver/vehicle/${activeVehicle.id}`);
        if (isMounted && res.success && res.data) {
          const tel = res.data;
          setDriverTelemetry(tel);

          if (tel.is_online && tel.current_latitude && tel.current_longitude) {
            const newPos = [Number(tel.current_latitude), Number(tel.current_longitude)];
            const hasMoved = !targetGpsPosRef.current ||
              Math.abs(targetGpsPosRef.current[0] - newPos[0]) > 0.000005 ||
              Math.abs(targetGpsPosRef.current[1] - newPos[1]) > 0.000005;

            // If driver was previously offline and just came online, force immediate recenter to current location
            if (!prevOnlineRef.current) {
              firstOnlineFixRef.current = false;
            }

            // FIRST LIVE FIX: Immediately snap vehicle marker directly to driver's real physical coordinates
            if (!firstOnlineFixRef.current) {
              firstOnlineFixRef.current = true;
              prevGpsPosRef.current = newPos;
              targetGpsPosRef.current = newPos;
              lerpStartTimeRef.current = performance.now();

              if (busMarkerRef.current) {
                busMarkerRef.current.setLatLng(newPos);
              }
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView(newPos, 17, { animate: true });
              }
              driverBreadcrumbsRef.current = [newPos];
            } else if (hasMoved) {
              if (busMarkerRef.current) {
                const cur = busMarkerRef.current.getLatLng();
                prevGpsPosRef.current = [cur.lat, cur.lng];
              } else {
                prevGpsPosRef.current = newPos;
              }
              targetGpsPosRef.current = newPos;
              lerpStartTimeRef.current = performance.now();

              // Record in breadcrumbs trail
              const lastPt = driverBreadcrumbsRef.current[driverBreadcrumbsRef.current.length - 1];
              if (!lastPt || calculateDistanceKm(lastPt[0], lastPt[1], newPos[0], newPos[1]) > 0.004) {
                driverBreadcrumbsRef.current.push(newPos);
                if (driverBreadcrumbsRef.current.length > 500) {
                  driverBreadcrumbsRef.current.shift();
                }
              }
            }

            prevOnlineRef.current = true;

            const curSpeed = Math.round(Number(tel.current_speed || 0));
            setSpeedKmh(curSpeed);
            const pingAge = tel.last_ping_at
              ? Math.max(0, Math.round((Date.now() - new Date(tel.last_ping_at).getTime()) / 1000))
              : 0;
            setGpsSignal(curSpeed > 0 ? `Driver Live GPS • ${curSpeed} km/h (${pingAge}s ago)` : `Driver Live GPS • Parked (${pingAge}s ago)`);
          } else {
            prevOnlineRef.current = false;
            setGpsSignal('Driver Standby');
          }
        }
      } catch (e) {
        console.warn('Driver telemetry polling:', e);
      }
    };

    fetchDriverGps();
    const interval = setInterval(fetchDriverGps, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeVehicle?.id]);

  const totalWaypoints = routeData.waypoints.length;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((progressIndex / (totalWaypoints - 1)) * 100))
  );

  // Total route distance in km
  const totalDistanceKm = useMemo(() => {
    let dist = 0;
    for (let i = 0; i < routeData.waypoints.length - 1; i++) {
      dist += calculateDistanceKm(
        routeData.waypoints[i][0],
        routeData.waypoints[i][1],
        routeData.waypoints[i + 1][0],
        routeData.waypoints[i + 1][1]
      );
    }
    return Math.max(1, Math.round(dist * 10) / 10);
  }, [routeData]);

  // Distance covered so far
  const distanceCoveredKm = useMemo(() => {
    return Math.round((progressPercent / 100) * totalDistanceKm * 10) / 10;
  }, [progressPercent, totalDistanceKm]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const tileUrl =
      mapStyle === 'warm'
        ? 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
        : mapStyle === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const initPos = (driverTelemetry?.is_online && driverTelemetry.current_latitude && driverTelemetry.current_longitude)
      ? [Number(driverTelemetry.current_latitude), Number(driverTelemetry.current_longitude)]
      : (activeVehicle?.current_latitude && activeVehicle?.current_longitude)
      ? [Number(activeVehicle.current_latitude), Number(activeVehicle.current_longitude)]
      : (routeData.waypoints && routeData.waypoints.length > 0)
      ? routeData.waypoints[0]
      : routeData.center;

    const map = L.map(mapContainerRef.current, {
      center: initPos,
      zoom: routeData.zoom || 17,
      zoomControl: false,
    });

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Zoom controls at bottom-left to avoid colliding with speed control deck
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    mapInstanceRef.current = map;

    // Add Stop Markers
    stopMarkersRef.current = [];
    routeData.stops.forEach((stop, idx) => {
      let pinColor = '#2563eb';
      let badgeLabel = `${idx + 1}`;
      let bgStyle = 'bg-blue-600';

      if (stop.type === 'start') {
        pinColor = '#10b981';
        badgeLabel = 'Start';
        bgStyle = 'bg-emerald-600';
      } else if (stop.type === 'end') {
        pinColor = '#7c3aed';
        badgeLabel = 'End';
        bgStyle = 'bg-purple-600';
      }

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div class="group relative flex flex-col items-center cursor-pointer select-none">
            <div class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md mb-1 whitespace-nowrap ${bgStyle}">
              ${stop.name.split('(')[0]}
            </div>
            <div class="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-black" style="background: ${pinColor}">
              ${stop.type === 'start' ? '🏁' : stop.type === 'end' ? '🏫' : badgeLabel}
            </div>
          </div>
        `,
        iconSize: [110, 44],
        iconAnchor: [55, 42],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .addTo(map)
        .bindPopup(
          `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
            <div style="font-size: 11px; font-weight: 800; color: #1e293b; margin-bottom: 2px;">${stop.name}</div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">Scheduled Time: <strong>${stop.time}</strong></div>
            <div style="font-size: 10px; font-weight: 600; color: #2563eb;">Students at stop: ${stop.students || 'All'}</div>
          </div>
        `,
          { closeButton: false }
        );

      stopMarkersRef.current.push(marker);
    });

    // Planned Route Polyline (Uber / Google Maps sleek royal blue route)
    remainingPolylineRef.current = L.polyline(routeData.waypoints, {
      color: '#2563eb',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Completed Path (solid vibrant emerald road trail)
    completedPolylineRef.current = L.polyline([], {
      color: '#10b981',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Initial vehicle marker (Uber/Ola tracking style with image based on vehicle type)
    const initBearing = routeData.waypoints.length > 1
      ? calculateBearing(routeData.waypoints[0][0], routeData.waypoints[0][1], routeData.waypoints[1][0], routeData.waypoints[1][1])
      : 90;

    const busIcon = createVehicleMarkerIcon(activeVehicle, initBearing, 0, false);

    busMarkerRef.current = L.marker(initPos, { icon: busIcon, zIndexOffset: 1000 }).addTo(map);

    // Initialize Real 3D WebGL Model with real physics inside map marker
    const mount3D = document.getElementById('three-vehicle-canvas-mount');
    if (mount3D) {
      if (vehicle3DControllerRef.current) {
        vehicle3DControllerRef.current.destroy();
      }
      vehicle3DControllerRef.current = initVehicle3D(mount3D, {
        vehicleType: activeVehicle?.type || 'Bus',
        initialBearing: initBearing,
        initialSpeed: 0,
        cameraMode: camera3DMode,
        width: 140,
        height: 115,
      });
    }

    // Center map view directly on vehicle location at street zoom level (17)
    map.setView(initPos, 17);

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView(initPos, 17);
      }
      // Re-check mount if Leaflet DOM finished on next frame
      const retryMount = document.getElementById('three-vehicle-canvas-mount');
      if (retryMount && retryMount.children.length === 0) {
        vehicle3DControllerRef.current = initVehicle3D(retryMount, {
          vehicleType: activeVehicle?.type || 'Bus',
          initialBearing: initBearing,
          initialSpeed: 0,
          cameraMode: camera3DMode,
          width: 140,
          height: 115,
        });
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (vehicle3DControllerRef.current) {
        vehicle3DControllerRef.current.destroy();
        vehicle3DControllerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routeData, mapStyle, activeVehicle]);

  // Real-time animation loop along route (both for Live Driver GPS stream and Demo playback)
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const tick = (now) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      // CASE 1: Driver Mobile Phone is actively transmitting live GPS (Uber Mode)
      if (driverTelemetry?.is_online && targetGpsPosRef.current && prevGpsPosRef.current && busMarkerRef.current) {
        const elapsed = now - lerpStartTimeRef.current;
        const duration = 1100; // smooth 1.1s glide between 1.0s pings
        const t = Math.min(1, Math.max(0, elapsed / duration));
        const easeT = 1 - Math.pow(1 - t, 3); // Cubic ease-out

        const liveLat = prevGpsPosRef.current[0] + (targetGpsPosRef.current[0] - prevGpsPosRef.current[0]) * easeT;
        const liveLng = prevGpsPosRef.current[1] + (targetGpsPosRef.current[1] - prevGpsPosRef.current[1]) * easeT;
        const livePos = [liveLat, liveLng];

        busMarkerRef.current.setLatLng(livePos);

        const spd = Math.round(Number(driverTelemetry.current_speed || 0));
        setSpeedKmh(spd);

        const bearing = driverTelemetry.current_heading !== null && driverTelemetry.current_heading !== undefined && !isNaN(driverTelemetry.current_heading)
          ? Number(driverTelemetry.current_heading)
          : calculateBearing(prevGpsPosRef.current[0], prevGpsPosRef.current[1], targetGpsPosRef.current[0], targetGpsPosRef.current[1]);

        updateVehicleMarkerOrientation(bearing, spd, true, vehicle3DControllerRef.current);

        // Update live completed breadcrumbs trail
        if (completedPolylineRef.current) {
          const trail = [...driverBreadcrumbsRef.current, livePos];
          completedPolylineRef.current.setLatLngs(trail);
        }

        // Center camera if followBus is active
        if (followBus && mapInstanceRef.current) {
          mapInstanceRef.current.panTo(livePos, { animate: true, duration: 0.1 });
        }

        // Dynamic ETA calculation to next route stop based on live position
        if (routeData.stops && routeData.stops.length > 0) {
          const upcomingStop = routeData.stops.find((s) => {
            const d = calculateDistanceKm(liveLat, liveLng, s.lat, s.lng);
            return d > 0.08;
          }) || routeData.stops[routeData.stops.length - 1];

          if (upcomingStop) {
            setNextStopName(upcomingStop.name);
            const distKm = calculateDistanceKm(liveLat, liveLng, upcomingStop.lat, upcomingStop.lng);
            setNextStopDistance(`${Math.max(0.1, Math.round(distKm * 10) / 10)} km`);
            const estSpeed = spd > 10 ? spd : 28;
            setEtaMinutes(Math.max(1, Math.round((distKm / estSpeed) * 60)));
          }
        }
      }
      // CASE 2: Standby Demo Playback along route waypoints (when driver is offline)
      else if (isPlaying && !driverTelemetry?.is_online && routeData.waypoints.length > 1) {
        setProgressIndex((prev) => {
          const maxIdx = routeData.waypoints.length - 1;
          const speedStep = 0.55 * playbackSpeed * deltaSec;
          let next = prev + speedStep;
          if (next >= maxIdx) {
            next = 0; // Loop or reach terminus
          }
          return next;
        });
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, routeData, driverTelemetry, followBus]);

  // Update marker position & heading for Standby Demo mode when progressIndex updates
  useEffect(() => {
    if (!mapInstanceRef.current || !busMarkerRef.current) return;
    if (driverTelemetry?.is_online) return; // Driver telemetry handled continuously in RAF tick
    if (!isPlaying) return; // Only step through waypoints when Demo is actively playing

    const waypoints = routeData.waypoints;
    const maxIdx = waypoints.length - 1;
    const clampedIndex = Math.min(maxIdx, Math.max(0, progressIndex));

    const segIdx = Math.floor(clampedIndex);
    const segT = clampedIndex - segIdx;

    const p1 = waypoints[segIdx];
    const p2 = waypoints[Math.min(segIdx + 1, maxIdx)];

    // Interpolate lat & lng smoothly
    const currLat = p1[0] + (p2[0] - p1[0]) * segT;
    const currLng = p1[1] + (p2[1] - p1[1]) * segT;
    const currentLatLng = [currLat, currLng];

    // Calculate heading angle
    const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

    // Update Bus marker position
    busMarkerRef.current.setLatLng(currentLatLng);

    // Update 3D model physics, steering, rolling wheels, and 360-degree radar heading according to road bearing
    updateVehicleMarkerOrientation(bearing, isPlaying ? speedKmh : 0, false, vehicle3DControllerRef.current);

    // Update completed path
    const completedPts = waypoints.slice(0, segIdx + 1);
    completedPts.push(currentLatLng);
    if (completedPolylineRef.current) {
      completedPolylineRef.current.setLatLngs(completedPts);
    }

    // Auto-pan if followBus is active
    if (followBus && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(currentLatLng, {
        animate: true,
        duration: 0.25,
      });
    }

    // Telemetry speed: 0 when paused/parked, dynamic only during active demo playback
    if (!isPlaying) {
      setSpeedKmh(0);
    } else {
      const baseSpeed = segT > 0.85 || segT < 0.15 ? 24 : 42;
      const wobble = Math.sin(clampedIndex * 5) * 6;
      setSpeedKmh(Math.max(15, Math.round(baseSpeed + wobble)));
    }

    // Next stop & ETA calculations
    const remainingFraction = 1 - clampedIndex / maxIdx;
    const etaEst = Math.max(1, Math.round(remainingFraction * 26));
    setEtaMinutes(etaEst);

    // Find next upcoming stop
    const nextStop = routeData.stops.find((s) => {
      const stopDist = calculateDistanceKm(currLat, currLng, s.lat, s.lng);
      return stopDist > 0.15;
    }) || routeData.stops[routeData.stops.length - 1];

    if (nextStop) {
      setNextStopName(nextStop.name);
      const d = calculateDistanceKm(currLat, currLng, nextStop.lat, nextStop.lng);
      setNextStopDistance(`${Math.max(0.1, Math.round(d * 10) / 10)} km`);
    }

    // Simulated boarding increase as route progresses
    const pct = clampedIndex / maxIdx;
    const maxCapacity = activeVehicle?.capacity || 40;
    const currentBoarded = Math.min(maxCapacity, Math.floor(14 + pct * (maxCapacity - 16)));
    setBoardedStudents(currentBoarded);
  }, [progressIndex, followBus, routeData, activeVehicle]);

  // Center on Vehicle action
  const handleCenterOnBus = () => {
    if (!mapInstanceRef.current || !busMarkerRef.current) return;
    const currentPos = busMarkerRef.current.getLatLng();
    mapInstanceRef.current.setView(currentPos, 17, { animate: true });
    setFollowBus(true);
  };

  // Reset route tracking to start
  const handleResetRoute = () => {
    setProgressIndex(0);
    setIsPlaying(true);
    if (mapInstanceRef.current && routeData.waypoints.length > 0) {
      mapInstanceRef.current.setView(routeData.waypoints[0], 17, { animate: true });
    }
  };

  // Trigger test driver phone drive in simulated popup
  const handleTestDriverDrive = async () => {
    if (!activeVehicle?.id) return;
    setTriggeringTestDrive(true);
    try {
      await apiRequest.post('/driver/toggle-trip', { vehicle_id: activeVehicle.id, is_online: true });

      const startPt = routeData.waypoints[0] || [19.9725, 73.762197];
      await apiRequest.post('/driver/gps-ping', {
        vehicle_id: activeVehicle.id,
        latitude: startPt[0],
        longitude: startPt[1],
        heading: 68,
        speed: 38,
      });

      window.open(`/driver-tracker?vehicle_id=${activeVehicle.id}`, '_blank', 'width=420,height=780');
    } catch (e) {
      console.warn('Test drive trigger error:', e);
    } finally {
      setTriggeringTestDrive(false);
    }
  };

  return (
    <div
      className={`relative w-full h-[650px] sm:h-[720px] lg:h-[760px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-slate-100 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''
      }`}
    >
      {/* Main Interactive Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top-Left Floating Navigation & Vehicle Selector (Uber Style) */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 max-w-[calc(100%-140px)] sm:max-w-md pointer-events-auto">
        {onClose && (
          <button
            onClick={onClose}
            className="h-10 px-3 rounded-2xl bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-md hover:shadow-lg backdrop-blur-md text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
            title="Back to Fleet Roster"
          >
            <LuArrowLeft className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Fleet</span>
          </button>
        )}

        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 shadow-md hover:shadow-lg transition-all min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/60 p-1 flex items-center justify-center shrink-0">
            <img
              src={getVehicleTypeInfo(activeVehicle?.type).image}
              alt="Vehicle"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="min-w-0 pr-1">
            {vehicles.length > 1 ? (
              <div className="relative flex items-center">
                <select
                  value={activeVehicle?.id || ''}
                  onChange={(e) => onSelectVehicle && onSelectVehicle(e.target.value)}
                  className="appearance-none bg-transparent pr-5 text-xs font-black text-slate-900 focus:outline-none cursor-pointer truncate max-w-[150px] sm:max-w-[210px]"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} — {v.driver_name || 'Driver'}
                    </option>
                  ))}
                </select>
                <LuChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 pointer-events-none" />
              </div>
            ) : (
              <div className="text-xs font-black text-slate-900 truncate">
                {activeVehicle?.vehicle_number}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${driverTelemetry?.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="font-semibold text-slate-700">
                {driverTelemetry?.is_online ? (speedKmh > 0 ? `${speedKmh} km/h` : 'Live') : 'Standby'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="truncate">{activeVehicle?.route_name || activeVehicle?.route_to || 'School Route'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top-Right Floating Map Controls (Uber / Google Maps Style) */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 pointer-events-auto">
        {/* Connect Driver App Button */}
        <button
          onClick={() => setShowDriverModal(true)}
          className={`h-10 px-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-95 ${
            driverTelemetry?.is_online
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/25'
              : 'bg-white/95 hover:bg-white text-slate-800 border-slate-200/90'
          }`}
          title="Connect Driver Smartphone"
        >
          <LuSmartphone className={`w-4 h-4 ${driverTelemetry?.is_online ? 'text-white' : 'text-emerald-600'}`} />
          <span className="hidden sm:inline">
            {driverTelemetry?.is_online ? 'Driver GPS Active' : 'Connect Driver'}
          </span>
          {driverTelemetry?.is_online && (
            <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5"></span>
          )}
        </button>

        {/* Point Bus / Re-center on Vehicle */}
        <button
          onClick={handleRecenterOnVehicle}
          title="Point Map to Vehicle Location"
          className="w-10 h-10 rounded-2xl bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-md hover:shadow-lg flex items-center justify-center transition-all active:scale-95"
        >
          <LuCrosshair className="w-4 h-4 text-emerald-600" />
        </button>

        {/* Map Style Toggle */}
        <button
          onClick={() => setMapStyle((m) => (m === 'streets' ? 'warm' : m === 'warm' ? 'satellite' : 'streets'))}
          title={`Toggle Map Style (Current: ${mapStyle})`}
          className="w-10 h-10 rounded-2xl bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 shadow-md hover:shadow-lg flex items-center justify-center transition-all active:scale-95"
        >
          <LuLayers className="w-4 h-4 text-orange-500" />
        </button>
      </div>

      {/* Floating Bottom Uber/Ola Ride Trip Card */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] max-w-xl mx-auto pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-4 sm:p-5 space-y-3 transition-all">
          {/* Driver & Vehicle Profile Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Driver Avatar */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black text-sm flex items-center justify-center shadow-md">
                  {(activeVehicle?.driver_name || 'D').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black ${
                    driverTelemetry?.is_online ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'
                  }`}
                >
                  {driverTelemetry?.is_online ? '●' : '—'}
                </span>
              </div>

              {/* Driver and Vehicle Meta */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {activeVehicle?.driver_name || 'Assigned Driver'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {getVehicleTypeInfo(activeVehicle?.type).type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate mt-0.5">
                  <span className="font-mono font-bold text-slate-800">{activeVehicle?.vehicle_number}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <LuShieldCheck className="w-3.5 h-3.5" />
                    {driverTelemetry?.is_online ? (speedKmh > 0 ? `${speedKmh} km/h` : 'Parked') : 'Standby'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{boardedStudents} / {activeVehicle?.capacity || 40} Students</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Call Driver + Test Demo) */}
            <div className="flex items-center gap-2 shrink-0">
              {activeVehicle?.driver_phone && (
                <a
                  href={`tel:${activeVehicle.driver_phone}`}
                  className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95"
                  title={`Call driver: ${activeVehicle.driver_phone}`}
                >
                  <LuPhone className="w-4 h-4" />
                </a>
              )}

              {/* Discreet Demo Route Simulator Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`h-10 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm active:scale-95 ${
                  isPlaying
                    ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title={isPlaying ? 'Pause Demo' : 'Simulate Demo Drive'}
              >
                {isPlaying ? <LuPause className="w-4 h-4" /> : <LuPlay className="w-4 h-4" />}
                <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Demo'}</span>
              </button>
            </div>
          </div>

          {/* Route Info & Subtle Progress Line */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5 truncate">
                <LuNavigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{activeVehicle?.route_name || 'Standard Route'}</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">
                {distanceCoveredKm} / {totalDistanceKm} km ({progressPercent}%)
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Driver Mobile Phone GPS Pairing Modal (Uber App Link & Live Status) */}
      {showDriverModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-md w-full p-6 text-white shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDriverModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <LuX className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
                <LuSmartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-white leading-tight">
                  Driver GPS Hardware Tracking
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connect driver's smartphone to track bus in real time
                </p>
              </div>
            </div>

            {/* Vehicle & Driver Details Card */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={getVehicleTypeInfo(activeVehicle?.type).image}
                    alt="Vehicle"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {activeVehicle?.vehicle_number} • {getVehicleTypeInfo(activeVehicle?.type).type}
                  </div>
                  <div className="text-[11px] text-amber-400 font-medium truncate">
                    {activeVehicle?.driver_name || 'Assigned Driver'}
                  </div>
                </div>
              </div>

              {driverTelemetry?.is_online ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase flex items-center gap-1.5 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Online
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase shrink-0">
                  Offline
                </span>
              )}
            </div>

            {/* Live Telemetry Status Banner */}
            {driverTelemetry?.is_online ? (
              <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-500/40 text-emerald-200 text-xs space-y-1.5 mb-3">
                <div className="flex items-center justify-between font-bold text-white">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Broadcasting Live GPS
                  </span>
                  <span className="font-mono text-[11px] text-emerald-300">
                    {driverTelemetry?.current_speed || 0} km/h
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono flex items-center justify-between">
                  <span>Coordinates:</span>
                  <span className="text-white">
                    {Number(driverTelemetry?.current_latitude || 0).toFixed(5)}, {Number(driverTelemetry?.current_longitude || 0).toFixed(5)}
                  </span>
                </div>
                <div className="text-[10.5px] text-emerald-400/90 pt-0.5 border-t border-emerald-500/20">
                  Last ping: {driverTelemetry?.last_ping_at ? new Date(driverTelemetry.last_ping_at).toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-500/30 text-amber-200 text-xs mb-3 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span>Driver app is currently in <strong>Standby</strong>. Open the link below or trigger a test drive to start live streaming.</span>
              </div>
            )}

            {/* Driver Mobile URL Box */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 mb-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Driver Mobile URL (Open on Driver's Smartphone)
              </div>
              <div className="text-xs font-mono text-emerald-400 break-all select-all bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                {window.location.origin}/driver-tracker?vehicle_id={activeVehicle?.id || 1}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 mb-3">
              <button
                onClick={() => {
                  window.open(
                    `/driver-tracker?vehicle_id=${activeVehicle?.id || 1}`,
                    '_blank',
                    'width=420,height=780'
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
              >
                <LuExternalLink className="w-4 h-4" />
                Launch Driver Mobile App (Phone Window)
              </button>

              <button
                onClick={handleTestDriverDrive}
                disabled={triggeringTestDrive}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
              >
                <LuRadio className="w-4 h-4 animate-pulse" />
                {triggeringTestDrive ? 'Starting Live Simulation...' : 'Trigger Real-Road Live Drive (1-Tap Test)'}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/driver-tracker?vehicle_id=${activeVehicle?.id || 1}`
                  );
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                {copiedLink ? <LuCheck className="w-4 h-4 text-emerald-400" /> : <LuCopy className="w-4 h-4" />}
                {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Link for Driver (WhatsApp / SMS)'}
              </button>
            </div>

            {/* Explanatory Info */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <LuShieldCheck className="w-3.5 h-3.5" /> How Uber GPS Tracking Works:
              </div>
              <p className="text-slate-400 leading-relaxed text-[10.5px]">
                1. Driver opens the mobile URL on their smartphone (Chrome / Safari).<br/>
                2. Driver taps <strong>GO ONLINE</strong> to start the school route.<br/>
                3. The smartphone's GPS chip transmits coordinates directly to this map.<br/>
                4. This admin screen smoothly glides and steers the vehicle along the road!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time 3D Vehicle Physics & Steering Inspector Studio */}
      {show3DInspectorModal && (
        <Vehicle3DInspectorModal
          vehicle={activeVehicle}
          onClose={() => setShow3DInspectorModal(false)}
        />
      )}
    </div>
  );
}
