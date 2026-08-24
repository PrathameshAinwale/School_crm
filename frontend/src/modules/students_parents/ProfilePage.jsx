import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  LuUser,
  LuPhone,
  LuMail,
  LuMapPin,
  LuBriefcase,
  LuHeart,
  LuShield,
  LuAward,
  LuIdCard,
  LuContact,
  LuBus,
  LuArrowLeft,
  LuDownload,
  LuPrinter,
  LuCircleCheck,
  LuCheck,
  LuX,
  LuClock,
  LuGraduationCap,
  LuLoader,
} from 'react-icons/lu';

const DEFAULT_PROFILE = {
  student: {
    fullName: 'Aarav Patel',
    admissionNo: 'STU-2024-X-101',
    rollNo: '101',
    classSection: 'Class 10 - Saffron A',
    academicYear: '2026-27',
    dateOfBirth: 'October 14, 2010',
    gender: 'Male',
    bloodGroup: 'O+ Positive',
    house: 'Tagore House (Red)',
    admissionDate: 'April 04, 2020',
    attendanceRate: '96.2%',
    overallGrade: 'A+ (92.4%)',
    status: 'Active',
  },
  parents: {
    father: {
      name: 'Rajesh Patel',
      relation: 'Father',
      phone: '+91 87672 27125',
      email: 'rajesh@school.com',
      occupation: 'Senior Professional',
      organization: 'Enterprise Solutions',
    },
    mother: {
      name: 'Meena Patel',
      relation: 'Mother',
      phone: '+91 98201 11022',
      email: 'meena.patel@email.com',
      occupation: 'Financial Consultant',
    },
    emergencyContact: {
      primaryPerson: 'Rajesh Patel (Father)',
      primaryPhone: '+91 87672 27125',
    },
  },
  address: {
    residential: 'Flat 402, Royal Palms Residency, MG Road, Sector 14, Pune, Maharashtra - 411038',
    permanent: 'Flat 402, Royal Palms Residency, MG Road, Sector 14, Pune, Maharashtra - 411038',
    busRouteNo: 'Route #4 (Kothrud -> Campus)',
    busStop: 'Main Gate Stop (7:30 AM Pickup • 2:00 PM Drop)',
  },
  health: {
    allergies: 'No severe allergies reported',
    medicalConditions: 'Fit for sports and physical training',
    emergencyInfirmaryNotes: 'Medical verification completed by school infirmary on file.',
  },
};

