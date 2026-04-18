import React, { useState } from 'react';
import { ClipboardList, Users, CheckCircle, XCircle, ArrowRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_RECORDS = [
  { id: 1, date: '2026-03-20', medium: 'English', class: '9', present: 40, absent: 5 },
];

const MOCK_STUDENTS = [
  { id: 'S1', name: 'Alok Kumar' },
  { id: 'S2', name: 'Rahul Desai' },
  { id: 'S3', name: 'Neha Sharma' },
];

const TeacherAttendance = () => {
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [step, setStep] = useState(1);
  const [sessionData, setSessionData] = useState({ date: new Date().toISOString().split('T')[0], medium: 'English', class: '8' });
  const [activeAttendance, setActiveAttendance] = useState([]);

  const handleStartSession = (e) => {
    e.preventDefault();
    if(!sessionData.date || !sessionData.class) {
      return toast.error('Date, Medium, and Class are required.');
    }
    
    // Check if session already exists
    const exists = records.find(r => r.date === sessionData.date && r.class === sessionData.class && r.medium === sessionData.medium);
    if(exists) {
      return toast.error('Attendance for this class on this date has already been recorded.');
    }

    // Initialize mock students with default 'Present'
    const loadedStudents = MOCK_STUDENTS.map(s => ({ ...s, status: 'Present' }));
    setActiveAttendance(loadedStudents);
    setStep(2);
  };

  const toggleStudentStatus = (studentId) => {
    setActiveAttendance(activeAttendance.map(s => s.id === studentId ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s));
  };

  const handleSubmitAttendance = () => {
    const presentCount = activeAttendance.filter(s => s.status === 'Present').length;
    const absentCount = activeAttendance.filter(s => s.status === 'Absent').length;

    const newRecord = {
      id: Date.now(),
      date: sessionData.date,
      medium: sessionData.medium,
      class: sessionData.class,
      present: presentCount,
      absent: absentCount
    };

    setRecords([newRecord, ...records]);
    setStep(1);
    toast.success('Attendance recorded successfully.');
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
              <input type="date" value={sessionData.date} onChange={e => setSessionData({...sessionData, date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" required/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Medium</label>
              <select value={sessionData.medium} onChange={e => setSessionData({...sessionData, medium: e.target.value, class: ''})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="English">English</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
              <select value={sessionData.class} onChange={e => setSessionData({...sessionData, class: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100" required disabled={!sessionData.medium}>
                <option value="" disabled>Select Class</option>
                {sessionData.medium === 'English' && [8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
                {sessionData.medium === 'Marathi' && [3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
              </select>
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
               <button onClick={handleSubmitAttendance} className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                 <Save className="w-5 h-5"/> Submit Attendance
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Previous Records Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Records</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Medium</th>
                  <th className="p-4">Class</th>
                  <th className="p-4 text-center">Present</th>
                  <th className="p-4 text-center">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No attendance records found.</td></tr>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;
