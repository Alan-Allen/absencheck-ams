import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardView from './DashboardView';
import CheckInView from './CheckInView';
import HistoryView from './HistoryView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
  const [statistics, setStatistics] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [studentRecords, setStudentRecords] = useState([]);
  const [currentClassId, setCurrentClassId] = useState('');
  const [classList, setClassList] = useState([]);
  const [activeClassList, setActiveClassList] = useState([]);
  const [dashHasRecord, setDashHasRecord] = useState(true);
  
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/initial-data`)
      .then(async (response) => {
        if (response.data.success && response.data.classes.length > 0) {
          const allClasses = response.data.classes;
          setClassList(allClasses);

          const checkPromises = allClasses.map(course => 
            axios.get(`${API_BASE_URL}/api/class-records?ClassId=${course.ClassId}&date=${todayDate}`)
              .then(res => ({ course, hasRecord: res.data.hasRecord !== false }))
              .catch(() => ({ course, hasRecord: false }))
          );

          const results = await Promise.all(checkPromises);
          const openedClasses = results.filter(r => r.hasRecord).map(r => r.course);
          
          setActiveClassList(openedClasses);
          if (openedClasses.length > 0) {
            setCurrentClassId(openedClasses[0].ClassId);
          } else {
            setCurrentClassId(allClasses[0].ClassId);
          }
        }
      })
      .catch((error) => console.error('撈取初始化路由失敗:', error));
  }, []);

  const fetchClassRecords = (classId, date) => {
    if (!classId) return;
    axios.get(`${API_BASE_URL}/api/class-records?ClassId=${classId}&date=${date}`)
      .then((response) => {
        if (response.data.success) {
          setDashHasRecord(response.data.hasRecord !== false);
          setStatistics(response.data.stats);
          setStudentRecords(response.data.list);
        }
      })
      .catch((error) => console.error('撈取名單失敗:', error));
  };

  useEffect(() => {
    fetchClassRecords(currentClassId, todayDate);
  }, [currentClassId]);

  const handleCheckIn = (stdNumber, status) => {
    if (!currentClassId) return;
    const payload = { ClassId: currentClassId, StdNumber: stdNumber, YMD: todayDate, Status: status };

    axios.post(`${API_BASE_URL}/api/save-checkin`, payload)
      .then((response) => {
        if (response.data.success) {
          fetchClassRecords(currentClassId, todayDate);
          alert(`學號 ${stdNumber} 簽到成功！`);
        }
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          console.error('發送簽到錯誤:', error);
        }
      });
  };

  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<CheckInView classList={activeClassList} currentClassId={currentClassId} setCurrentClassId={setCurrentClassId} todayDate={todayDate} onCheckIn={handleCheckIn} />} />

        <Route path="/dashboard" element={<DashboardView statistics={statistics} studentRecords={studentRecords} currentClassId={currentClassId} setCurrentClassId={setCurrentClassId} classList={activeClassList} todayDate={todayDate} hasRecord={dashHasRecord} />} />

        <Route path="/history" element={<HistoryView classList={classList} fetchClassRecords={fetchClassRecords} initialClassId={currentClassId} todayDate={todayDate} />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;