// Script to initialize South African news cache
const saNewsCacheService = require('./services/saNewsCacheService');

async function initializeSANewsCache() {
  console.log('Initializing South African news cache...');
  try {
    await saNewsCacheService.refreshAllCategories();
    console.log('South African news cache initialized successfully!');
  } catch (error) {
    console.error('Error initializing South African news cache:', error);
  }
  process.exit(0);
}

initializeSANewsCache();
