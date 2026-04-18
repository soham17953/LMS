import React, { useMemo, useState } from 'react';
import { ClipboardList, Users, CheckCircle, XCircle, ArrowRight, Save, Loader2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_RECORDS = [
  {
    id: 1,
    date: '2026-03-20',
    medium: 'English',
    class: '9',
    present: 2,
    absent: 1,
    createdBy: 'teacher',
    students: [
      { id: 'S1', name: 'Alok Kumar', status: 'Present' },
      { id: 'S2', name: 'Rahul Desai', status: 'Absent' },
      { id: 'S3', name: 'Neha Sharma', status: 'Present' },
    ],
  },
];

const TeacherAttendance = () => {
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [step, setStep] = useState(1);
  const [sessionData, setSessionData] = useState({ date: new Date().toISOString().split('T')[0], medium: 'English', class: '8' });
  const [activeAttendance, setActiveAttendance] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingStudents, setEditingStudents] = useState([]);
  const [originalStatuses, setOriginalStatuses] = useState({});
  const [errors, setErrors] = useState({});
  const classOptions = useMemo(
    () => (sessionData.medium === 'English' ? [8, 9, 10] : [3, 4, 5, 6, 7, 8, 9, 10]),
    [sessionData.medium]
  );
  const editSummary = useMemo(() => {
    const present = editingStudents.filter((student) => student.status === 'Present').length;
    const absent = editingStudents.filter((student) => student.status === 'Absent').length;
    return { total: editingStudents.length, present, absent };
  }, [editingStudents]);

  const isClassValidForMedium = (medium, cls) => {
    const classNumber = Number(cls);
    if (medium === 'English') return [8, 9, 10].includes(classNumber);
    if (medium === 'Marathi') return classNumber >= 3 && classNumber <= 10;
    return false;
  };

  const validateSession = () => {
    const nextErrors = {};
    if (!sessionData.date) nextErrors.date = 'Date is required.';
    if (!sessionData.class) nextErrors.class = 'Class is required.';
    if (sessionData.medium === 'English' && ![8, 9, 10].includes(Number(sessionData.class))) {
      nextErrors.class = 'English medium supports classes 8, 9, and 10 only.';
    }
    if (sessionData.medium === 'Marathi' && !(Number(sessionData.class) >= 3 && Number(sessionData.class) <= 10)) {
      nextErrors.class = 'Marathi medium supports classes 3 to 10 only.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleStartSession = (e) => {
    e.preventDefault();
    if (!validateSession()) {
      return toast.error('Please fix highlighted fields.');
    }
    
    // Check if session already exists
    const exists = records.find(r => r.date === sessionData.date && r.class === sessionData.class && r.medium === sessionData.medium);
    if(exists) {
      return toast.error('Attendance for this class on this date has already been recorded.');
    }

    // Initialize mock students with default 'Present'
    const loadedStudents = records[0]?.students
      ? records[0].students.map((student) => ({ id: student.id, name: student.name, status: 'Present' }))
      : [];
    setActiveAttendance(loadedStudents);
    setStep(2);
  };

  const toggleStudentStatus = (studentId) => {
    setActiveAttendance(activeAttendance.map(s => s.id === studentId ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s));
  };

  const handleSubmitAttendance = () => {
    setIsSubmitting(true);
    const presentCount = activeAttendance.filter(s => s.status === 'Present').length;
    const absentCount = activeAttendance.filter(s => s.status === 'Absent').length;

    const newRecord = {
      id: Date.now(),
      date: sessionData.date,
      medium: sessionData.medium,
      class: sessionData.class,
      present: presentCount,
      absent: absentCount,
      createdBy: 'teacher',
      students: activeAttendance,
    };

    setTimeout(() => {
      setRecords([newRecord, ...records]);
      setStep(1);
      setIsSubmitting(false);
      setErrors({});
      setSessionData({ date: new Date().toISOString().split('T')[0], medium: 'English', class: '8' });
      toast.success('Attendance recorded successfully.');
    }, 500);
  };

  const openEditModal = (record) => {
    if (record.createdBy !== 'teacher') {
      toast.error('You can only edit your own attendance sessions.');
      return;
    }
    if (!isClassValidForMedium(record.medium, record.class)) {
      toast.error('Invalid class and medium combination.');
      return;
    }
    const statuses = Object.fromEntries(record.students.map((student) => [student.id, student.status]));
    setOriginalStatuses(statuses);
    setEditingRecord(record);
    setEditingStudents(record.students);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (isUpdating) return;
    setIsEditOpen(false);
    setEditingRecord(null);
    setEditingStudents([]);
    setOriginalStatuses({});
  };

  const updateEditStatus = (studentId, status) => {
    setEditingStudents(
      editingStudents.map((student) => (student.id === studentId ? { ...student, status } : student))
    );
  };

  const handleUpdateAttendance = () => {
    if (!editingRecord) return;
    if (editingStudents.some((student) => !student.status)) {
      toast.error('Please select attendance status for all students.');
      return;
    }
    if (!isClassValidForMedium(editingRecord.medium, editingRecord.class)) {
      toast.error('Invalid class and medium combination.');
      return;
    }
    if (!window.confirm('Are you sure you want to update attendance?')) {
      return;
    }
    setIsUpdating(true);
    const presentCount = editingStudents.filter((student) => student.status === 'Present').length;
    const absentCount = editingStudents.filter((student) => student.status === 'Absent').length;

    setTimeout(() => {
      setRecords(
        records.map((record) =>
          record.id === editingRecord.id
            ? {
                ...record,
                students: editingStudents,
                present: presentCount,
                absent: absentCount,
              }
            : record
        )
      );
      setIsUpdating(false);
      closeEditModal();
      toast.success('Attendance updated successfully');
    }, 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Student Attendance</h2>
        <p className="text-gray-500 mt-1">Track and manage daily attendance records.</p>
      </div>

      {/* Step 1: Create Session */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 animate-in zoom-in-95">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-500" /> Start Attendance Session
          </h3>
          <form onSubmit={handleStartSession} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <input type="date" value={sessionData.date} onChange={e => { setSessionData({...sessionData, date: e.target.value}); setErrors({ ...errors, date: '' }); }} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none ${errors.date ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`} required/>
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Medium</label>
              <select value={sessionData.medium} onChange={e => { setSessionData({...sessionData, medium: e.target.value, class: ''}); setErrors({ ...errors, class: '' }); }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="English">English</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
              <select value={sessionData.class} onChange={e => { setSessionData({...sessionData, class: e.target.value}); setErrors({ ...errors, class: '' }); }} className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none disabled:bg-gray-100 ${errors.class ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`} required disabled={!sessionData.medium}>
                <option value="" disabled>Select Class</option>
                {classOptions.map(s => <option key={s} value={s}>Std {s}</option>)}
              </select>
              {errors.class && <p className="text-xs text-red-500 mt-1">{errors.class}</p>}
            </div>
            <div className="md:col-span-3 pt-2">
               <button type="submit" disabled={!sessionData.class} className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                 Start Attendance <ArrowRight className="w-4 h-4"/>
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Mark Attendance */}
      {step === 2 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-right-4">
           <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50 text-indigo-900 border-indigo-100">
             <div>
               <h3 className="text-lg font-bold flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" /> Marking Attendance</h3>
               <p className="text-sm font-medium mt-1">{sessionData.date} • {sessionData.medium} • Std {sessionData.class}</p>
             </div>
             <button onClick={() => setStep(1)} className="px-4 py-2 bg-white rounded-lg text-indigo-600 font-bold border border-indigo-200 hover:bg-indigo-50">Cancel</button>
           </div>
           
           <div className="p-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {activeAttendance.map(student => (
                  <div key={student.id} className={`p-4 border-2 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${student.status === 'Present' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`} onClick={() => toggleStudentStatus(student.id)}>
                     <span className="font-bold text-gray-900">{student.name}</span>
                     {student.status === 'Present' ? <CheckCircle className="w-6 h-6 text-green-600"/> : <XCircle className="w-6 h-6 text-red-600"/>}
                  </div>
                ))}
             </div>
             <div className="flex justify-end pt-4 border-t border-gray-100">
              <button onClick={handleSubmitAttendance} disabled={isSubmitting} className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5"/>} Submit Attendance
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Previous Records Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Records</h3>
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Medium</th>
                  <th className="p-4">Class</th>
                  <th className="p-4 text-center">Present</th>
                  <th className="p-4 text-center">Absent</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No data available</td></tr>
                ) : (
                  records.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-6 font-bold text-gray-900">{record.date}</td>
                      <td className="p-4 text-sm text-gray-600">{record.medium}</td>
                      <td className="p-4 text-sm font-bold text-gray-800">Std {record.class}</td>
                      <td className="p-4 text-center">
                        <span className="inline-block min-w-[3rem] px-2 py-1 bg-green-50 text-green-700 font-bold rounded-lg text-sm">{record.present}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block min-w-[3rem] px-2 py-1 bg-red-50 text-red-700 font-bold rounded-lg text-sm">{record.absent}</span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(record)}
                          disabled={record.createdBy !== 'teacher'}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Edit className="w-4 h-4" /> Edit Attendance
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:hidden space-y-3">
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No data available</div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <p className="font-bold text-gray-900">{record.date}</p>
                <p className="text-sm text-gray-600 mt-1">{record.medium} • Std {record.class}</p>
                <p className="text-sm text-green-700 mt-1">Present: {record.present}</p>
                <p className="text-sm text-red-700">Absent: {record.absent}</p>
                <button
                  type="button"
                  onClick={() => openEditModal(record)}
                  disabled={record.createdBy !== 'teacher'}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4" /> Edit Attendance
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {isEditOpen && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-100 max-h-[90vh] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Attendance</h3>
              <p className="text-sm text-gray-500">Update student attendance for this session</p>
              <p className="text-xs text-gray-500 mt-1">
                {editingRecord.date} • {editingRecord.medium} • Std {editingRecord.class}
              </p>
            </div>

            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white border border-gray-100 p-2">
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="text-lg font-bold text-gray-900">{editSummary.total}</p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-100 p-2">
                <p className="text-xs text-green-700">Present</p>
                <p className="text-lg font-bold text-green-700">{editSummary.present}</p>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-100 p-2">
                <p className="text-xs text-red-700">Absent</p>
                <p className="text-lg font-bold text-red-700">{editSummary.absent}</p>
              </div>
            </div>

            <div className="p-5 overflow-y-auto max-h-[52vh] space-y-3">
              {editingStudents.map((student) => {
                const isChanged = originalStatuses[student.id] !== student.status;
                return (
                  <div
                    key={student.id}
                    className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${isChanged ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'}`}
                  >
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          checked={student.status === 'Present'}
                          onChange={() => updateEditStatus(student.id, 'Present')}
                        />
                        Present
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name={`status-${student.id}`}
                          checked={student.status === 'Absent'}
                          onChange={() => updateEditStatus(student.id, 'Absent')}
                        />
                        Absent
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateAttendance}
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Update Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
