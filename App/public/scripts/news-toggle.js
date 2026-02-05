/**
 * News source toggle functionality
 * This script handles the toggle between World News and Local News
 */

document.addEventListener('DOMContentLoaded', function() {
  // News source state - check localStorage or default to 'sa' (local news)
  let currentNewsSource = localStorage.getItem('newsSource') || 'sa';
  
  // Toggle buttons - find all instances in case there are multiple on the page
  const worldNewsBtns = document.querySelectorAll('#worldNewsBtn');
  const saNewsBtns = document.querySelectorAll('#saNewsBtn');
  
  if (worldNewsBtns.length > 0 && saNewsBtns.length > 0) {
    // Initialize button states based on saved preference
    updateButtonStates();
    
    // Add click event listeners to all world news buttons
    worldNewsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentNewsSource !== 'world') {
          currentNewsSource = 'world';
          savePreference();
          updateButtonStates();
          
          // If we're on the home page, reload the news
          if (window.location.pathname === '/' && typeof loadAllNews === 'function') {
            loadAllNews();
          }
        }
      });
    });

    // Add click event listeners to all SA news buttons
    saNewsBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentNewsSource !== 'sa') {
          currentNewsSource = 'sa';
          savePreference();
          updateButtonStates();
          
          // If we're on the home page, reload the news
          if (window.location.pathname === '/' && typeof loadAllNews === 'function') {
            loadAllNews();
          }
        }
      });
    });
  }
  
  // Save user preference to localStorage
  function savePreference() {
    localStorage.setItem('newsSource', currentNewsSource);
  }
  
  // Update button active states
  function updateButtonStates() {
    if (currentNewsSource === 'world') {
      // Update all world news buttons
      worldNewsBtns.forEach(btn => btn.classList.add('active'));
      saNewsBtns.forEach(btn => btn.classList.remove('active'));
    } else {
      // Update all SA news buttons
      worldNewsBtns.forEach(btn => btn.classList.remove('active'));
      saNewsBtns.forEach(btn => btn.classList.add('active'));
    }
  }
  
  // Expose the current news source to the global scope
  window.getCurrentNewsSource = function() {
    return currentNewsSource;
  };
});
