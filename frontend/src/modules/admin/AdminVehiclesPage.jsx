import React, { useState } from 'react';
import {
  LuBus,
  LuUsers,
  LuMapPin,
  LuPhone,
  LuSearch,
  LuEye,
  LuX,
  LuCircleCheck,
} from 'react-icons/lu';

const VEHICLES_DATA = [
  {
    busNo: 'DL-01-EA-4412 (Bus #04)',
    type: 'Tata Starbus 52-Seater AC',
    capacity: 52,
    students: 48,
    status: 'On Route • Live GPS',
    driver: 'Mr. Ram Charan',
    driverContact: '+91 98112 77001',
    driverLicense: 'DL-COM-2015-8812',
    staffInside: {
      inchargeTeacher: 'Mrs. Sangeeta Bisht (PRT)',
      inchargeContact: '+91 98112 40150',
      caregiver: 'Mrs. Lakshmi Devi (Female Attendant)',
      securityHelper: 'Mr. Dharmendra Singh (Escort)',
    },
    route: 'Rohini Sector 14 ⇄ Sector 9 ⇄ Campus North Gate',
    stops: [
      { name: 'Rohini Sector 14 (Origin)', time: '06:45 AM', students: 14 },
      { name: 'Sector 9 Metro Station', time: '07:05 AM', students: 18 },
      { name: 'Pitampura Power House', time: '07:20 AM', students: 16 },
      { name: 'Campus Gate 1 (Arrival)', time: '07:40 AM', students: 0 },
    ],
    fuel: '78%',
    speed: '38 km/h',
    emergencySOS: 'Active / Tested Today',
  },
  {
    busNo: 'DL-01-EA-4415 (Bus #09)',
    type: 'Ashok Leyland 44-Seater AC',
    capacity: 44,
    students: 42,
    status: 'On Route • Live GPS',
    driver: 'Mr. Gurpreet Singh',
    driverContact: '+91 98112 77002',
    driverLicense: 'DL-COM-2014-4410',
    staffInside: {
      inchargeTeacher: 'Mr. Arvind Saxena (TGT)',
      inchargeContact: '+91 98112 40151',
      caregiver: 'Mrs. Kamla Bai (Female Attendant)',
      securityHelper: 'Mr. Sohan Lal (Escort)',
    },
    route: 'Pitampura ⇄ Rani Bagh ⇄ Campus Main Gate',
    stops: [
      { name: 'Pitampura Club (Origin)', time: '06:50 AM', students: 15 },
      { name: 'Rani Bagh Market', time: '07:10 AM', students: 14 },
      { name: 'Shalimar Bagh Crossing', time: '07:25 AM', students: 13 },
      { name: 'Campus Gate 1 (Arrival)', time: '07:45 AM', students: 0 },
    ],
    fuel: '84%',
    speed: '42 km/h',
    emergencySOS: 'Active / Tested Today',
  },
  {
    busNo: 'DL-01-EA-4418 (Bus #15)',
    type: 'Tata Starbus 52-Seater AC',
    capacity: 52,
    students: 50,
    status: 'On Route • Live GPS',
    driver: 'Mr. Mohan Lal',
    driverContact: '+91 98112 77003',
    driverLicense: 'DL-COM-2018-9921',
    staffInside: {
      inchargeTeacher: 'Ms. Pooja Sharma (PRT)',
      inchargeContact: '+91 98112 40152',
      caregiver: 'Mrs. Meena Kumari (Female Attendant)',
      securityHelper: 'Mr. Ravi Yadav (Escort)',
    },
    route: 'Dwarka Sector 10 ⇄ Janakpuri ⇄ Campus West Gate',
    stops: [
      { name: 'Dwarka Sec 10 (Origin)', time: '06:30 AM', students: 20 },
      { name: 'Janakpuri District Center', time: '07:00 AM', students: 18 },
      { name: 'Tilak Nagar Flyover', time: '07:20 AM', students: 12 },
      { name: 'Campus Gate 2 (Arrival)', time: '07:45 AM', students: 0 },
    ],
    fuel: '65%',
    speed: '45 km/h',
    emergencySOS: 'Active / Tested Today',
  },
  {
    busNo: 'DL-01-EA-4420 (Van #02)',
    type: 'Force Traveller 20-Seater',
    capacity: 20,
    students: 18,
    status: 'Campus Parked • Ready',
    driver: 'Mr. Satish Kumar',
    driverContact: '+91 98112 77004',
    driverLicense: 'DL-COM-2019-3318',
    staffInside: {
      inchargeTeacher: 'Mrs. Sunita Devi (Pre-Primary PRT)',
      inchargeContact: '+91 98112 40153',
      caregiver: 'Mrs. Rekha Rani (Caregiver)',
      securityHelper: 'N/A (Van Route)',
    },
    route: 'Civil Lines ⇄ Model Town ⇄ Pre-Primary Wing',
    stops: [
      { name: 'Civil Lines (Origin)', time: '07:00 AM', students: 8 },
      { name: 'Model Town 2', time: '07:15 AM', students: 10 },
      { name: 'Campus North (Arrival)', time: '07:35 AM', students: 0 },
    ],
    fuel: '92%',
    speed: '0 km/h',
    emergencySOS: 'Active / Tested Today',
  },
];