export default function ProfilePage() {
  const { user, currentRole } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Editable update request fields
  const [fatherPhone, setFatherPhone] = useState('');
  const [fatherEmail, setFatherEmail] = useState('');
  const [resAddress, setResAddress] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudentProfile();
      if (res.success && res.data) {
        const d = res.data;
        const merged = {
          student: { ...DEFAULT_PROFILE.student, ...(d.student || {}) },
          parents: {
            father: { ...DEFAULT_PROFILE.parents.father, ...(d.parents?.father || {}) },
            mother: { ...DEFAULT_PROFILE.parents.mother, ...(d.parents?.mother || {}) },
            emergencyContact: { ...DEFAULT_PROFILE.parents.emergencyContact, ...(d.parents?.emergencyContact || {}) },
          },
          address: { ...DEFAULT_PROFILE.address, ...(d.address || {}) },
          health: { ...DEFAULT_PROFILE.health, ...(d.health || {}) },
        };
        setProfileData(merged);
        setFatherPhone(merged.parents.father.phone || '');
        setFatherEmail(merged.parents.father.email || '');
        setResAddress(merged.address.residential || '');
        setEmergencyPhone(merged.parents.emergencyContact.primaryPhone || '');
        setMedicalNotes(merged.health.allergies || '');
      }
    } catch (err) {
      console.error('Failed to load student profile from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        guardian_phone: fatherPhone,
        guardian_email: fatherEmail,
        address: resAddress,
        emergency_contact: emergencyPhone,
        medical_notes: medicalNotes,
      };
      const res = await adminService.updateStudentProfile(payload);
      if (res.success) {
        setShowUpdateModal(false);
        showToast('Student & Parent records updated successfully in database!');
        loadProfile();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update records.');
    } finally {
      setSaving(false);
    }
  };

  const { student, parents, address, health } = profileData;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Student & Parent Official Profile</h1>
            <p className="text-xs text-gray-400">
              Verified School Admission Records • Academic Year 2026-27
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowUpdateModal(true)}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <LuContact className="w-3.5 h-3.5" /> Request Contact Update
          </button>
          <button className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium inline-flex items-center gap-1">
            <LuPrinter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Student Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-blue-600 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-2xl font-extrabold text-white shadow-inner shrink-0">
                {student.fullName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-white leading-tight">{student.fullName}</h2>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                    Roll #{student.rollNo}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                    Active Enrolled
                  </span>
                </div>
                <p className="text-sm text-blue-100 mt-1">
                  {student.classSection} &bull; Homeroom: Room 301 &bull; Teacher: {student.classTeacher}
                </p>
                <p className="text-xs text-blue-200 font-mono mt-0.5">
                  Admission No: {student.admissionNo} &bull; CBSE Reg: {student.cbseRollNo}
                </p>
              </div>
            </div>

            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-white/20 text-xs">
              <span className="text-blue-100 font-medium">Overall Attendance</span>
              <span className="text-xl font-extrabold text-white">{student.attendanceRate}</span>
              <span className="text-[11px] text-emerald-200 font-semibold mt-0.5">Good Standing (Grade {student.overallGrade})</span>
            </div>
          </div>
        </div>

        {/* Student Key Particulars Grid */}
        <div className="p-6 bg-gray-50/50 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <LuIdCard className="w-4 h-4 text-primary-600" /> Student Identity & Demographics
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Date of Birth</span>
              <p className="font-bold text-gray-800 mt-0.5">{student.dateOfBirth}</p>
              <p className="text-[10px] text-gray-500">{student.age}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Gender</span>
              <p className="font-bold text-gray-800 mt-0.5">{student.gender}</p>
              <p className="text-[10px] text-gray-500">Student</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Blood Group</span>
              <p className="font-bold text-rose-600 mt-0.5">{student.bloodGroup}</p>
              <p className="text-[10px] text-gray-500">Verified</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase">School House</span>
              <p className="font-bold text-red-600 mt-0.5">{student.house}</p>
              <p className="text-[10px] text-gray-500">Senior Wing</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase">RFID Card ID</span>
              <p className="font-bold text-gray-800 mt-0.5 font-mono text-[11px]">{student.rfidCardId}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Active Gate Access</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Admission Date</span>
              <p className="font-bold text-gray-800 mt-0.5">{student.admissionDate}</p>
              <p className="text-[10px] text-gray-500">10 Years with School</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parents & Guardians Details Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <LuContact className="w-5 h-5 text-primary-600" /> Parent & Guardian Information & Contact Details
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            2 Verified Guardians
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-5">
          {/* Father's Card */}
          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary-700 font-bold text-base flex items-center justify-center shrink-0">
                    <LuUser className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">{parents.father.relation}</span>
                    <h3 className="text-lg font-bold text-gray-800">{parents.father.name}</h3>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Primary Contact
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <LuPhone className="w-4 h-4 text-primary-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-semibold block">Mobile Contact Number</span>
                    <a href={`tel:${parents.father.phone}`} className="font-bold text-gray-800 text-sm hover:text-primary-600 transition-colors">
                      {parents.father.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <LuMail className="w-4 h-4 text-primary-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-semibold block">Official Email Address</span>
                    <a href={`mailto:${parents.father.email}`} className="font-semibold text-gray-800 hover:text-primary-600 transition-colors">
                      {parents.father.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <LuBriefcase className="w-4 h-4 text-primary-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-semibold block">Profession & Workplace</span>
                    <p className="font-medium text-gray-800">{parents.father.occupation}</p>
                    <p className="text-[11px] text-gray-500">{parents.father.organization}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-semibold block">Education & Aadhaar</span>
                  <p className="font-medium text-gray-700">{parents.father.qualification}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">Aadhaar: {parents.father.aadhaarNo}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
              <span className="flex items-center gap-1">
                <LuCircleCheck className="w-3.5 h-3.5" /> SMS & WhatsApp Alerts Enabled
              </span>
            </div>
          </div>

          {/* Mother's Card */}
          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 font-bold text-base flex items-center justify-center shrink-0">
                    <LuUser className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">{parents.mother.relation}</span>
                    <h3 className="text-lg font-bold text-gray-800">{parents.mother.name}</h3>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Registered Guardian
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <LuPhone className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-semibold block">Mobile Contact Number</span>
                    <a href={`tel:${parents.mother.phone}`} className="font-bold text-gray-800 text-sm hover:text-purple-600 transition-colors">
                      {parents.mother.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <LuMail className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-semibold block">Official Email Address</span>
                    <a href={`mailto:${parents.mother.email}`} className="font-semibold text-gray-800 hover:text-purple-600 transition-colors">
                      {parents.mother.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <LuBriefcase className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400 font-semibold block">Profession & Workplace</span>
                    <p className="font-medium text-gray-800">{parents.mother.occupation}</p>
                    <p className="text-[11px] text-gray-500">{parents.mother.organization}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-semibold block">Education & Aadhaar</span>
                  <p className="font-medium text-gray-700">{parents.mother.qualification}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">Aadhaar: {parents.mother.aadhaarNo}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
              <span className="flex items-center gap-1">
                <LuCircleCheck className="w-3.5 h-3.5" /> School Portal Access Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact & Residence / Transport Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Emergency Contacts Card */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <LuShield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Emergency Contact Priority</h3>
                <p className="text-xs text-gray-400">School Infirmary & Security Protocol</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-700 uppercase">1st Priority (Immediate)</span>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{parents.emergencyContact.primaryPerson}</p>
                  <p className="text-xs text-rose-800 font-semibold">{parents.emergencyContact.primaryPhone}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-100 text-rose-900">
                  Primary Guardian
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">2nd Priority (Alternative)</span>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{parents.emergencyContact.secondaryPerson}</p>
                  <p className="text-xs text-gray-700 font-semibold">{parents.emergencyContact.secondaryPhone}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-200 text-gray-800">
                  Emergency Only
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-primary-900 flex items-center gap-2">
            <LuHeart className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Health Note: {health.allergies}</span>
          </div>
        </div>

        {/* Residential Address & School Transport Card */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <LuMapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Residential Address & School Transit</h3>
                <p className="text-xs text-gray-400">Communication & GPS Bus Route Details</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Registered Residential Address</span>
                <p className="font-medium text-gray-800 mt-1 leading-relaxed">{address.residential}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <LuBus className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900">{address.busRouteNo}</span>
                </div>
                <p className="text-gray-700">{address.busStop}</p>
                <p className="text-[11px] text-gray-500 mt-1 font-mono">{address.vehicleReg}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Verified with Municipal Proof of Residence</span>
            <span className="text-emerald-600 font-semibold">Active GPS Tracking</span>
          </div>
        </div>
      </div>

      {/* Contact Info Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-800">Request Contact & Profile Update</h3>
                <p className="text-xs text-gray-400">{student.classSection} • {student.fullName} ({student.admissionNo})</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {updateSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <LuCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-800">Update Request Submitted!</h4>
                <p className="text-xs text-gray-500">School administration has received your changes. You will receive an SMS confirmation after verification.</p>
              </div>
            ) : (
              <form onSubmit={handleUpdateRequest} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Father's Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Father's Email Address</label>
                    <input
                      type="email"
                      required
                      value={fatherEmail}
                      onChange={(e) => setFatherEmail(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-400 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Mother's Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={motherPhone}
                      onChange={(e) => setMotherPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Mother's Email Address</label>
                    <input
                      type="email"
                      required
                      value={motherEmail}
                      onChange={(e) => setMotherEmail(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Residential Address</label>
                  <textarea
                    rows={2}
                    required
                    value={resAddress}
                    onChange={(e) => setResAddress(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Reason for Update / Notes (Optional)</label>
                  <input
                    type="text"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder="e.g. Changed primary SIM card provider..."
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-sm transition-colors"
                  >
                    Submit Update Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
