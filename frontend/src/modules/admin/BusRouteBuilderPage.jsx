import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  LuArrowLeft,
  LuPlus,
  LuTrash2,
  LuArrowUp,
  LuArrowDown,
  LuCheck,
  LuLoader,
  LuRadio,
  LuNavigation,
  LuLocate,
  LuBus,
  LuMaximize2,
  LuSearch,
  LuMapPin,
  LuCrosshair,
  LuX,
  LuLayers,
} from 'react-icons/lu';
import { adminService } from '../../services/adminService';
import { fetchRoadDrivingRoute } from '../../services/roadRoutingService';

// Forward Geocoding: Search places online using OpenStreetMap / Photon API
async function searchLocationsOnline(query) {
  if (!query || query.trim().length < 2) return [];
  const cleanQ = query.trim();

  // 1. Try Nominatim search with addressdetails
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQ
    )}&limit=6&addressdetails=1`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => {
          const addr = item.address || {};
          const landmark =
            addr.amenity ||
            addr.college ||
            addr.school ||
            addr.hospital ||
            addr.building ||
            addr.tourism ||
            item.name ||
            '';
          const road = addr.road || addr.suburb || addr.neighbourhood || '';
          const city = addr.city || addr.town || addr.county || '';

          let title = landmark || item.name || cleanQ;
          if (landmark && road && !landmark.toLowerCase().includes(road.toLowerCase())) {
            title = `${landmark}, ${road}`;
          }

          return {
            name: title,
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        });
      }
    }
  } catch (err) {
    console.warn('Nominatim search failed, trying fallback:', err);
  }

  // 2. Fallback to Photon API
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&limit=5`;
    const pRes = await fetch(photonUrl);
    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData?.features?.length > 0) {
        return pData.features.map((f) => {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const title = p.name || cleanQ;
          const subtitle = [p.street, p.district, p.city, p.state].filter(Boolean).join(', ');
          return {
            name: subtitle ? `${title}, ${p.city || p.district || ''}` : title,
            address: subtitle || title,
            lat: coords[1],
            lng: coords[0],
          };
        });
      }
    }
  } catch (pErr) {
    console.warn('Photon fallback failed:', pErr);
  }

  return [];
}

// Reverse Geocoding: Look up human-readable place / road name from coordinates
async function reverseGeocodeLocation(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const landmark =
        addr.amenity ||
        addr.college ||
        addr.school ||
        addr.hospital ||
        addr.tourism ||
        addr.building ||
        data.name;
      const road = addr.road || addr.neighbourhood;
      const suburb = addr.suburb || addr.city_district;
      const city = addr.city || addr.town || addr.village;

      if (landmark) {
        return suburb ? `${landmark}, ${suburb}` : road ? `${landmark}, ${road}` : landmark;
      }
      if (road && suburb) {
        return `${road}, ${suburb}`;
      }
      if (road) {
        return city ? `${road}, ${city}` : road;
      }
      if (suburb) {
        return city ? `${suburb}, ${city}` : suburb;
      }
      if (data.display_name) {
        return data.display_name.split(',').slice(0, 2).join(',').trim();
      }
    }
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
  }
  return null;
}

