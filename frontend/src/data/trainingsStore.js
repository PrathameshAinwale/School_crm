// Centralized Trainings Store with LocalStorage Persistence
export const TEACHERS_LIST = [
  { id: 'TCH-101', name: 'Dr. Ananya Sen', role: 'Senior PGT Mathematics & HOD', dept: 'Mathematics', email: 'ananya.sen@eduflow.edu' },
  { id: 'TCH-102', name: 'Mr. Vikram Rathore', role: 'PGT Physics & Robotics Mentor', dept: 'Science', email: 'vikram.r@eduflow.edu' },
  { id: 'TCH-103', name: 'Ms. Sunita Rao', role: 'TGT English Literature', dept: 'Languages', email: 'sunita.rao@eduflow.edu' },
  { id: 'TCH-104', name: 'Mr. Rajesh Mehra', role: 'PGT Chemistry & Lab Coordinator', dept: 'Science', email: 'rajesh.mehra@eduflow.edu' },
  { id: 'TCH-105', name: 'Mrs. Deepa Krishnan', role: 'Head of Computer Science & AI', dept: 'IT & CS', email: 'deepa.k@eduflow.edu' },
  { id: 'TCH-106', name: 'Mr. Alok Verma', role: 'TGT Social Studies', dept: 'Humanities', email: 'alok.v@eduflow.edu' },
  { id: 'TCH-107', name: 'Mrs. Kavita Saxena', role: 'PRT Primary Wing Coordinator', dept: 'Primary Wing', email: 'kavita.s@eduflow.edu' },
  { id: 'TCH-108', name: 'Mr. Sanjay Gupta', role: 'PGT Physical Education & Sports', dept: 'Sports & PE', email: 'sanjay.g@eduflow.edu' },
];

export const TEACHER_GROUPS = [
  { id: 'GRP_ALL', name: 'All Teaching Faculty (All Wings)', teacherIds: ['TCH-101', 'TCH-102', 'TCH-103', 'TCH-104', 'TCH-105', 'TCH-106', 'TCH-107', 'TCH-108'] },
  { id: 'GRP_PGT', name: 'Senior Secondary PGT Faculty & HODs', teacherIds: ['TCH-101', 'TCH-102', 'TCH-104', 'TCH-105', 'TCH-108'] },
  { id: 'GRP_STEM', name: 'Science, Math & Computer Science (STEM)', teacherIds: ['TCH-101', 'TCH-102', 'TCH-104', 'TCH-105'] },
  { id: 'GRP_TGT_PRT', name: 'Middle & Primary Wing Educators (TGT/PRT)', teacherIds: ['TCH-103', 'TCH-106', 'TCH-107'] },
];

