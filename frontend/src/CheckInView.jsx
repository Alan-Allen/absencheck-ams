import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function CheckInView({ 
  classList, 
  currentClassId, 
  setCurrentClassId, 
  todayDate, 
  onCheckIn 
}) {
  const [stdNumber, setStdNumber] = useState('');

  const handleSubmit = (event, status) => {
    event.preventDefault();
    if (!stdNumber.trim()) {
      alert('請輸入學號！');
      return;
    }
    onCheckIn(stdNumber.trim(), status);
    setStdNumber(''); // 簽到成功後清空輸入框
  };

  return (
    <div style={{ backgroundColor: '#1c1c1c', color: '#ffffff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#262626', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '40px', boxSizing: 'border-box', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
        
        {/* 頂部標題系統 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: '#f38020', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Attendance Management System</div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '400', letterSpacing: '-0.02em' }}>學生自主簽到系統</h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#999999' }}>今日日期：<span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{todayDate}</span></p>
        </div>

        {/* 檢查今天有沒有任何一門課開課 */}
        {classList && classList.length > 0 ? (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 課程選擇欄位 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: '#999999', fontWeight: '500' }}>請選擇當前堂課</label>
              <select value={currentClassId} onChange={(e) => setCurrentClassId(e.target.value)} style={{ width: '100%', padding: '12px 14px', backgroundColor: '#1c1c1c', color: '#ffffff', border: '1px solid #3d3d3d', borderRadius: '4px', fontSize: '15px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }} >
                {classList.map((course) => (
                  <option key={course.ClassId} value={course.ClassId}>
                    {course.ClassId} - {course.ClassName}
                  </option>
                ))}
              </select>
            </div>

            {/* 學號輸入欄位 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: '#999999', fontWeight: '500' }}>輸入您的學號</label>
              <input type="text" placeholder="請輸入學號 (例如: S001)" value={stdNumber} onChange={(e) => setStdNumber(e.target.value)} style={{ width: '100%', padding: '12px 14px', backgroundColor: '#1c1c1c', color: '#ffffff', border: '1px solid #3d3d3d', borderRadius: '4px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} />
            </div>

              <button type="button" onClick={(e) => handleSubmit(e, '出席')} style={{ padding: '14px', backgroundColor: '#f38020', color: '#ffffff', border: '1px solid #e07016', borderRadius: '4px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.15s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#e07016'} onMouseOut={(e) => e.target.style.backgroundColor = '#f38020'}>
                確認出席
              </button>

          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 0', backgroundColor: '#1c1c1c', border: '1px dashed #3d3d3d', borderRadius: '4px' }}>
            <div style={{ fontSize: '15px', color: '#999999', marginBottom: '4px' }}>今日無任何開課點名</div>
            <div style={{ fontSize: '13px', color: '#666666' }}>請聯絡授權教師開啟點名系統</div>
          </div>
        )}

      </div>
    </div>
  );
}

export default CheckInView;