export default function AdminVehiclesPage() {
  const [vehicles] = useState(VEHICLES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const filtered = vehicles.filter(
    (v) =>
      v.busNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.staffInside.inchargeTeacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Clean Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <LuBus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">School Vehicles & Transport Tracking</h1>
            <p className="text-xs text-gray-400">Fleet numbers, drivers, onboard staff escorts, and commute route stops</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
          <LuCircleCheck className="w-4 h-4" /> 22 Active Transit Routes
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Fleet</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">24 Vehicles</p>
          <p className="text-xs text-gray-400 mt-0.5">20 Buses • 4 Vans</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Live On Route</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">22 Active</p>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">GPS Tracking</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Students in Transit</span>
          <p className="text-2xl font-bold text-primary-600 mt-1">1,420</p>
          <p className="text-xs text-gray-400 mt-0.5">Morning Commute</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Staff</span>
          <p className="text-2xl font-bold text-gray-800 mt-1">48 Escorts</p>
          <p className="text-xs text-gray-400 mt-0.5">Teachers & Caregivers</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by bus number, driver, route or in-charge teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((veh) => (
          <div
            key={veh.busNo}
            onClick={() => setSelectedVehicle(veh)}
            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm group-hover:text-primary-600 transition-colors">
                    {veh.busNo}
                  </h3>
                  <p className="text-xs text-gray-400">{veh.type}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    veh.status.includes('Live')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {veh.status}
                </span>
              </div>

              {/* Route */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs mb-3 space-y-1.5">
                <div className="flex items-start gap-1.5 text-gray-800 font-medium">
                  <LuMapPin className="w-3.5 h-3.5 text-primary-600 shrink-0 mt-0.5" />
                  <span>{veh.route}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 text-[11px] pt-1 border-t border-gray-200">
                  <span>Driver: <strong className="text-gray-800">{veh.driver}</strong> ({veh.driverContact})</span>
                  <span>Students: <strong className="text-primary-700">{veh.students}/{veh.capacity}</strong></span>
                </div>
              </div>

              {/* Staff Inside */}
              <div className="bg-primary-50/50 p-2.5 rounded-lg border border-primary-100 text-xs text-primary-950 space-y-0.5">
                <p className="font-semibold text-primary-900 text-[11px] uppercase tracking-wider">Staff Onboard:</p>
                <p className="text-gray-700">In-Charge: <strong>{veh.staffInside.inchargeTeacher}</strong></p>
                <p className="text-gray-500 text-[11px]">Attendant: {veh.staffInside.caregiver}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Speed: <strong>{veh.speed}</strong> • Fuel: <strong>{veh.fuel}</strong></span>
              <span className="text-primary-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Inspect Route Stops →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* VEHICLE DETAILS MODAL */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col animate-slide-up border border-gray-200">
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">{selectedVehicle.busNo}</h3>
                <p className="text-xs text-gray-400">{selectedVehicle.type} • {selectedVehicle.status}</p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              {/* Personnel Details */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">Assigned Personnel</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="text-gray-400">Driver:</span>
                    <p className="font-semibold text-gray-900">{selectedVehicle.driver}</p>
                    <p className="text-gray-500 text-[11px]">{selectedVehicle.driverContact}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Teacher In-Charge:</span>
                    <p className="font-semibold text-gray-900">{selectedVehicle.staffInside.inchargeTeacher}</p>
                    <p className="text-gray-500 text-[11px]">{selectedVehicle.staffInside.inchargeContact}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Female Caregiver:</span>
                    <p className="font-semibold text-gray-900">{selectedVehicle.staffInside.caregiver}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Security Escort:</span>
                    <p className="font-semibold text-gray-900">{selectedVehicle.staffInside.securityHelper}</p>
                  </div>
                </div>
              </div>

              {/* Stops Timeline */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">Route Stops & Timing</h4>
                <div className="space-y-2">
                  {selectedVehicle.stops.map((stop, i) => (
                    <div key={stop.name} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-bold text-[11px] flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-gray-800">{stop.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-gray-700 font-semibold">{stop.time}</span>
                        {stop.students > 0 && (
                          <p className="text-[10px] text-primary-700">{stop.students} students</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
