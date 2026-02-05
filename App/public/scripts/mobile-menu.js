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
  
  // Create close button with ID - only in mobile view
  let closeButton = document.getElementById('mobile-menu-close');
  
  // Only create the close button if it doesn't exist and we're in mobile view
  if (!closeButton && window.innerWidth < 992) {
    closeButton = document.createElement('button');
    closeButton.id = 'mobile-menu-close';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close menu');
    closeButton.style.display = 'none'; // Initially hidden
    navbarNav.prepend(closeButton);
  } else if (closeButton && window.innerWidth >= 992) {
    // Remove the close button if we're in desktop view
    closeButton.style.display = 'none';
  }
  
  // Remove any Bootstrap data attributes
  navbarToggler.removeAttribute('data-bs-toggle');
  navbarToggler.removeAttribute('data-bs-target');
  
  // Fix navbar structure and classes
  let navbarNavItems = navbarNav.querySelector('.navbar-nav');
  if (navbarNavItems) {
    console.log('Found navbar items:', navbarNavItems.children.length);
    
    // Make sure items are visible
    navbarNavItems.style.display = 'flex';
    navbarNavItems.style.flexDirection = 'column';
    navbarNavItems.style.width = '100%';
    
    // Force visibility of all items
    Array.from(navbarNavItems.children).forEach((item, i) => {
      item.style.display = 'block';
      item.style.visibility = 'visible';
      item.style.opacity = '1';
      console.log(`Nav item ${i+1}:`, item.textContent.trim());
    });
  } else {
    console.error('Navbar items not found! Creating a fallback...');
    
    // Create a backup navbar-nav if it doesn't exist
    navbarNavItems = document.createElement('ul');
    navbarNavItems.className = 'navbar-nav';
    navbarNavItems.style.display = 'flex';
    navbarNavItems.style.flexDirection = 'column';
    navbarNavItems.style.width = '100%';
    
    // Try to find navigation links elsewhere
    const allNavLinks = document.querySelectorAll('.nav-link');
    if (allNavLinks.length > 0) {
      console.log('Found nav links outside navbar, moving them...');
      
      // Create nav items from the links
      allNavLinks.forEach((link, i) => {
        // Skip if this is inside the mobile menu already
        if (link.closest('#navbarNav')) return;
        
        const li = document.createElement('li');
        li.className = 'nav-item';
        const newLink = link.cloneNode(true);
        li.appendChild(newLink);
        navbarNavItems.appendChild(li);
        console.log(`Created nav item ${i+1} from:`, link.textContent.trim());
      });
      
      // Add to navbar
      navbarNav.appendChild(navbarNavItems);
    }
  }
  
  // Track menu state
  let menuOpen = false;
  
  // Function to open the menu
  function openMenu() {
    // Make sure all navbar elements are visible first
    const navbarNavItems = navbarNav.querySelector('.navbar-nav');
    if (navbarNavItems) {
      navbarNavItems.style.display = 'flex';
      navbarNavItems.style.visibility = 'visible';
      
      // Log all nav items to ensure they're there
      const items = navbarNavItems.querySelectorAll('.nav-item');
      console.log(`Found ${items.length} navigation items before opening menu`);
    }
    
    // Add classes to show menu
    navbarNav.classList.add('mobile-open');
    navbarNav.classList.add('show'); // Add Bootstrap show class too
    overlay.style.display = 'block';
    
    // Force reflow to trigger transition
    void overlay.offsetHeight;
    
    overlay.classList.add('active');
    menuOpen = true;
    
    // Prevent body scrolling but allow menu to scroll
    document.body.style.overflow = 'hidden';
    navbarNav.style.overflowY = 'scroll';
    
    // Update aria attributes
    navbarToggler.setAttribute('aria-expanded', 'true');
    
    // Notify other scripts
    document.dispatchEvent(new CustomEvent('mobilemenuchange', {
      detail: { isOpen: true }
    }));
    
    console.log('Menu opened with visible items:', navbarNavItems ? 'YES' : 'NO');
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
  navbarToggler.addEventListener('touchend', function(e) {
    e.preventDefault();
    toggleMenu();
  });
  
  if (closeButton) {
    closeButton.addEventListener('click', closeMenu);
    closeButton.addEventListener('touchend', function(e) {
      e.preventDefault();
      closeMenu();
    });
  }
  
  overlay.addEventListener('click', closeMenu);
  overlay.addEventListener('touchend', function(e) {
    e.preventDefault();
    closeMenu();
  });
  
  // Make sure nav links work by adding event listeners to them
  const navLinks = navbarNav.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    // Remove any existing event listeners
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
    
    // Make sure the link works
    console.log('Added navigation link:', newLink.href);
    
    // Prevent scroll event propagation on nav links to allow proper scrolling
    newLink.addEventListener('touchstart', function(e) {
      e.stopPropagation();
    });
    
    newLink.addEventListener('touchmove', function(e) {
      e.stopPropagation();
    });
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
