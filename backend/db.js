import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'ams-db',       
  port: 5432,
  database: 'amsdb',
  user: 'postgres',
  password: 'admin1234',
});

export default pool;