/**
 * Responsive Navigation Handler
 * Ensures proper switching between mobile and desktop navigation
 */
document.addEventListener('DOMContentLoaded', function() {
  // Track if we're in mobile view
  let isMobileView = window.innerWidth < 992;
  
  // Get navbar elements
  const navbarNav = document.getElementById('navbarNav');
  const navItems = document.querySelectorAll('.navbar-nav .nav-item');
  
  // Initial setup
  applyLayoutStyles();
  
  // Handle resize events
  window.addEventListener('resize', function() {
    const wasMobileView = isMobileView;
    isMobileView = window.innerWidth < 992;
    
    // If we changed breakpoints, update styles
    if (wasMobileView !== isMobileView) {
      applyLayoutStyles();
    }
  });
  
  // Apply appropriate styles based on viewport
  function applyLayoutStyles() {
    if (isMobileView) {
      console.log('Applying mobile navigation styles');
      // Let mobile-specific CSS handle this
    } else {
      console.log('Applying desktop navigation styles');
      
      // Force horizontal layout in desktop view
      const navbarNavList = document.querySelector('.navbar-nav');
      if (navbarNavList) {
        navbarNavList.style.flexDirection = 'row';
        navbarNavList.style.marginTop = '0';
      }
      
      // Reset all nav items to proper horizontal display
      navItems.forEach(item => {
        item.style.width = 'auto';
        item.style.textAlign = 'center';
        item.style.margin = '0 5px';
      });
      
      // Reset navbar styles for desktop
      if (navbarNav) {
        // Only if it has mobile-specific styles
        if (navbarNav.classList.contains('mobile-open')) {
          navbarNav.classList.remove('mobile-open');
        }
        
        // Reset positioning
        navbarNav.style.position = 'static';
        navbarNav.style.transform = 'none';
        navbarNav.style.width = 'auto';
        navbarNav.style.height = 'auto';
      }
    }
  }
});
