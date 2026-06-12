import React from 'react';
import { Link } from 'react-router-dom';

function DashboardView({ 
  statistics, 
  studentRecords, 
  currentClassId, 
  setCurrentClassId,
  classList,
  todayDate,
  hasRecord // 🔑 重要資訊：從 App.jsx 接收今日開課激活旗標
}) {
  return (
    <div style={{ backgroundColor: '#1c1c1c', color: '#ffffff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '40px' }}>
      
      <header style={{ paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#f38020', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>AMS / Live Dashboard</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '400', color: '#ffffff', letterSpacing: '-0.02em' }}>今日即時出缺席統計</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#999999' }}>當前日期：<span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{todayDate}</span></p>
        </div>
        
        <Link to="/history" style={{ padding: '8px 16px', backgroundColor: '#f38020', color: '#ffffff', textDecoration: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '500', border: '1px solid #e07016', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center' }} onMouseOver={(e) => { e.target.style.backgroundColor = '#e07016'; e.target.style.borderColor = '#c65f11'; }} onMouseOut={(e) => { e.target.style.backgroundColor = '#f38020'; e.target.style.borderColor = '#e07016'; }}>
          歷史出缺席日誌總覽
        </Link>
      </header>

      <hr style={{ border: 'none', borderTop: '1px solid #3d3d3d', margin: '0 0 24px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#999999', fontSize: '14px' }}>當前課程：</span>
          <select value={currentClassId} onChange={(event) => setCurrentClassId(event.target.value)} style={{ padding: '8px 14px', backgroundColor: '#262626', color: '#ffffff', border: '1px solid #3d3d3d', borderRadius: '4px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', outline: 'none' }} >
            {classList && classList.map((course) => (
              <option key={course.ClassId} value={course.ClassId}>
                {course.ClassId} - {course.ClassName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ fontSize: '20px', fontWeight: '400', color: '#ffffff', marginBottom: '20px', letterSpacing: '-0.01em' }}>今日統計狀況</div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#262626', border: '1px solid #3d3d3d', borderRadius: '4px', padding: '24px' }}>
          <div style={{ color: '#999999', fontSize: '13px', fontWeight: '500' }}>應到總人數</div>
          <div style={{ fontSize: '28px', fontWeight: '400', color: '#ffffff', marginTop: '16px' }}>{statistics.total}</div>
        </div>
        
        <div style={{ backgroundColor: '#262626', border: '1px solid #3d3d3d', borderRadius: '4px', padding: '24px' }}>
          <div style={{ color: '#999999', fontSize: '13px', fontWeight: '500' }}>今日出席率</div>
          <div style={{ fontSize: '28px', fontWeight: '400', color: '#ffffff', marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            {statistics.total > 0 ? ((statistics.present / statistics.total) * 100).toFixed(1) : 0}%
            <span style={{ fontSize: '14px', color: '#999999' }}>({statistics.present} 人)</span>
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#3d3d3d', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${statistics.total > 0 ? (statistics.present / statistics.total) * 100 : 0}%`, height: '100%', backgroundColor: '#f38020', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#262626', border: '1px solid #3d3d3d', borderRadius: '4px', padding: '24px' }}>
          <div style={{ color: '#999999', fontSize: '13px', fontWeight: '500' }}>今日缺席</div>
          <div style={{ fontSize: '28px', fontWeight: '400', color: '#ffffff', marginTop: '16px' }}>
            {statistics.absent} <span style={{ fontSize: '14px', color: '#999999' }}>人未簽到</span>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#262626', border: '1px solid #3d3d3d', borderRadius: '4px', padding: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: '400', color: '#ffffff', marginBottom: '20px' }}>今日修課名單</div>
        
        {hasRecord !== false ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3d3d3d', color: '#999999', fontSize: '13px', fontWeight: '500' }}>
                <th style={{ padding: '14px 16px' }}>學號</th>
                <th style={{ padding: '14px 16px' }}>姓名</th>
                <th style={{ padding: '14px 16px' }}>狀態</th>
              </tr>
            </thead>
            <tbody>
              {studentRecords && studentRecords.map((student) => (
                <tr key={student.StdNumber} style={{ borderBottom: '1px solid #3d3d3d', fontSize: '14px' }}>
                  <td style={{ padding: '14px 16px', color: '#999999', fontFamily: 'monospace' }}>{student.StdNumber}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '400', color: '#ffffff' }}>{student.StdName}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {student.Status === '出席' && <span style={{ padding: '3px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '500', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>✓ 已簽到</span>}
                    {student.Status === '遲到' && <span style={{ padding: '3px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '500', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' }}>⚠ 遲到</span>}
                    {student.Status === '缺席' && <span style={{ padding: '3px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '500', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' }}>✗ 缺席</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999999', fontSize: '15px', letterSpacing: '0.05em' }}>
            該課程今日尚未開啟點名，目前無法簽到
          </div>
        )}
      </section>

    </div>
  );
}

export default DashboardView;