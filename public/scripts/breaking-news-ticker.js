// Breaking news ticker animation with improved error handling
document.addEventListener('DOMContentLoaded', function() {
  const tickerContent = document.getElementById('breaking-news-content');
  
  if (!tickerContent) {
    console.error('Ticker content element not found');
    return;
  }
  
  // Wait a moment for the ticker content to be populated
  setTimeout(() => {
    initTicker();
  }, 500);
  
  function initTicker() {
    // Don't start animation if no ticker items
    const tickerItems = tickerContent.querySelectorAll('.ticker-item');
    if (!tickerItems.length) {
      console.log('No ticker items found, delaying animation');
      setTimeout(initTicker, 500);
      return;
    }
    
    const tickerWidth = tickerItems[0].offsetWidth;
    let position = 0;
    let animationFrameId = null;
    let isPaused = false;
    
    // Pause animation when mobile menu is open
    document.addEventListener('mobilemenuchange', (event) => {
      isPaused = event.detail.isOpen;
      console.log('Ticker animation', isPaused ? 'paused' : 'resumed');
    });
    
    function animateTicker() {
      // Skip animation frame if paused
      if (isPaused) {
        animationFrameId = requestAnimationFrame(animateTicker);
        return;
      }
      
      position -= 1;
      
      // Get current items as they may have changed
      const currentItems = tickerContent.querySelectorAll('.ticker-item');
      
      if (currentItems.length === 0) {
        // No items, skip animation
        animationFrameId = requestAnimationFrame(animateTicker);
        return;
      }
      
      if (position < -tickerWidth && currentItems.length > 0) {
        position = 0;
        
        try {
          // Create a clone of the first item
          const clonedItem = currentItems[0].cloneNode(true);
          tickerContent.appendChild(clonedItem);
          
          // Safe removal of first item with error handling
          if (currentItems[0] && currentItems[0].parentNode === tickerContent) {
            tickerContent.removeChild(currentItems[0]);
          }
        } catch (error) {
          console.log('Ticker animation error handled:', error.message);
          // Reset position without modifying DOM
          position = 0;
        }
      }
      
      // Apply transform safely
      if (tickerContent) {
        tickerContent.style.transform = `translateX(${position}px)`;
      }
      
      animationFrameId = requestAnimationFrame(animateTicker);
    }
    
    // Start animation
    animationFrameId = requestAnimationFrame(animateTicker);
    
    // Clean up on page navigation
    window.addEventListener('beforeunload', () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    });
  }
});