const INITIAL_TRAININGS = [
  {
    id: 'TRN-2026-101',
    title: 'CBSE NEP-2020 Competency-Based Pedagogy & Assessment',
    category: 'Pedagogy & Curriculum',
    trainer: 'Prof. K. R. Raman (CBSE Master Trainer)',
    trainerOrg: 'CBSE Academic Training Wing',
    date: '22 Aug 2026',
    time: '02:00 PM - 05:00 PM',
    venue: 'Main Academic Auditorium & Live Stream',
    mode: 'Hybrid (On-Campus / Zoom)',
    targetType: 'group',
    targetGroupName: 'Senior Secondary PGT Faculty & HODs',
    description: 'Practical framework on structuring 50% competency-based questions, case-based analysis, and experiential learning rubrics.',
    status: 'In Progress',
    attendees: [
      { teacherId: 'TCH-101', teacherName: 'Dr. Ananya Sen', role: 'Senior PGT Mathematics & HOD', dept: 'Mathematics', status: 'Attended', markedAt: '22 Aug 2026, 02:15 PM', feedback: 'Extremely insightful rubrics for calculus assessment.' },
      { teacherId: 'TCH-102', teacherName: 'Mr. Vikram Rathore', role: 'PGT Physics & Robotics Mentor', dept: 'Science', status: 'Attended', markedAt: '22 Aug 2026, 02:10 PM', feedback: 'Ready to incorporate in physics practicals.' },
      { teacherId: 'TCH-104', teacherName: 'Mr. Rajesh Mehra', role: 'PGT Chemistry & Lab Coordinator', dept: 'Science', status: 'Assigned & Notified', markedAt: null, feedback: '' },
      { teacherId: 'TCH-105', teacherName: 'Mrs. Deepa Krishnan', role: 'Head of Computer Science & AI', dept: 'IT & CS', status: 'Assigned & Notified', markedAt: null, feedback: '' },
      { teacherId: 'TCH-108', teacherName: 'Mr. Sanjay Gupta', role: 'PGT Physical Education & Sports', dept: 'Sports & PE', status: 'Assigned & Notified', markedAt: null, feedback: '' },
    ],
  },
  {
    id: 'TRN-2026-102',
    title: 'Advanced AI & Python Tinkering Lab Masterclass',
    category: 'Technology & STEM',
    trainer: 'Er. Sandeep Mittal (Senior AI Specialist)',
    trainerOrg: 'Intel STEM Education Foundation',
    date: '25 Aug 2026',
    time: '10:00 AM - 01:00 PM',
    venue: 'Computer Science Lab 1 (Block B)',
    mode: 'In-Person Hands-on',
    targetType: 'specific',
    targetGroupName: 'Selected STEM Mentors',
    description: 'Hands-on training on microcontrollers, robotics sensors, and introductory machine learning projects for Class IX-XII students.',
    status: 'Scheduled',
    attendees: [
      { teacherId: 'TCH-102', teacherName: 'Mr. Vikram Rathore', role: 'PGT Physics & Robotics Mentor', dept: 'Science', status: 'Assigned & Notified', markedAt: null, feedback: '' },
      { teacherId: 'TCH-105', teacherName: 'Mrs. Deepa Krishnan', role: 'Head of Computer Science & AI', dept: 'IT & CS', status: 'Assigned & Notified', markedAt: null, feedback: '' },
    ],
  },
  {
    id: 'TRN-2026-103',
    title: 'Student Mental Health First-Aid & Classroom Counseling',
    category: 'Student Wellness',
    trainer: 'Dr. Reena Singhania (Child & Adolescent Psychologist)',
    trainerOrg: 'NIMHANS Child Wellness Cell',
    date: '29 Aug 2026',
    time: '09:30 AM - 12:30 PM',
    venue: 'Conference Hall B',
    mode: 'In-Person Interactive',
    targetType: 'group',
    targetGroupName: 'Middle & Primary Wing Educators (TGT/PRT)',
    description: 'Identifying early signs of anxiety, peer pressure, exam stress, and trauma counseling protocols for teachers.',
    status: 'Scheduled',
    attendees: [
      { teacherId: 'TCH-103', teacherName: 'Ms. Sunita Rao', role: 'TGT English Literature', dept: 'Languages', status: 'Assigned & Notified', markedAt: null, feedback: '' },
      { teacherId: 'TCH-106', teacherName: 'Mr. Alok Verma', role: 'TGT Social Studies', dept: 'Humanities', status: 'Assigned & Notified', markedAt: null, feedback: '' },
      { teacherId: 'TCH-107', teacherName: 'Mrs. Kavita Saxena', role: 'PRT Primary Wing Coordinator', dept: 'Primary Wing', status: 'Assigned & Notified', markedAt: null, feedback: '' },
    ],
  },
  {
    id: 'TRN-2026-104',
    title: '4K Interactive Smart Display & Hybrid Classroom Pedagogy',
    category: 'Technology & STEM',
    trainer: 'Mr. Abhishek Rao (Lead Certified Educator)',
    trainerOrg: 'LG Commercial Solutions',
    date: '14 Aug 2026',
    time: '03:00 PM - 05:00 PM',
    venue: 'Smart Classroom Block 2',
    mode: 'In-Person Completed',
    targetType: 'group',
    targetGroupName: 'All Teaching Faculty (All Wings)',
    description: 'Training on interactive stylus, 3D math geometry tools, and dynamic screen recording for blended teaching.',
    status: 'Completed',
    attendees: TEACHERS_LIST.map((t, idx) => ({
      teacherId: t.id,
      teacherName: t.name,
      role: t.role,
      dept: t.dept,
      status: idx === 3 ? 'Excused / On Leave' : 'Attended',
      markedAt: idx === 3 ? null : '14 Aug 2026, 03:05 PM',
      feedback: idx === 3 ? '' : 'Useful tool for digital whiteboard diagrams.',
    })),
  },
];

const STORAGE_KEY = 'eduflow_school_trainings_v1';

export function getStoredTrainings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading stored trainings', e);
  }
  return INITIAL_TRAININGS;
}

export function saveStoredTrainings(trainings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trainings));
  } catch (e) {
    console.error('Error saving stored trainings', e);
  }
}

export function addTrainingProgram(newProgram) {
  const current = getStoredTrainings();
  const updated = [newProgram, ...current];
  saveStoredTrainings(updated);
  return updated;
}

export function deleteTrainingProgram(trainingId) {
  const current = getStoredTrainings();
  const updated = current.filter(
    (t) => t.id !== trainingId && t.training_id !== trainingId && t.db_id !== trainingId
  );
  saveStoredTrainings(updated);
  return updated;
}

export function markTeacherAttendance(trainingId, teacherId, feedback = '') {
  const current = getStoredTrainings();
  const updated = current.map((t) => {
    if (t.id === trainingId) {
      const attendees = t.attendees.map((att) => {
        if (att.teacherId === teacherId) {
          return {
            ...att,
            status: 'Attended',
            markedAt: new Date().toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            feedback: feedback || 'Attended successfully.',
          };
        }
        return att;
      });
      return { ...t, attendees };
    }
    return t;
  });

  saveStoredTrainings(updated);
  return updated;
}
