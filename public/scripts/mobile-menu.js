/**
 * Simple Mobile Menu Implementation
 * A clean implementation that avoids Bootstrap's collapse behavior
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Simple mobile menu loaded');
  
  // Get main elements
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarNav = document.getElementById('navbarNav');
  
  // Check if elements exist
  if (!navbarToggler || !navbarNav) {
    console.error('Mobile menu: Required elements not found');
    return;
  }
  
  // Create overlay with ID for easier targeting
  const overlay = document.createElement('div');
  overlay.id = 'mobile-menu-overlay';
  document.body.appendChild(overlay);
  
  // Create close button with ID
  const closeButton = document.createElement('button');
  closeButton.id = 'mobile-menu-close';
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Close menu');
  navbarNav.prepend(closeButton);
  
  // Remove any Bootstrap data attributes
  navbarToggler.removeAttribute('data-bs-toggle');
  navbarToggler.removeAttribute('data-bs-target');
  
  // Remove Bootstrap classes that might interfere
  navbarNav.classList.remove('collapse', 'collapsing');
  
  // Track menu state
  let menuOpen = false;
  
  // Function to open the menu
  function openMenu() {
    navbarNav.classList.add('mobile-open');
    overlay.style.display = 'block';
    
    // Force reflow to trigger transition
    void overlay.offsetHeight;
    
    overlay.classList.add('active');
    menuOpen = true;
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Update aria attributes
    navbarToggler.setAttribute('aria-expanded', 'true');
    
    // Notify other scripts
    document.dispatchEvent(new CustomEvent('mobilemenuchange', {
      detail: { isOpen: true }
    }));
    
    console.log('Menu opened');
  }
  
  // Function to close the menu
  function closeMenu() {
    navbarNav.classList.remove('mobile-open');
    overlay.classList.remove('active');
    
    // Hide overlay after transition
    setTimeout(() => {
      if (!navbarNav.classList.contains('mobile-open')) {
        overlay.style.display = 'none';
      }
    }, 300);
    
    menuOpen = false;
    
    // Re-enable body scrolling
    document.body.style.overflow = '';
    
    // Update aria attributes
    navbarToggler.setAttribute('aria-expanded', 'false');
    
    // Notify other scripts
    document.dispatchEvent(new CustomEvent('mobilemenuchange', {
      detail: { isOpen: false }
    }));
    
    console.log('Menu closed');
  }
  
  // Toggle menu function
  function toggleMenu(event) {
    if (event) event.preventDefault();
    console.log('Menu toggle clicked');
    
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }
  
  // Event listeners
  navbarToggler.addEventListener('click', toggleMenu);
  closeButton.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  
  // Make sure nav links work by adding event listeners to them
  const navLinks = navbarNav.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    // Remove any existing event listeners
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
    
    // Make sure the link works
    console.log('Added navigation link:', newLink.href);
  });
  
  // Close on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
    }
  });
  
  // Close on resize to desktop
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 992 && menuOpen) {
      closeMenu();
    }
  });
  
  // Expose menu API for other scripts
  window.mobileMenu = {
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    isOpen: () => menuOpen
  };
  
  // Handle breaking news ticker interaction
  document.addEventListener('tickerPause', function() {
    console.log('Ticker paused due to menu interaction');
  });
  
  document.addEventListener('tickerResume', function() {
    console.log('Ticker resumed after menu closed');
  });
  
  // Log initial state
  console.log('Mobile menu initialized');
});
