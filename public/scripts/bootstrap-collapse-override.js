/**
 * Bootstrap Collapse Override for Mobile Menu
 * This script prevents Bootstrap's default collapse behavior from interfering with our custom mobile menu
 */
document.addEventListener('DOMContentLoaded', function() {
  // Find the navbar toggler and collapse elements
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.getElementById('navbarNav');
  
  if (!navbarToggler || !navbarCollapse) return;
  
  // Prevent default Bootstrap behavior
  navbarToggler.removeAttribute('data-bs-toggle');
  navbarToggler.removeAttribute('data-bs-target');
  
  // Log to console for debugging
  console.log('Bootstrap collapse behavior overridden for custom mobile menu');
});
