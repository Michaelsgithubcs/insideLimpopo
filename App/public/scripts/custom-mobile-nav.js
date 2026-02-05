// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'mobile-menu-overlay';
  document.body.appendChild(overlay);
  
  // Add close button to navbar collapse
  const navbarCollapse = document.getElementById('navbarNav');
  
  if (!navbarCollapse) {
    console.error('Mobile menu: #navbarNav element not found');
    return;
  }
  
  const closeButton = document.createElement('button');
  closeButton.className = 'mobile-menu-close';
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Close menu');
  navbarCollapse.prepend(closeButton);
  
  // Toggle functionality
  function toggleMobileMenu() {
    navbarCollapse.classList.toggle('show');
    overlay.classList.toggle('active');
    
    const isOpen = navbarCollapse.classList.contains('show');
    
    // Handle body scroll
    if (isOpen) {
      document.documentElement.classList.add('menu-open');
      document.body.classList.add('menu-open');
    } else {
      document.documentElement.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
    }
    
    // Remove Bootstrap's default collapse class
    navbarCollapse.classList.remove('collapsing');
    
    // Toggle aria-expanded attribute for accessibility
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
      navbarToggler.setAttribute('aria-expanded', isOpen);
    }
    
    // iOS scroll fix
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      if (isOpen) {
        document.body.style.position = 'fixed';
        document.body.style.top = `-${window.scrollY}px`;
      } else {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }
  
  // Toggle menu when clicking the hamburger button
  const navbarToggler = document.querySelector('.navbar-toggler');
  navbarToggler.addEventListener('click', function(event) {
    event.preventDefault();
    toggleMobileMenu();
  });
  
  // Close menu when clicking the close button
  closeButton.addEventListener('click', toggleMobileMenu);
  
  // Close menu when clicking outside (on the overlay)
  overlay.addEventListener('click', toggleMobileMenu);
  
  // Close menu when pressing escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && navbarCollapse.classList.contains('show')) {
      toggleMobileMenu();
    }
  });
  
  // Close menu when window resizes to desktop size
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 992 && navbarCollapse.classList.contains('show')) {
      toggleMobileMenu();
    }
  });
  
  // Fix Bootstrap's default behavior for dropdowns in mobile menu
  document.querySelectorAll('.navbar-nav .dropdown').forEach(function(dropdown) {
    const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener('click', function(event) {
        if (window.innerWidth < 992) {
          event.preventDefault();
          event.stopPropagation();
          dropdownMenu.classList.toggle('show');
        }
      });
    }
  });
});
