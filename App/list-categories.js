const getPool = require('./config/db');

(async () => {
  const pool = await getPool();
  const [categories] = await pool.query('SELECT category_id, name FROM categories');
  console.log('Categories:');
  categories.forEach(cat => {
    console.log(`ID: ${cat.category_id}, Name: ${cat.name}`);
  });
  process.exit(0);
})(); 