const cron = require('node-cron');
const newsCacheService = require('./newsCacheService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  // Start staggered news cache refresh jobs
  startNewsCacheRefresh() {
    const categories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    
    categories.forEach((category, index) => {
      // Stagger each category by 20 minutes: 0, 20, 40 minutes past the hour
      const minutes = (index * 20) % 60;
      const hours = Math.floor(index * 20 / 60);
      const cronPattern = `${minutes} ${hours}-23/2 * * *`; // Every 2 hours starting at different times
      
      const job = cron.schedule(cronPattern, async () => {
        console.log(`Starting scheduled refresh for category: ${category}`);
        try {
          await newsCacheService.fetchAndCacheNews(category, 'us', 20);
          console.log(`Scheduled refresh completed for category: ${category}`);
        } catch (error) {
          console.error(`Error refreshing category ${category}:`, error.message);
        }
      }, {
        scheduled: false,
        timezone: "Africa/Johannesburg"
      });
      
      this.jobs.set(`refresh_${category}`, job);
      job.start();
      console.log(`Scheduler started for ${category} (${cronPattern})`);
    });
    
    // Run initial refresh with delays
    this.initialCacheRefresh();
  }

  // Run initial cache refresh with staggered timing
  async initialCacheRefresh() {
    console.log('Running initial staggered news cache refresh...');
    const categories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      try {
        console.log(`Fetching initial data for: ${category}`);
        await newsCacheService.fetchAndCacheNews(category, 'us', 20);
        
        // Wait 2 minutes between each category on startup
        if (i < categories.length - 1) {
          console.log(`Waiting 2 minutes before next category...`);
          await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
        }
      } catch (error) {
        console.error(`Error during initial refresh for ${category}:`, error.message);
      }
    }
    console.log('Initial staggered news cache refresh completed');
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
