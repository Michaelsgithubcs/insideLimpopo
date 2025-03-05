const wrappper=document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink= document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');


registerLink.addEventListener('click', ()=> {
    wrappper.classList.add('active')
});

registerLink.addEventListener('click', () => {
    wrappper.classList.add('active')
});

loginLink.addEventListener('click', () => {
    wrappper.classList.remove('active')
});

btnPopup.addEventListener('click', () => {
    wrappper.classList.add('active-popup')
});

iconClose.addEventListener('click', () => {
    wrappper.classList.remove('active-popup')
});

iconClose.addEventListener('click', () => {
    wrappper.classList.remove('active-popup')
});
