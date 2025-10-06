/**
 * Horizontal Navigation Scroll Functionality
 * Implements smooth scrolling navigation with arrow controls and wheel support
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get navigation elements
  const scrollWrapper = document.querySelector('.nav-scroll-wrapper');
  const scrollContainer = document.querySelector('.nav-scroll-container');
  const leftArrow = document.querySelector('.nav-scroll-left');
  const rightArrow = document.querySelector('.nav-scroll-right');
  
  // Exit if elements don't exist (mobile view or missing elements)
  if (!scrollWrapper || !scrollContainer || !leftArrow || !rightArrow) {
    return;
  }
  
  // Configuration
  const SCROLL_AMOUNT = 200; // Pixels to scroll per arrow click
  const WHEEL_SCROLL_MULTIPLIER = 3; // Increase wheel sensitivity
  
  // Initialize scroll functionality
  init();
  
  function init() {
    setupArrowListeners();
    setupWheelScrolling();
    setupKeyboardNavigation();
    updateArrowStates();
    
    // Update arrow states on scroll
    scrollContainer.addEventListener('scroll', updateArrowStates);
    
    // Update on window resize
    window.addEventListener('resize', debounce(updateArrowStates, 100));
    
    console.log('Horizontal navigation scroll initialized');
  }
  
  function setupArrowListeners() {
    leftArrow.addEventListener('click', function(e) {
      e.preventDefault();
      scrollLeft();
    });
    
    rightArrow.addEventListener('click', function(e) {
      e.preventDefault();
      scrollRight();
    });
    
    // Add hover effects for better UX
    leftArrow.addEventListener('mouseenter', function() {
      if (!this.disabled) {
        this.style.transform = 'scale(1.1)';
      }
    });
    
    leftArrow.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
    
    rightArrow.addEventListener('mouseenter', function() {
      if (!this.disabled) {
        this.style.transform = 'scale(1.1)';
      }
    });
    
    rightArrow.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  }
  
  function setupWheelScrolling() {
    scrollContainer.addEventListener('wheel', function(e) {
      // Only handle horizontal scrolling when hovering over navigation
      e.preventDefault();
      
      const scrollAmount = e.deltaY * WHEEL_SCROLL_MULTIPLIER;
      
      // Smooth scroll horizontally
      scrollContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      
      // Update arrow states after scroll
      setTimeout(updateArrowStates, 100);
    }, { passive: false });
    
    // Add visual feedback when mouse is over scrollable area
    scrollContainer.addEventListener('mouseenter', function() {
      scrollWrapper.classList.add('scrollable');
    });
    
    scrollContainer.addEventListener('mouseleave', function() {
      scrollWrapper.classList.remove('scrollable');
    });
  }
  
  function setupKeyboardNavigation() {
    leftArrow.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollLeft();
      }
    });
    
    rightArrow.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollRight();
      }
    });
    
    // Navigate with arrow keys when focused on navigation
    scrollContainer.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollRight();
      }
    });
    
    // Make scroll container focusable for keyboard navigation
    scrollContainer.setAttribute('tabindex', '0');
    scrollContainer.setAttribute('role', 'navigation');
    scrollContainer.setAttribute('aria-label', 'Horizontal scrolling navigation');
  }
  
  function scrollLeft() {
    scrollContainer.scrollBy({
      left: -SCROLL_AMOUNT,
      behavior: 'smooth'
    });
    
    // Update arrow states after animation
    setTimeout(updateArrowStates, 300);
  }
  
  function scrollRight() {
    scrollContainer.scrollBy({
      left: SCROLL_AMOUNT,
      behavior: 'smooth'
    });
    
    // Update arrow states after animation
    setTimeout(updateArrowStates, 300);
  }
  
  function updateArrowStates() {
    const scrollLeft = scrollContainer.scrollLeft;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    
    // Update scroll state classes for fade effects
    if (scrollWidth > clientWidth) {
      scrollContainer.classList.add('has-scroll');
      if (scrollLeft > 0) {
        scrollContainer.classList.add('scrolled');
      } else {
        scrollContainer.classList.remove('scrolled');
      }
    } else {
      scrollContainer.classList.remove('has-scroll', 'scrolled');
    }
    
    // Update left arrow
    if (scrollLeft <= 0) {
      leftArrow.disabled = true;
      leftArrow.setAttribute('aria-disabled', 'true');
      leftArrow.style.opacity = '0.3';
    } else {
      leftArrow.disabled = false;
      leftArrow.setAttribute('aria-disabled', 'false');
      leftArrow.style.opacity = '1';
    }
    
    // Update right arrow
    if (scrollLeft >= maxScroll - 1) { // -1 for small rounding errors
      rightArrow.disabled = true;
      rightArrow.setAttribute('aria-disabled', 'true');
      rightArrow.style.opacity = '0.3';
    } else {
      rightArrow.disabled = false;
      rightArrow.setAttribute('aria-disabled', 'false');
      rightArrow.style.opacity = '1';
    }
    
    // Always show arrows if content overflows (they indicate scrollability)
    if (scrollWidth <= clientWidth) {
      scrollWrapper.classList.add('no-scroll');
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'none';
    } else {
      scrollWrapper.classList.remove('no-scroll');
      leftArrow.style.display = 'flex';
      rightArrow.style.display = 'flex';
    }
  }
  
  // Auto-scroll to active navigation item on page load
  function scrollToActiveItem() {
    const activeLink = scrollContainer.querySelector('.nav-link.active');
    
    if (activeLink) {
      // Calculate position to center the active item
      const activeRect = activeLink.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollLeft = scrollContainer.scrollLeft;
      
      const activeCenter = activeRect.left - containerRect.left + scrollLeft + (activeRect.width / 2);
      const containerCenter = scrollContainer.clientWidth / 2;
      const targetScrollLeft = activeCenter - containerCenter;
      
      // Smooth scroll to center the active item
      scrollContainer.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
      });
      
      // Update arrow states after scrolling
      setTimeout(updateArrowStates, 300);
    }
  }
  
  // Utility function for debouncing
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Touch/swipe support for mobile-like interaction on desktop
  let isPointerDown = false;
  let startX = 0;
  let scrollStartLeft = 0;
  
  scrollContainer.addEventListener('pointerdown', function(e) {
    isPointerDown = true;
    startX = e.clientX;
    scrollStartLeft = scrollContainer.scrollLeft;
    scrollContainer.style.cursor = 'grabbing';
    scrollContainer.style.userSelect = 'none';
  });
  
  scrollContainer.addEventListener('pointermove', function(e) {
    if (!isPointerDown) return;
    
    e.preventDefault();
    const deltaX = e.clientX - startX;
    scrollContainer.scrollLeft = scrollStartLeft - deltaX;
  });
  
  scrollContainer.addEventListener('pointerup', function() {
    isPointerDown = false;
    scrollContainer.style.cursor = 'grab';
    scrollContainer.style.userSelect = 'auto';
    updateArrowStates();
  });
  
  scrollContainer.addEventListener('pointerleave', function() {
    isPointerDown = false;
    scrollContainer.style.cursor = 'grab';
    scrollContainer.style.userSelect = 'auto';
  });
  
  // Initialize cursor style
  scrollContainer.style.cursor = 'grab';
  
  // Call scrollToActiveItem after a short delay to ensure page is fully loaded
  setTimeout(scrollToActiveItem, 500);
  
  // Export functions for external use if needed
  window.navScroll = {
    scrollLeft: scrollLeft,
    scrollRight: scrollRight,
    updateArrowStates: updateArrowStates,
    scrollToActiveItem: scrollToActiveItem
  };
});
