const apiUrl = `/api/news/headlines?category=general&limit=20`;


async function fetchNews(apiUrl) {
  try{
    const res = await fetch(apiUrl)
    if(!res.ok){
      throw new Error(`HTTP error! Status: ${res.status}`)
    }
    const data = await res.json();
    if(data.articles && data.articles.length > 0){
      displayNews(data.articles);
    }else{
      console.log("No article found")
    }
  }catch(err){
    console.log("error fetching news: ", err);
  }
}

function displayNews(articles){
  const post = document.getElementById("posts");

  post.innerHTML = '';

  articles.forEach(articles => {
    const postCard = document.createElement("div");

    postCard.className = "post-card";


    postCard.innerHTML = `
    <img src="${articles.urlToImage || 'https://via.placeholder.com/400'}" class="post-thumbnail">    
    <h2 class="posts_container-title">${articles.title}</h2>
    <p class="short">${articles.description || "No description available"}</p>
    <a href="${articles.url}" target="_blank" class="post-title">Read more</a>`;

    post.appendChild(newsCard)
  });
}

function searchNews(query) {
  query.preventDefault(); 
  const search = document.getElementById("search").value;
  const searchUrl = `/api/news/search?q=${encodeURIComponent(search)}&limit=20`; 

  fetchNews(searchUrl); 
}
const searchInput = document.getElementById("search"); 

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { 
    searchNews(e); 
  }
});

fetchNews(apiUrl)