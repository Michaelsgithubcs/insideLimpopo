const cron = require('node-cron');
const newsCacheService = require('./newsCacheService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  // Start the news cache refresh job (every 2 hours)
  startNewsCacheRefresh() {
    // Run every 2 hours: '0 */2 * * *'
    // For testing, you can use '*/5 * * * *' (every 5 minutes)
    const job = cron.schedule('0 */2 * * *', async () => {
      console.log('Starting scheduled news cache refresh...');
      try {
        await newsCacheService.refreshAllCategories();
        console.log('Scheduled news cache refresh completed successfully');
      } catch (error) {
        console.error('Error during scheduled news cache refresh:', error.message);
      }
    }, {
      scheduled: false,
      timezone: "Africa/Johannesburg" // Adjust to your timezone
    });

    this.jobs.set('newsCacheRefresh', job);
    job.start();
    console.log('News cache refresh scheduler started (runs every 2 hours)');
    
    // Also run an initial cache refresh on startup
    this.initialCacheRefresh();
  }

  // Run initial cache refresh when server starts
  async initialCacheRefresh() {
    console.log('Running initial news cache refresh...');
    try {
      await newsCacheService.refreshAllCategories();
      console.log('Initial news cache refresh completed successfully');
    } catch (error) {
      console.error('Error during initial news cache refresh:', error.message);
    }
  }

  // Stop a specific job
  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      console.log(`Stopped job: ${jobName}`);
    }
  }

  // Stop all jobs
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  // Get status of all jobs
  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }

  // Manual trigger for news cache refresh (for testing/admin use)
  async triggerNewsCacheRefresh() {
    console.log('Manually triggering news cache refresh...');
    try {
      await newsCacheService.refreshAllCategories();
      console.log('Manual news cache refresh completed successfully');
      return { success: true, message: 'Cache refresh completed' };
    } catch (error) {
      console.error('Error during manual news cache refresh:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SchedulerService();
