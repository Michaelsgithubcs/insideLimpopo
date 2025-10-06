/**
 * Direct Mobile Menu Handler
 * This provides a more direct approach to handle the mobile menu
 */
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're in mobile view
  if (window.innerWidth >= 992) return;

  console.log('Direct menu handler loaded');
  
  const navbarCollapse = document.getElementById('navbarNav');
  const navbarToggler = document.querySelector('.navbar-toggler');
  const overlay = document.querySelector('.mobile-menu-overlay');
  
  if (!navbarCollapse || !navbarToggler) {
    console.error('Required elements not found');
    return;
  }
  
  // Create debug display element
  const debugDisplay = document.createElement('div');
  debugDisplay.id = 'menu-debug-display';
  debugDisplay.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 9999;
    max-width: 300px;
    display: none;
  `;
  document.body.appendChild(debugDisplay);
  
  // Function to toggle debug display
  function toggleDebugDisplay() {
    const isVisible = debugDisplay.style.display === 'block';
    debugDisplay.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      updateDebugDisplay();
    }
  }
  
  // Double-tap bottom right corner to show debug
  let lastTap = 0;
  document.addEventListener('touchend', function(e) {
    const now = new Date().getTime();
    const touchX = e.changedTouches[0].clientX;
    const touchY = e.changedTouches[0].clientY;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Check if touch is in bottom right corner
    if (touchX > screenWidth - 50 && touchY > screenHeight - 50) {
      const timeSince = now - lastTap;
      if (timeSince < 300 && timeSince > 0) {
        toggleDebugDisplay();
      }
      lastTap = now;
    }
  });
  
  // Function to update debug display
  function updateDebugDisplay() {
    if (debugDisplay.style.display !== 'block') return;
    
    const navStyles = window.getComputedStyle(navbarCollapse);
    debugDisplay.innerHTML = `
      <div><strong>Menu State:</strong> ${navbarCollapse.classList.contains('show') ? 'OPEN' : 'CLOSED'}</div>
      <div><strong>Display:</strong> ${navStyles.display}</div>
      <div><strong>Visibility:</strong> ${navStyles.visibility}</div>
      <div><strong>Transform:</strong> ${navStyles.transform}</div>
      <div><strong>Right:</strong> ${navStyles.right}</div>
      <div><strong>Z-index:</strong> ${navStyles.zIndex}</div>
      <div><strong>Overlay Active:</strong> ${overlay ? overlay.classList.contains('active') : 'N/A'}</div>
    `;
    
    // Schedule next update
    setTimeout(updateDebugDisplay, 1000);
  }
  
  // Manual toggle function as fallback
  window.manualToggleMenu = function() {
    const willBeOpen = !navbarCollapse.classList.contains('show');
    
    if (willBeOpen) {
      navbarCollapse.style.transform = 'translateX(0)';
      navbarCollapse.style.display = 'flex';
      navbarCollapse.classList.add('show');
      
      if (overlay) {
        overlay.style.display = 'block';
        overlay.classList.add('active');
        overlay.style.opacity = '0.7';
      }
    } else {
      navbarCollapse.style.transform = 'translateX(100%)';
      navbarCollapse.classList.remove('show');
      
      if (overlay) {
        overlay.classList.remove('active');
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (!navbarCollapse.classList.contains('show')) {
            overlay.style.display = 'none';
          }
        }, 300);
      }
    }
    
    console.log(`Menu manually toggled to: ${willBeOpen ? 'OPEN' : 'CLOSED'}`);
    updateDebugDisplay();
  };
});
