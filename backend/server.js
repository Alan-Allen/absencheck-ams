import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = 8080;

app.use(cors()); 
app.use(express.json()); 

app.get('/api/initial-data', async (req, res) => {
  try {
    const studentsResult = await pool.query('SELECT "StdNumber", "StdName" FROM student ORDER BY "StdNumber"');
    const classesResult = await pool.query('SELECT "ClassId", "ClassName", "Teacher" FROM class ORDER BY "ClassId"');
    
    res.json({
      success: true,
      message: "成功撈取初始化資料！",
      students: studentsResult.rows,
      classes: classesResult.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/class-records', async (req, res) => {
  const { ClassId, date } = req.query;
  const targetDate = String(date).trim();

  if (!ClassId || !date) {
    return res.status(400).json({ success: false, message: '缺少必要參數（ClassId, date）' });
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = (targetDate === todayStr); 

    const sqlCheckClass = 'SELECT * FROM classrecords WHERE "ClassId" = $1 AND "YMD" = $2';
    const checkRes = await pool.query(sqlCheckClass, [ClassId, targetDate]);
    
    if (checkRes.rows.length === 0) {
      return res.json({ success: true, hasRecord: false, stats: { today: targetDate, total: 0, present: 0, absent: 0, late: 0 }, list: [] });
    }

    const classRecord = checkRes.rows[0];

    const sqlList = `
      SELECT student."StdNumber", student."StdName", COALESCE(studentrecords."Status", '缺席') AS "Status"
      FROM studentlist
      JOIN student ON studentlist."StdNumber" = student."StdNumber"
      LEFT JOIN studentrecords ON student."StdNumber" = studentrecords."StdNumber" 
        AND studentlist."ClassId" = studentrecords."ClassId" 
        AND studentrecords."YMD" = $1
      WHERE studentlist."ClassId" = $2
      ORDER BY student."StdNumber"
    `;
    const listRes = await pool.query(sqlList, [targetDate, ClassId]);
    const totalStudents = listRes.rows.length;

    let finalStats = {};

    if (isToday) {
      const sqlCalcStats = `
        SELECT COALESCE(sr."Status", '缺席') AS status, COUNT(*) AS count
        FROM studentlist sl
        LEFT JOIN studentrecords sr ON sl."StdNumber" = sr."StdNumber"
          AND sl."ClassId" = sr."ClassId"
          AND sr."YMD" = $1
        WHERE sl."ClassId" = $2
        GROUP BY COALESCE(sr."Status", '缺席')
      `;
      const statsRes = await pool.query(sqlCalcStats, [targetDate, ClassId]);
      
      let presentCount = 0; 
      let absentCount = 0;
      
      statsRes.rows.forEach(row => {
        if (row.status === '出席') presentCount = parseInt(row.count);
        else if (row.status === '缺席') absentCount = parseInt(row.count);
      });

      finalStats = { today: targetDate, total: totalStudents, present: presentCount, absent: absentCount, late: 0 };
    } else {
      finalStats = { 
        today: targetDate, 
        total: totalStudents, 
        present: parseInt(classRecord.Present || 0), 
        absent: parseInt(classRecord.Absent || 0), 
        late: 0 
      };
    }

    res.json({
      success: true,
      hasRecord: true,
      stats: finalStats,
      list: listRes.rows
    });

  } catch (err) {
    console.error('撈取課堂出缺席紀錄失敗:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/save-checkin', async (req, res) => {
  const { ClassId, StdNumber, YMD, Status } = req.body;

  if (!ClassId || !StdNumber || !YMD || !Status) {
    return res.status(400).json({ success: false, message: '缺少必要參數（ClassId, StdNumber, YMD, Status）' });
  }

  try {
    const sqlCheckClass = 'SELECT * FROM classrecords WHERE "ClassId" = $1 AND "YMD" = $2';
    const classRes = await pool.query(sqlCheckClass, [ClassId, YMD]);
    
    if (classRes.rows.length === 0) {
      return res.status(403).json({ success: false, message: `簽到失敗：課程 ${ClassId} 於今日 (${YMD}) 並無開課點名紀錄。` });
    }

    const currentRecord = classRes.rows[0];
    if (currentRecord.Present !== null || currentRecord.Absent !== null) {
      return res.status(403).json({ success: false, message: '簽到失敗：該課程點名已結束並封存歷史。' });
    }

    const sqlUpsertStudent = `
      INSERT INTO studentrecords ("ClassId", "StdNumber", "YMD", "Status")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("ClassId", "StdNumber", "YMD") 
      DO UPDATE SET "Status" = EXCLUDED."Status"
    `;
    await pool.query(sqlUpsertStudent, [ClassId, StdNumber, YMD, Status]);

    const sqlCalcStats = `
      SELECT COALESCE(sr."Status", '缺席') AS status, COUNT(*) AS count
      FROM studentlist sl
      LEFT JOIN studentrecords sr ON sl."StdNumber" = sr."StdNumber" 
        AND sl."ClassId" = sr."ClassId" 
        AND sr."YMD" = $1
      WHERE sl."ClassId" = $2
      GROUP BY COALESCE(sr."Status", '缺席')
    `;
    const statsRes = await pool.query(sqlCalcStats, [YMD, ClassId]);
    
    let present = 0; 
    let absent = 0; 
    
    statsRes.rows.forEach(row => {
      if (row.status === '出席') present = parseInt(row.count);
      else if (row.status === '缺席') absent = parseInt(row.count);
    });

    const sqlUpdateClassStats = `
      UPDATE classrecords 
      SET "Present" = $1, "Absent" = $2, "Late" = 0 
      WHERE "ClassId" = $3 AND "YMD" = $4
    `;
    await pool.query(sqlUpdateClassStats, [present, absent, ClassId, YMD]);

    res.json({
      success: true,
      message: `學號 ${StdNumber} 成功簽到（狀態：${Status}），大看板數據已即時同步更新。`
    });

  } catch (err) {
    console.error('資料庫驗證或寫入簽到失敗:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`伺服器運行中：http://localhost:${PORT}`);
});