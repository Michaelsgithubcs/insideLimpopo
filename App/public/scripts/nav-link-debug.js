/**
 * This script adds debugging for nav links and ensures they are properly clickable
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Nav link debug helper loaded');
  
  // Target all navigation links in the mobile menu
  const navLinks = document.querySelectorAll('#navbarNav .nav-link');
  
  if (navLinks.length === 0) {
    console.error('No navigation links found to debug');
    return;
  }
  
  console.log(`Found ${navLinks.length} navigation links`);
  
  // Add debug information to each link
  navLinks.forEach((link, index) => {
    // Log link info
    console.log(`Nav link ${index + 1}:`, {
      href: link.getAttribute('href'),
      text: link.textContent.trim()
    });
    
    // Add click listener for debugging
    link.addEventListener('click', function(e) {
      // Don't prevent default - let the link work normally
      console.log(`Link clicked: ${this.textContent.trim()} -> ${this.getAttribute('href')}`);
      
      // Manually close the mobile menu
      if (window.mobileMenu && typeof window.mobileMenu.close === 'function') {
        window.mobileMenu.close();
      }
    });
    
    // Add extra styling to make sure it's clickable
    link.style.position = 'relative';
    link.style.zIndex = '1010';
    link.style.cursor = 'pointer';
  });
});
