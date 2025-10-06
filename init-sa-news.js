// Script to initialize Local news cache
const localNewsCacheService = require('./services/saNewsCacheService');

async function initializeLocalNewsCache() {
  console.log('Initializing Local news cache...');
  try {
    await localNewsCacheService.refreshAllCategories();
    console.log('Local news cache initialized successfully!');
  } catch (error) {
    console.error('Error initializing Local news cache:', error);
  }
  process.exit(0);
}

initializeLocalNewsCache();
