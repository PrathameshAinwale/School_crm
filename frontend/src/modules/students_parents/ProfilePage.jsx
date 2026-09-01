import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  LuUser,
  LuPhone,
  LuMail,
  LuMapPin,
  LuBriefcase,
  LuIdCard,
  LuArrowLeft,
  LuCircleCheck,
  LuX,
  LuGraduationCap,
  LuLoader,
  LuUsers,
  LuCalendar,
  LuHeart,
  LuLayers,
  LuPencil,
} from 'react-icons/lu';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form states for editable student, parent & contact details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [fatherName, setFatherName] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudentProfile();
      if (res.success && res.data) {
        const d = res.data;
        setProfileData(d);
        setFirstName(d.student?.first_name || '');
        setLastName(d.student?.last_name || '');
        setDateOfBirth(d.student?.rawDateOfBirth || '');
        setGender(d.student?.gender || 'Male');
        setBloodGroup(d.student?.bloodGroup || 'O+');
        setMedicalNotes(d.student?.medicalNotes || '');
        setFatherName(d.parents?.father?.name || d.parents?.guardianName || '');
        setFatherOccupation(d.parents?.father?.occupation || '');
        setMotherName(d.parents?.mother?.name || '');
        setMotherOccupation(d.parents?.mother?.occupation || '');
        setContactPhone(d.parents?.guardianPhone || '');
        setContactEmail(d.parents?.guardianEmail || '');
        setEmergencyPhone(d.parents?.emergencyContact || '');
        setResidentialAddress(d.address?.residential || '');
      }
    } catch (err) {
      console.error('Failed to load student profile:', err);
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        gender,
        blood_group: bloodGroup,
        father_name: fatherName,
        father_occupation: fatherOccupation,
        mother_name: motherName,
        mother_occupation: motherOccupation,
        guardian_phone: contactPhone,
        guardian_email: contactEmail,
        emergency_contact: emergencyPhone,
        address: residentialAddress,
        medical_notes: medicalNotes,
      };
      const res = await adminService.updateStudentProfile(payload);
      if (res.success) {
        setShowUpdateModal(false);
        showToast('Profile information updated successfully!');
        loadProfile();
      }
    } catch (err) {
      showToast(err.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <LuLoader className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading student profile...</p>
      </div>
    );
  }

  const student = profileData?.student || {};
  const parents = profileData?.parents || {};
  const address = profileData?.address || {};

  const fatherDisplayName = parents.father?.name || parents.guardianName || '—';
  const motherDisplayName = parents.mother?.name || '—';

  const initials = student.fullName
    ? student.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ST';

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-slide-up border border-gray-700">
          <LuCircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-5 rounded-xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 sm:p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
            title="Back to Dashboard"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-800">Student Profile</h1>
            <p className="text-[10px] sm:text-xs text-gray-400">Official Student & Parent Record</p>
          </div>
        </div>

        <button
          onClick={() => setShowUpdateModal(true)}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LuPencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Edit Profile
        </button>
      </div>

      {/* Student Banner Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-blue-600 p-3.5 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-base sm:text-2xl font-extrabold text-white shadow-inner shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-base sm:text-2xl font-bold text-white leading-tight">
                    {student.fullName || 'Student Name'}
                  </h2>
                  {student.rollNo && (
                    <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                      #{student.rollNo}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                    {student.status || 'Active'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-blue-100 mt-0.5 sm:mt-1">
                  {student.classSection || `${student.className || 'Class 10'} • ${student.sectionName || 'Section A'}`}
                </p>

                {student.admissionNo && (
                  <p className="text-[11px] sm:text-xs text-blue-200 font-mono mt-0.5">
                    Admission: <strong>{student.admissionNo}</strong>
                  </p>
                )}
              </div>
            </div>

            {student.admissionDate && (
              <div className="text-left sm:text-right bg-white/10 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto">
                <span className="text-[10px] sm:text-[11px] text-blue-200 block">Admission Date</span>
                <span className="text-xs sm:text-sm font-bold text-white">{student.admissionDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Student Demographics & Academic Placement */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-6 border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 pb-2.5 sm:pb-3 border-b border-gray-100">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LuIdCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-800">Student Identity & Demographics</h3>
            <p className="text-[10px] sm:text-xs text-gray-400">Personal & Academic Placement</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-gray-50/80 rounded-lg sm:rounded-xl border border-gray-100">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase block">First Name</span>
            <p className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5">{student.first_name || '—'}</p>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Last Name</span>
            <p className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5">{student.last_name || '—'}</p>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Academic Class</span>
            <p className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
              <LuGraduationCap className="w-3.5 h-3.5 text-primary-600" />
              {student.className || '—'}
            </p>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Section / Division</span>
            <p className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
              <LuLayers className="w-3.5 h-3.5 text-primary-600" />
              {student.sectionName || '—'}
            </p>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Class Roll Number</span>
            <p className="font-bold text-gray-800 font-mono text-xs sm:text-sm mt-0.5">{student.rollNo || '—'}</p>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Date of Birth (DOB)</span>
            <p className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
              <LuCalendar className="w-3.5 h-3.5 text-primary-600" />
              {student.dateOfBirth || '—'}
            </p>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Gender</span>
            <p className="font-bold text-gray-800 text-xs sm:text-sm mt-0.5">{student.gender || '—'}</p>
          </div>

          <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Blood Group</span>
            <p className="font-bold text-rose-600 text-xs sm:text-sm mt-0.5 flex items-center gap-1">
              <LuHeart className="w-3.5 h-3.5 text-rose-500" />
              {student.bloodGroup || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Parents / Guardians Details */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <LuUsers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-800">Parents & Guardian Details</h2>
            <p className="text-xs text-gray-400">Parental Information & Primary Communication Contacts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
          {/* Father's Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <LuUser className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Father</span>
                <h3 className="text-base font-bold text-gray-800">{fatherDisplayName}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                <LuBriefcase className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block">Occupation</span>
                  <p className="font-semibold text-gray-800">{parents.father?.occupation || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mother's Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <LuUser className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Mother</span>
                <h3 className="text-base font-bold text-gray-800">{motherDisplayName}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2.5">
                <LuBriefcase className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block">Occupation</span>
                  <p className="font-semibold text-gray-800">{parents.mother?.occupation || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Contact & Emergency Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <LuPhone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Primary Contact Phone (Login ID)</span>
              <a
                href={parents.guardianPhone ? `tel:${parents.guardianPhone}` : undefined}
                className="font-bold text-gray-800 text-sm hover:text-primary-600 transition-colors truncate block"
              >
                {parents.guardianPhone || '—'}
              </a>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <LuMail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Parent Email Address</span>
              <a
                href={parents.guardianEmail ? `mailto:${parents.guardianEmail}` : undefined}
                className="font-bold text-gray-800 text-sm hover:text-primary-600 transition-colors truncate block"
              >
                {parents.guardianEmail || '—'}
              </a>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <LuPhone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Emergency Contact</span>
              <p className="font-bold text-gray-800 text-sm truncate">{parents.emergencyContact || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Residential Address */}
      <div className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <LuMapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Residential Address</h3>
            <p className="text-xs text-gray-400">Registered Student Home Address</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
          {address.residential || '—'}
        </p>
      </div>

      {/* Edit Details Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl border border-gray-200 animate-scale-up my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-800">Edit Student & Parent Profile</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                    Direct Self-Edit Enabled
                  </span>
                </div>
                <p className="text-xs text-gray-400">Update personal, parental, and contact records directly without administrative delays</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              {/* Student Identity */}
              <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <LuUser className="w-4 h-4 text-primary-600" />
                  <h4 className="font-bold text-gray-800 text-xs">Student Identity & Demographics</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Aarav"
                      className="w-full p-2.5 bg-white rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Patel"
                      className="w-full p-2.5 bg-white rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-500 font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full p-2.5 bg-white rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-primary-500 font-medium"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parents / Guardians Details */}
              <div className="space-y-3">
                {/* Father Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div>
                    <label className="block font-semibold text-blue-950 mb-1">Father's Full Name</label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Rajesh Patel"
                      className="w-full p-2.5 bg-white rounded-lg border border-blue-200 text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-blue-950 mb-1">Father's Occupation</label>
                    <input
                      type="text"
                      value={fatherOccupation}
                      onChange={(e) => setFatherOccupation(e.target.value)}
                      placeholder="e.g. Civil Engineer"
                      className="w-full p-2.5 bg-white rounded-lg border border-blue-200 text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Mother Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-purple-50/60 rounded-xl border border-purple-100">
                  <div>
                    <label className="block font-semibold text-purple-950 mb-1">Mother's Full Name</label>
                    <input
                      type="text"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="e.g. Meena Patel"
                      className="w-full p-2.5 bg-white rounded-lg border border-purple-200 text-gray-800 focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-950 mb-1">Mother's Occupation</label>
                    <input
                      type="text"
                      value={motherOccupation}
                      onChange={(e) => setMotherOccupation(e.target.value)}
                      placeholder="e.g. Professor / Homemaker"
                      className="w-full p-2.5 bg-white rounded-lg border border-purple-200 text-gray-800 focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information & Residence */}
              <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-200/60">
                  <LuPhone className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-emerald-950 text-xs">Contact Information & Residence</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Primary Mobile Phone (Login ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Parent Email Address</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Emergency Contact Number</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Medical / Health Notes</label>
                    <input
                      type="text"
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="e.g. Allergic to penicillin, wears glasses"
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Residential Street Address</label>
                  <textarea
                    rows={2}
                    value={residentialAddress}
                    onChange={(e) => setResidentialAddress(e.target.value)}
                    placeholder="Enter full residential address..."
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <LuLoader className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : 'Save Changes Directly'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
