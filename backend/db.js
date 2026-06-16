import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// 測試連線
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('資料庫連線失敗:', err.message);
  } else {
    console.log('資料庫連線成功，容器內時間：', res.rows[0].now);
  }
});

export default pool;