console.log('Search script loaded!');

const apiUrl = `/api/news/headlines?category=general&limit=20`;
let postsContainer = document.getElementById("posts");
const searchInput = document.getElementById("search");
const searchButton = document.querySelector('.search-button');

// Create posts container if it doesn't exist
if (!postsContainer) {
  postsContainer = document.createElement('div');
  postsContainer.id = 'posts';
  document.querySelector('main').prepend(postsContainer);
}

console.log('Elements:', { postsContainer, searchInput, searchButton });

// Show loading state
function showLoading() {
  postsContainer.innerHTML = '<div class="loading">Loading news...</div>';
}

// Show error message
function showError(message) {
  postsContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

// Fetch news from API
async function fetchNews(url) {
  showLoading();
  console.log('Fetching from URL:', url);
  
  try {
    const res = await fetch(url);
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('API Response:', data);
    
    // Check if we have articles in the response
    const articles = data.articles || [];
    
    // Hide the regular articles container when showing search results
    const articlesContainer = document.getElementById('articles-container');
    const searchResults = document.getElementById('posts');
    
    if (url.includes('/search')) {
      // This is a search request
      if (articlesContainer) articlesContainer.style.display = 'none';
      if (searchResults) searchResults.style.display = 'block';
    } else {
      // This is a regular news load
      if (articlesContainer) articlesContainer.style.display = 'block';
      if (searchResults) searchResults.style.display = 'none';
    }
    
    if (articles.length > 0) {
      displayNews(articles);
    } else {
      showError("No articles found. Try a different search term.");
    }
  } catch (err) {
    console.error("Error fetching news:", err);
    showError("Failed to load news. Please try again later.");
  }
}

// Display news articles
function displayNews(articles) {
  postsContainer.innerHTML = '';
  
  if (!articles || articles.length === 0) {
    showError("No articles found.");
    return;
  }

  articles.forEach(article => {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    
    // Format date if available
    const publishedDate = article.publishedAt || article.published_date;
    const formattedDate = publishedDate 
      ? new Date(publishedDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : '';

    // Determine the article URL
    let articleUrl = article.url || '#';
    if (!articleUrl.startsWith('http') && article.slug) {
      articleUrl = `/articles/${article.slug}`;
    }

    // Determine the image URL
    let imageUrl = article.urlToImage || article.image_url || article.featured_img || '/assets/logo/InsideLimpopoLogoTransparent.png';
    
    // Create the article HTML
    postCard.innerHTML = `
      <div class="post-image-container">
        <img src="${imageUrl}" 
             class="post-thumbnail" 
             alt="${article.title || 'News image'}" 
             onerror="this.src='/assets/logo/InsideLimpopoLogoTransparent.png'">
        ${article.source?.name ? `<span class="source-tag">${article.source.name}</span>` : ''}
      </div>
      <div class="post-content">
        ${formattedDate ? `<div class="post-date">${formattedDate}</div>` : ''}
        <h2 class="post-title">${article.title || 'No title available'}</h2>
        <p class="post-description">${article.description || article.content?.substring(0, 200) + '...' || 'No description available'}</p>
        <a href="${articleUrl}" target="_blank" class="read-more">
          Read more <i class="fas fa-arrow-right"></i>
        </a>
      </div>`;

    postsContainer.appendChild(postCard);
  });
}

// Handle search
function handleSearch(e) {
  if (e) e.preventDefault();
  
  const searchTerm = searchInput.value.trim();
  console.log('Searching for:', searchTerm);
  
  if (searchTerm.length < 2) {
    showError("Please enter at least 2 characters to search");
    return;
  }
  
  const searchUrl = `/api/news/search?q=${encodeURIComponent(searchTerm)}&limit=20`;
  console.log('Search URL:', searchUrl);
  
  fetchNews(searchUrl);
  
  // Update URL without page reload
  const newUrl = new URL(window.location);
  newUrl.searchParams.set('q', searchTerm);
  window.history.pushState({}, '', newUrl);
}

// Initialize search functionality
function initSearch() {
  console.log('Initializing search...');
  
  // Check if search elements exist on the page
  if (!searchInput || !searchButton) {
    console.log('Search elements not found on this page');
    return;
  }
  
  // Handle search on button click
  console.log('Adding click event to search button');
  searchButton.addEventListener('click', function(e) {
    console.log('Search button clicked');
    e.preventDefault();
    handleSearch(e);
  });
  
  // Handle search on Enter key
  console.log('Adding keydown event to search input');
  searchInput.addEventListener('keydown', (e) => {
    console.log('Key pressed in search input:', e.key);
    if (e.key === 'Enter') {
      console.log('Enter key pressed');
      e.preventDefault();
      handleSearch(e);
    }
  });
  
  // Check for search query in URL on page load
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q');
  
  if (searchQuery) {
    console.log('Found search query in URL:', searchQuery);
    searchInput.value = searchQuery;
    handleSearch();
  } else {
    console.log('No search query in URL, loading default news');
    // Load default news if no search query
    fetchNews(apiUrl);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initSearch);