// Google Maps Style Location Tracker Input Component with Autocomplete
function LocationTrackerInput({
  value,
  onChange,
  onSelectLocation,
  placeholder,
  onLocateOnMap,
  onTrackCurrentGps,
  isLoading = false,
}) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search places as user types
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchLocationsOnline(query);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    setQuery(item.name);
    setShowDropdown(false);
    onSelectLocation(item);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 transition-all">
        {searching || isLoading ? (
          <LuLoader className="w-3.5 h-3.5 animate-spin text-blue-500 shrink-0" />
        ) : (
          <LuSearch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('');
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <LuX className="w-3 h-3" />
          </button>
        )}
        {onTrackCurrentGps && (
          <button
            type="button"
            onClick={onTrackCurrentGps}
            title="Use current GPS location"
            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
          >
            <LuCrosshair className="w-3.5 h-3.5" />
          </button>
        )}
        {onLocateOnMap && (
          <button
            type="button"
            onClick={onLocateOnMap}
            title="Locate on map"
            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
          >
            <LuLocate className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Google Maps Style Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-[2500] max-h-64 overflow-y-auto animate-scale-up">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
            <span>Places & Landmarks</span>
            <span className="text-blue-600 font-extrabold">Google Map Finder</span>
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50/80 transition-colors flex items-start gap-2.5 border-b border-slate-50 last:border-b-0 group"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                <LuMapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.address}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BusRouteBuilderPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryVehicleId = searchParams.get('vehicle_id');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const polylineRef = useRef(null);
  const routeCasingRef = useRef(null);

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState(queryVehicleId || '');

  // Map tile style: 'google' | 'satellite' | 'osm'
  const [mapStyle, setMapStyle] = useState('google');

  // Road Routing Driving states (OSRM Paved Street Paths)
  const [roadStats, setRoadStats] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [roadWaypoints, setRoadWaypoints] = useState([]);

  // Start point state
  const [startPoint, setStartPoint] = useState({
    name: '',
    lat: 19.9725,
    lng: 73.7622,
  });

  // Intermediate pickup points state
  const [pickupPoints, setPickupPoints] = useState([]);

  // Ending point state
  const [endPoint, setEndPoint] = useState({
    name: '',
    lat: 20.0087,
    lng: 73.7995,
  });

  // Map placement mode: 'pickup' | 'start' | 'end'
  const [placementMode, setPlacementMode] = useState('pickup');
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [loadingGeocoding, setLoadingGeocoding] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Fetch all vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const res = await adminService.getVehicles();
        if (res.success) {
          const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setVehicles(list);
          if (!selectedVehicleId && list.length > 0) {
            setSelectedVehicleId(queryVehicleId || list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  // Update URL param when vehicle changes
  const handleSelectVehicle = (id) => {
    setSelectedVehicleId(id);
    setSearchParams({ vehicle_id: id });
  };

  // Load selected vehicle's existing route & stops
  useEffect(() => {
    if (!selectedVehicleId || vehicles.length === 0) return;
    const curVehicle = vehicles.find((v) => String(v.id) === String(selectedVehicleId));
    if (!curVehicle) return;

    let stops = curVehicle.route_stops;
    if (typeof stops === 'string') {
      try {
        stops = JSON.parse(stops);
      } catch (e) {
        stops = null;
      }
    }

    if (Array.isArray(stops) && stops.length >= 2) {
      const s = stops[0];
      const e = stops[stops.length - 1];
      const mids = stops.slice(1, stops.length - 1).map((m, idx) => ({
        id: Date.now() + idx,
        name: m.name || `Pickup Stop #${idx + 1}`,
        lat: Number(m.lat) || 19.98,
        lng: Number(m.lng) || 73.77,
      }));

      setStartPoint({
        name: s.name || curVehicle.route_from || '',
        lat: Number(s.lat) || 19.9725,
        lng: Number(s.lng) || 73.7622,
      });

      setEndPoint({
        name: e.name || curVehicle.route_to || '',
        lat: Number(e.lat) || 20.0087,
        lng: Number(e.lng) || 73.7995,
      });

      setPickupPoints(mids);
    } else {
      setStartPoint({
        name: curVehicle.route_from || '',
        lat: 19.9725,
        lng: 73.7622,
      });
      setEndPoint({
        name: curVehicle.route_to || '',
        lat: 20.0087,
        lng: 73.7995,
      });
      setPickupPoints([]);
    }
  }, [selectedVehicleId, vehicles]);

  // Add a new pickup point dynamically
  const handleAddPickupPoint = async (coords = null, customName = null) => {
    let lat = startPoint.lat + 0.004;
    let lng = startPoint.lng + 0.004;

    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    } else if (pickupPoints.length > 0) {
      const last = pickupPoints[pickupPoints.length - 1];
      lat = last.lat + 0.003;
      lng = last.lng + 0.003;
    }

    const roundedLat = Math.round(lat * 1000000) / 1000000;
    const roundedLng = Math.round(lng * 1000000) / 1000000;

    let placeName = customName || '';

    // If no customName provided and coordinates exist, reverse geocode to find exact place name
    if (!placeName) {
      setLoadingGeocoding(true);
      const detected = await reverseGeocodeLocation(roundedLat, roundedLng);
      placeName = detected || `Pickup Stop #${pickupPoints.length + 1}`;
      setLoadingGeocoding(false);
    }

    const newStop = {
      id: Date.now(),
      name: placeName,
      lat: roundedLat,
      lng: roundedLng,
    };

    setPickupPoints((prev) => [...prev, newStop]);
    showToast(`Added: ${placeName}`);
  };

  // Remove a pickup point
  const handleRemovePickupPoint = (id) => {
    setPickupPoints((prev) => prev.filter((p) => p.id !== id));
  };

  // Move pickup point up/down
  const handleMovePickup = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= pickupPoints.length) return;
    const updated = [...pickupPoints];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPickupPoints(updated);
  };

  // Update pickup point name
  const handleUpdatePickupName = (id, name) => {
    setPickupPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  // Track user's device GPS location
  const handleTrackDeviceLocation = (targetType, stopId = null) => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    showToast('Acquiring current GPS location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 1000000) / 1000000;
        const lng = Math.round(pos.coords.longitude * 1000000) / 1000000;

        const placeName = (await reverseGeocodeLocation(lat, lng)) || 'Current Location';

        if (targetType === 'start') {
          setStartPoint({ name: placeName, lat, lng });
          showToast(`Start location set: ${placeName}`);
        } else if (targetType === 'end') {
          setEndPoint({ name: placeName, lat, lng });
          showToast(`Destination set: ${placeName}`);
        } else if (targetType === 'pickup' && stopId) {
          setPickupPoints((prev) =>
            prev.map((p) => (p.id === stopId ? { ...p, name: placeName, lat, lng } : p))
          );
          showToast(`Pickup stop set: ${placeName}`);
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
        }
      },
      (err) => {
        showToast(`GPS Error: ${err.message || 'Unable to retrieve location'}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Initialize interactive Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [startPoint.lat, startPoint.lng],
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default tile layer: Google Maps Road Layer
    const getTileUrl = (style) => {
      if (style === 'google') return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      if (style === 'satellite') return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    };

    tileLayerRef.current = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 20,
      attribution: '© Google Maps / OpenStreetMap',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    // Outer border/casing for realistic Google Maps highway route styling
    routeCasingRef.current = L.polyline([], {
      color: '#1d4ed8',
      weight: 8,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Inner vibrant core polyline following actual paved roads
    polylineRef.current = L.polyline([], {
      color: '#38bdf8',
      weight: 5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Click on map to place/move stop & auto reverse-geocode place name
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      const roundedLat = Math.round(lat * 1000000) / 1000000;
      const roundedLng = Math.round(lng * 1000000) / 1000000;

      if (placementMode === 'start') {
        showToast('Finding place name for Start point...');
        setStartPoint((prev) => ({ ...prev, lat: roundedLat, lng: roundedLng }));
        const placeName = await reverseGeocodeLocation(roundedLat, roundedLng);
        if (placeName) {
          setStartPoint((prev) => ({ ...prev, name: placeName }));
          showToast(`Start: ${placeName}`);
        }
      } else if (placementMode === 'end') {
        showToast('Finding place name for Destination...');
        setEndPoint((prev) => ({ ...prev, lat: roundedLat, lng: roundedLng }));
        const placeName = await reverseGeocodeLocation(roundedLat, roundedLng);
        if (placeName) {
          setEndPoint((prev) => ({ ...prev, name: placeName }));
          showToast(`Destination: ${placeName}`);
        }
      } else {
        // Pickup mode: Add stop with auto-discovered place name
        await handleAddPickupPoint({ lat: roundedLat, lng: roundedLng });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [placementMode]);

  // Switch Map Tiles (Google Maps / Satellite / OSM)
  useEffect(() => {
    if (!tileLayerRef.current || !mapInstanceRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const getTileUrl = (style) => {
      if (style === 'google') return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      if (style === 'satellite') return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    };

    tileLayerRef.current = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 20,
      attribution: '© Google Maps / OpenStreetMap',
    }).addTo(mapInstanceRef.current);
  }, [mapStyle]);

  // Update map markers & connecting polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    const allCoords = [];

    // 1. Start Point Marker (Emerald Circle Pin)
    allCoords.push([startPoint.lat, startPoint.lng]);
    const startLabel = startPoint.name ? `Start: ${startPoint.name.slice(0, 18)}` : 'Start Origin';
    const startIcon = L.divIcon({
      className: 'route-marker-clean',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:grab;">
          <div style="background:#059669; color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; box-shadow:0 2px 6px rgba(0,0,0,0.3); white-space:nowrap; margin-bottom:2px; border:1.5px solid #ffffff;">
            🏁 ${startLabel}
          </div>
          <div style="width:26px; height:26px; background:#10b981; border:3px solid #ffffff; border-radius:50%; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px;">
            🏁
          </div>
        </div>
      `,
      iconSize: [140, 50],
      iconAnchor: [70, 48],
    });

    const startMarker = L.marker([startPoint.lat, startPoint.lng], {
      icon: startIcon,
      draggable: true,
    }).addTo(markersLayerRef.current);

    startMarker.on('dragend', async (e) => {
      const { lat, lng } = e.target.getLatLng();
      const roundedLat = Math.round(lat * 1000000) / 1000000;
      const roundedLng = Math.round(lng * 1000000) / 1000000;
      setStartPoint((prev) => ({ ...prev, lat: roundedLat, lng: roundedLng }));
      const detected = await reverseGeocodeLocation(roundedLat, roundedLng);
      if (detected) {
        setStartPoint((prev) => ({ ...prev, name: detected }));
        showToast(`Start: ${detected}`);
      }
    });

    // 2. Intermediate Pickup Points (Blue Badges)
    pickupPoints.forEach((p, idx) => {
      allCoords.push([p.lat, p.lng]);
      const stopLabel = p.name ? `#${idx + 1} ${p.name.slice(0, 16)}` : `Stop #${idx + 1}`;
      const pickupIcon = L.divIcon({
        className: 'route-marker-clean',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:grab;">
            <div style="background:#2563eb; color:#fff; font-size:10px; font-weight:700; padding:2px 7px; border-radius:999px; box-shadow:0 2px 6px rgba(0,0,0,0.3); white-space:nowrap; margin-bottom:2px; border:1.5px solid #ffffff;">
              ${stopLabel}
            </div>
            <div style="width:24px; height:24px; background:#3b82f6; border:2.5px solid #ffffff; border-radius:50%; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:800;">
              ${idx + 1}
            </div>
          </div>
        `,
        iconSize: [130, 48],
        iconAnchor: [65, 46],
      });

      const pMarker = L.marker([p.lat, p.lng], {
        icon: pickupIcon,
        draggable: true,
      }).addTo(markersLayerRef.current);

      pMarker.on('dragend', async (e) => {
        const { lat, lng } = e.target.getLatLng();
        const roundedLat = Math.round(lat * 1000000) / 1000000;
        const roundedLng = Math.round(lng * 1000000) / 1000000;
        setPickupPoints((prev) =>
          prev.map((item) =>
            item.id === p.id
              ? { ...item, lat: roundedLat, lng: roundedLng }
              : item
          )
        );
        const detected = await reverseGeocodeLocation(roundedLat, roundedLng);
        if (detected) {
          setPickupPoints((prev) =>
            prev.map((item) => (item.id === p.id ? { ...item, name: detected } : item))
          );
          showToast(`Stop #${idx + 1}: ${detected}`);
        }
      });
    });

    // 3. Ending Point Marker (Purple Campus Pin)
    allCoords.push([endPoint.lat, endPoint.lng]);
    const endLabel = endPoint.name ? `End: ${endPoint.name.slice(0, 18)}` : 'Destination';
    const endIcon = L.divIcon({
      className: 'route-marker-clean',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:grab;">
          <div style="background:#7c3aed; color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px; box-shadow:0 2px 6px rgba(0,0,0,0.3); white-space:nowrap; margin-bottom:2px; border:1.5px solid #ffffff;">
            🏫 ${endLabel}
          </div>
          <div style="width:26px; height:26px; background:#8b5cf6; border:3px solid #ffffff; border-radius:50%; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px;">
            🏫
          </div>
        </div>
      `,
      iconSize: [140, 50],
      iconAnchor: [70, 48],
    });

    const endMarker = L.marker([endPoint.lat, endPoint.lng], {
      icon: endIcon,
      draggable: true,
    }).addTo(markersLayerRef.current);

    endMarker.on('dragend', async (e) => {
      const { lat, lng } = e.target.getLatLng();
      const roundedLat = Math.round(lat * 1000000) / 1000000;
      const roundedLng = Math.round(lng * 1000000) / 1000000;
      setEndPoint((prev) => ({ ...prev, lat: roundedLat, lng: roundedLng }));
      const detected = await reverseGeocodeLocation(roundedLat, roundedLng);
      if (detected) {
        setEndPoint((prev) => ({ ...prev, name: detected }));
        showToast(`Destination: ${detected}`);
      }
    });

    // Fetch vehicular road driving route along paved streets
    let isCancelled = false;
    const fetchRoadRoute = async () => {
      setIsRouting(true);
      const stopsToRoute = [startPoint, ...pickupPoints, endPoint];
      const routeResult = await fetchRoadDrivingRoute(stopsToRoute);

      if (isCancelled) return;

      if (routeResult && routeResult.roadCoords?.length > 0) {
        setRoadStats(routeResult);
        setRoadWaypoints(routeResult.roadCoords);

        if (routeCasingRef.current) {
          routeCasingRef.current.setLatLngs(routeResult.roadCoords);
        }
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(routeResult.roadCoords);
        }
      } else {
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(allCoords);
        }
      }
      setIsRouting(false);
    };

    const routingTimer = setTimeout(fetchRoadRoute, 250);

    return () => {
      isCancelled = true;
      clearTimeout(routingTimer);
    };
  }, [startPoint, pickupPoints, endPoint]);

  // Center map on specific stop
  const handleFocusStop = (lat, lng) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
    }
  };

  // Fit all points in map bounds
  const handleFitRouteBounds = () => {
    if (!mapInstanceRef.current) return;
    if (roadWaypoints.length > 0) {
      mapInstanceRef.current.fitBounds(roadWaypoints, { padding: [50, 50], animate: true });
    } else {
      const coords = [
        [startPoint.lat, startPoint.lng],
        ...pickupPoints.map((p) => [p.lat, p.lng]),
        [endPoint.lat, endPoint.lng],
      ];
      mapInstanceRef.current.fitBounds(coords, { padding: [50, 50], animate: true });
    }
  };

  // Submit and save full route
  const handleSaveRoute = async (andOpenTracker = false) => {
    if (!selectedVehicleId) {
      showToast('Please select a vehicle to assign this route to.');
      return;
    }

    if (!startPoint.name?.trim()) {
      showToast('Please search or enter a Start location.');
      return;
    }

    if (!endPoint.name?.trim()) {
      showToast('Please search or enter an Ending destination.');
      return;
    }

    setSaving(true);
    try {
      const fullStops = [
        {
          name: startPoint.name.trim(),
          lat: startPoint.lat,
          lng: startPoint.lng,
          type: 'start',
        },
        ...pickupPoints.map((p, idx) => ({
          name: p.name?.trim() || `Pickup Stop #${idx + 1}`,
          lat: p.lat,
          lng: p.lng,
          type: 'stop',
        })),
        {
          name: endPoint.name.trim(),
          lat: endPoint.lat,
          lng: endPoint.lng,
          type: 'end',
        },
      ];

      const route_name = `${startPoint.name.trim()} ➔ ${endPoint.name.trim()}`;

      await adminService.updateVehicleRoute(selectedVehicleId, {
        route_from: startPoint.name.trim(),
        route_to: endPoint.name.trim(),
        route_name,
        route_stops: fullStops,
      });

      showToast('Bus route saved successfully!');

      if (andOpenTracker) {
        navigate(`/school-vehicles?track_id=${selectedVehicleId}&view=gps`);
      } else {
        setTimeout(() => {
          navigate('/school-vehicles');
        }, 800);
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to save route');
    } finally {
      setSaving(false);
    }
  };

  const selectedVehicleObj = vehicles.find((v) => String(v.id) === String(selectedVehicleId));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[3000] px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700 animate-scale-up">
          {toastMsg}
        </div>
      )}

      {/* 1. TOP HEADER & CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/school-vehicles')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Back to School Vehicles Fleet"
          >
            <LuArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight">
                Bus Route Builder
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                {pickupPoints.length + 2} stops
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Search Google Map locations or click the road map to track stop names automatically
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Vehicle Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-auto">
            <LuBus className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Assign To:</span>
            <select
              value={selectedVehicleId}
              onChange={(e) => handleSelectVehicle(e.target.value)}
              disabled={loadingVehicles}
              className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer focus:outline-none w-full"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} — {v.type} ({v.driver_name})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => navigate('/school-vehicles')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveRoute(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center gap-1.5"
          >
            {saving ? <LuLoader className="w-3.5 h-3.5 animate-spin" /> : <LuCheck className="w-3.5 h-3.5" />}
            Save Bus Route
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveRoute(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-orange-500/20 flex items-center justify-center gap-1.5"
          >
            <LuRadio className="w-3.5 h-3.5 text-amber-200" />
            Save & Open GPS Map
          </button>
        </div>
      </div>

      {/* 2. DEDICATED FULL-PAGE ROUTE PLANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-210px)] min-h-[580px]">
        
        {/* LEFT PANEL: TIMELINE INPUTS WITH GOOGLE MAP LOCATION TRACKER (5 COLS) */}
        <div className="lg:col-span-5 p-4 sm:p-5 overflow-y-auto bg-slate-50/50 border-r border-slate-200 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="text-xs text-slate-500 font-semibold px-1 flex items-center justify-between">
              <span>Route Stops Sequence ({pickupPoints.length + 2} total)</span>
              <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                <LuMapPin className="w-3 h-3" />
                Google Location Tracker Active
              </span>
            </div>

            {/* VERTICAL TIMELINE CONTAINER */}
            <div className="relative pl-6 space-y-3 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 before:border-l before:border-dashed before:border-slate-300">
              
              {/* 1. START POINT (ORIGIN) */}
              <div className="relative group">
                <span className="absolute -left-6 top-2.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-xs ring-4 ring-white">
                  🏁
                </span>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <span>Start Point (Origin)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {startPoint.lat.toFixed(3)}, {startPoint.lng.toFixed(3)}
                    </span>
                  </div>

                  <LocationTrackerInput
                    value={startPoint.name}
                    onChange={(val) => setStartPoint((prev) => ({ ...prev, name: val }))}
                    onSelectLocation={(loc) => {
                      setStartPoint({ name: loc.name, lat: loc.lat, lng: loc.lng });
                      handleFocusStop(loc.lat, loc.lng);
                      showToast(`Start location set: ${loc.name}`);
                    }}
                    placeholder="Search start location (e.g. KTHM College, Nashik)"
                    onLocateOnMap={() => handleFocusStop(startPoint.lat, startPoint.lng)}
                    onTrackCurrentGps={() => handleTrackDeviceLocation('start')}
                  />
                </div>
              </div>

              {/* 2. INTERMEDIATE PICKUP POINTS */}
              {pickupPoints.map((p, idx) => (
                <div key={p.id} className="relative group">
                  <span className="absolute -left-6 top-2.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shadow-xs ring-4 ring-white">
                    {idx + 1}
                  </span>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs transition-all space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                        Pickup Stop #{idx + 1}
                      </span>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-mono mr-1">
                          {p.lat.toFixed(3)}, {p.lng.toFixed(3)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMovePickup(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Move up"
                        >
                          <LuArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePickup(idx, 1)}
                          disabled={idx === pickupPoints.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Move down"
                        >
                          <LuArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePickupPoint(p.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                          title="Remove stop"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <LocationTrackerInput
                      value={p.name}
                      onChange={(val) => handleUpdatePickupName(p.id, val)}
                      onSelectLocation={(loc) => {
                        setPickupPoints((prev) =>
                          prev.map((item) =>
                            item.id === p.id
                              ? { ...item, name: loc.name, lat: loc.lat, lng: loc.lng }
                              : item
                          )
                        );
                        handleFocusStop(loc.lat, loc.lng);
                        showToast(`Stop #${idx + 1} set: ${loc.name}`);
                      }}
                      placeholder={`Search pickup stop #${idx + 1} (e.g. Trimbak Road)`}
                      onLocateOnMap={() => handleFocusStop(p.lat, p.lng)}
                      onTrackCurrentGps={() => handleTrackDeviceLocation('pickup', p.id)}
                    />
                  </div>
                </div>
              ))}

              {/* ADD STOP BUTTON */}
              <div className="pt-0.5 pb-0.5">
                <button
                  type="button"
                  onClick={() => handleAddPickupPoint()}
                  className="w-full py-2.5 px-3 border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                >
                  <LuPlus className="w-3.5 h-3.5" />
                  <span>Add Pickup Stop</span>
                </button>
              </div>

              {/* 3. END POINT (DESTINATION) */}
              <div className="relative group">
                <span className="absolute -left-6 top-2.5 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] shadow-xs ring-4 ring-white">
                  🏫
                </span>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 shadow-2xs transition-all space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                      Destination (Campus / Terminus)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {endPoint.lat.toFixed(3)}, {endPoint.lng.toFixed(3)}
                    </span>
                  </div>

                  <LocationTrackerInput
                    value={endPoint.name}
                    onChange={(val) => setEndPoint((prev) => ({ ...prev, name: val }))}
                    onSelectLocation={(loc) => {
                      setEndPoint({ name: loc.name, lat: loc.lat, lng: loc.lng });
                      handleFocusStop(loc.lat, loc.lng);
                      showToast(`Destination set: ${loc.name}`);
                    }}
                    placeholder="Search ending destination (e.g. Main School Campus)"
                    onLocateOnMap={() => handleFocusStop(endPoint.lat, endPoint.lng)}
                    onTrackCurrentGps={() => handleTrackDeviceLocation('end')}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-500 text-center bg-slate-100/60 p-2 rounded-xl border border-slate-200/60">
            🔍 <strong>Google Map Tracker:</strong> Type any landmark name (like <em>KTHM College</em>) or click anywhere on the road to auto-find street names.
          </div>
        </div>

        {/* RIGHT PANEL: ROAD MAP WITH GOOGLE MAP TILES & CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 relative h-full min-h-[400px] bg-slate-100 flex flex-col">
          
          {/* FLOATING PLACEMENT TOOLBAR */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] p-1 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 px-2 hidden sm:inline">Click map to set:</span>
            <button
              type="button"
              onClick={() => setPlacementMode('start')}
              className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                placementMode === 'start'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏁</span> Start
            </button>
            <button
              type="button"
              onClick={() => setPlacementMode('pickup')}
              className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                placementMode === 'pickup'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📍</span> + Pickup
            </button>
            <button
              type="button"
              onClick={() => setPlacementMode('end')}
              className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                placementMode === 'end'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏫</span> End
            </button>
          </div>

          {/* TOP-RIGHT CONTROLS: GOOGLE MAPS STYLE TOGGLE & FIT ROUTE */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
            {/* Map Style Selector */}
            <div className="p-1 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md flex items-center gap-1 text-[11px] font-bold text-slate-700">
              <button
                type="button"
                onClick={() => setMapStyle('google')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  mapStyle === 'google' ? 'bg-blue-600 text-white shadow-2xs' : 'hover:bg-slate-100'
                }`}
              >
                Google Map
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('satellite')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-2xs' : 'hover:bg-slate-100'
                }`}
              >
                Satellite
              </button>
            </div>

            {/* Fit Map Button */}
            <button
              type="button"
              onClick={handleFitRouteBounds}
              title="Fit entire route on map"
              className="p-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md text-slate-600 hover:text-blue-600 transition-colors"
            >
              <LuMaximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* FLOATING ROUTE METRICS BADGE (Road route for bus, mini-bus, van) */}
          <div className="absolute bottom-4 left-4 z-[1000] max-w-[calc(100%-32px)] sm:max-w-md pointer-events-none">
            {isRouting ? (
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-blue-200 shadow-xl flex items-center gap-2.5 text-xs font-bold text-blue-700 animate-pulse pointer-events-auto">
                <LuLoader className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <span>Calculating road route for bus, mini-bus, van...</span>
              </div>
            ) : roadStats ? (
              <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl text-white flex items-center gap-3 pointer-events-auto">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-base shrink-0 shadow-inner">
                  🚌
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-black text-white">
                    <span className="text-blue-400 font-mono tracking-wide">{roadStats.distanceText}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 font-mono">{roadStats.durationText}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wider">
                      Road Route
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-300 font-medium truncate mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
                    <span>Following paved road network suitable for Bus, Mini-bus, Van</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Embedded Leaflet Map */}
          <div ref={mapContainerRef} className="w-full h-full z-0 flex-1" />
        </div>

      </div>
    </div>
  );
}
