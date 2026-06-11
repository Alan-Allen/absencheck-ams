import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function HistoryView({ classList, todayDate, initialClassId }) {
  const [historyClassId, setHistoryClassId] = useState(initialClassId || '');
  const [historyDate, setHistoryDate] = useState(todayDate);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyStats, setHistoryStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [hasRecord, setHasRecord] = useState(true);
  const [filteredClassList, setFilteredClassList] = useState([]);

  useEffect(() => {
    if (initialClassId) {
      setHistoryClassId(initialClassId);
    }
  }, [initialClassId]);

  useEffect(() => {
    if (!classList || classList.length === 0) return;

    const checkHistoryClasses = async () => {
      const checkPromises = classList.map(course => 
        axios.get(`${API_BASE_URL}/api/class-records?ClassId=${course.ClassId}&date=${historyDate}`)
          .then(res => ({ course, hasRecord: res.data.hasRecord !== false }))
          .catch(() => ({ course, hasRecord: false }))
      );

      const results = await Promise.all(checkPromises);
      const openedClasses = results.filter(r => r.hasRecord).map(r => r.course);
      
      setFilteredClassList(openedClasses);
      
      if (openedClasses.length > 0 && !openedClasses.some(c => c.ClassId === historyClassId)) {
        setHistoryClassId(openedClasses[0].ClassId);
      }
    };

    checkHistoryClasses();
  }, [historyDate, classList]);

  useEffect(() => {
    if (!historyClassId) return;
    
    axios.get(`${API_BASE_URL}/api/class-records?ClassId=${historyClassId}&date=${historyDate}`)
      .then((response) => {
        if (response.data.success) {
          setHasRecord(response.data.hasRecord !== false);
          setHistoryStats(response.data.stats);
          setHistoryRecords(response.data.list);
        }
      })
      .catch((error) => console.error('撈取歷史名單失敗:', error));
  }, [historyClassId, historyDate]);

  return (
    <div style={{ backgroundColor: '#1c1c1c', color: '#ffffff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '40px' }}>
      
      <header style={{ paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#f38020', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>AMS / Historical Query Terminal</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '400', color: '#ffffff', letterSpacing: '-0.02em' }}>歷史出缺席日誌總覽</h1>
        </div>
        
        <Link to="/dashboard" style={{ padding: '8px 16px', backgroundColor: '#f38020', color: '#ffffff', textDecoration: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '500', border: '1px solid #e07016', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center' }} onMouseOver={(e) => { e.target.style.backgroundColor = '#e07016'; e.target.style.borderColor = '#c65f11'; }} onMouseOut={(e) => { e.target.style.backgroundColor = '#f38020'; e.target.style.borderColor = '#e07016'; }}>
          即時出缺席統計
        </Link>
      </header>

      <hr style={{ border: 'none', borderTop: '1px solid #3d3d3d', margin: '0 0 24px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#999999', fontSize: '14px' }}>檢索目標日期：</span>
          <input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} style={{ padding: '8px 14px', backgroundColor: '#262626', color: '#ffffff', border: '1px solid #3d3d3d', borderRadius: '4px', fontSize: '14px', colorScheme: 'dark', outline: 'none', cursor: 'pointer' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#999999', fontSize: '14px' }}>檢索目標課程：</span>
          <select value={historyClassId} onChange={(e) => setHistoryClassId(e.target.value)} style={{ padding: '8px 14px', backgroundColor: '#262626', color: '#ffffff', border: '1px solid #3d3d3d', borderRadius: '4px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', outline: 'none' }} >
            {filteredClassList.length > 0 ? (
              filteredClassList.map((course) => (
                <option key={course.ClassId} value={course.ClassId}>{course.ClassId} - {course.ClassName}</option>
              ))
            ) : (
              <option value="">該日期無任何開課</option>
            )}
          </select>
        </div>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#262626', border: '1px solid #3d3d3d', borderRadius: '4px', padding: '24px' }}>
          <div style={{ color: '#999999', fontSize: '13px', fontWeight: '500' }}>該課堂總應到人數</div>
          <div style={{ fontSize: '28px', fontWeight: '400', color: '#ffffff', marginTop: '16px' }}>{historyStats.total}</div>
        </div>
        <div style={{ backgroundColor: '#262626', border: '1px solid #3d3d3d', borderRadius: '4px', padding: '24px' }}>
          <div style={{ color: '#999999', fontSize: '13px', fontWeight: '500' }}>當日歷史出席率</div>
          <div style={{ fontSize: '28px', fontWeight: '400', color: '#ffffff', marginTop: '16px' }}>
            {historyStats.total > 0 ? ((historyStats.present / historyStats.total) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div style={{ backgroundColor: '#262626', border: '1px solid #3d3d3d', borderRadius: '4px', padding: '24px' }}>
          <div style={{ color: '#999999', fontSize: '13px', fontWeight: '500' }}>當日歷史缺席人數</div>
          <div style={{ fontSize: '28px', fontWeight: '400', color: '#ffffff', marginTop: '16px' }}>{historyStats.absent}</div>
        </div>
      </section>

      <section style={{ backgroundColor: '#262626', border: '1px solid #3d3d3d', borderRadius: '4px', padding: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: '400', color: '#ffffff', marginBottom: '20px' }}>
          歷史封包數據快照 ({historyDate})
        </div>

        {hasRecord && filteredClassList.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3d3d3d', color: '#999999', fontSize: '13px', fontWeight: '500' }}>
                <th style={{ padding: '14px 16px' }}>學號</th>
                <th style={{ padding: '14px 16px' }}>姓名</th>
                <th style={{ padding: '14px 16px' }}>歷史記錄狀態</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords && historyRecords.map((student) => (
                <tr key={student.StdNumber} style={{ borderBottom: '1px solid #3d3d3d', fontSize: '14px' }}>
                  <td style={{ padding: '14px 16px', color: '#999999', fontFamily: 'monospace' }}>{student.StdNumber}</td>
                  <td style={{ padding: '14px 16px', color: '#ffffff' }}>{student.StdName}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {student.Status === '出席' && <span style={{ padding: '3px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '500', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>出席</span>}
                    {student.Status === '遲到' && <span style={{ padding: '3px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '500', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' }}>遲到</span>}
                    {student.Status === '缺席' && <span style={{ padding: '3px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '500', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' }}>缺席</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999999', fontSize: '15px', letterSpacing: '0.05em' }}>
            該日期無開課與出缺席點名紀錄
          </div>
        )}
      </section>
    </div>
  );
}

export default HistoryView;