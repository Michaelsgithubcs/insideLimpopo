/**
 * Mobile Menu Debugger
 * This script helps diagnose and fix mobile menu display issues
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Mobile Menu Debugger loaded');
  
  // Elements
  const navbarCollapse = document.getElementById('navbarNav');
  const navbarToggler = document.querySelector('.navbar-toggler');
  
  if (!navbarCollapse || !navbarToggler) {
    console.error('Mobile Menu Debugger: Required elements not found');
    return;
  }
  
  // Log computed styles for menu
  function logMenuStyles() {
    if (!navbarCollapse) return;
    
    const styles = window.getComputedStyle(navbarCollapse);
    console.log('Menu styles:', {
      display: styles.display,
      visibility: styles.visibility,
      position: styles.position,
      top: styles.top,
      right: styles.right,
      transform: styles.transform,
      opacity: styles.opacity,
      zIndex: styles.zIndex
    });
    
    // Check if menu items are visible
    const navItems = navbarCollapse.querySelectorAll('.nav-item');
    console.log(`Found ${navItems.length} navigation items`);
    
    // Check if nav items have correct styles
    if (navItems.length > 0) {
      const firstItemStyles = window.getComputedStyle(navItems[0]);
      console.log('First nav item styles:', {
        display: firstItemStyles.display,
        visibility: firstItemStyles.visibility,
        opacity: firstItemStyles.opacity
      });
    }
  }
  
  // Log on toggle click
  navbarToggler.addEventListener('click', function() {
    setTimeout(() => {
      const isOpen = navbarCollapse.classList.contains('show');
      console.log('Menu toggler clicked, menu is now:', isOpen ? 'OPEN' : 'CLOSED');
      logMenuStyles();
    }, 50);
  });
  
  // Monitor mobile menu state changes
  document.addEventListener('mobilemenuchange', function(event) {
    console.log('Menu state change detected:', event.detail);
  });
  
  // Monitor script errors
  window.addEventListener('error', function(event) {
    console.log('Script error detected:', event.message);
  });
  
  // Log initial state
  setTimeout(logMenuStyles, 500);
});
