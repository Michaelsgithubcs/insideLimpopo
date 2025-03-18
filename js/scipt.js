const container = document.getElementById('contactsContainer');
const sendaBtn = document.getElementById('senda');
const subscriberBtn = document.getElementById('subscriber');

var dublicate = document.querySelector('ticker-content').cloneNode(true);
document.querySelector('breaking-news-ticker').appendChild(dublicate);

sendaBtn.addEventListener('click', () => {
    container.classList.add("active");
});

subscriberBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}

function openPage(){
    var search = document.getElementById('searchNews').value;

    if(search == 'sports' || search == 'sport'){
        window.open('/sports.html');
    }else if(search == 'vacancy' || search == 'vacancies'){
        window.open('/vacancies.html');
    }else if(search == 'podcast' || search == "podcasts"){
        window.open('/podcast.html');
    }else if(search == 'opinion' || search == 'opinions'){
        window.open('/opinion.html');
    }else if(search == 'event' || search == 'events'){
        window.open('/events.html');
    }else{
        console.log('Search not found!');
    }
}