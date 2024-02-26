import axios from 'axios'
import SimpleLightbox from "simplelightbox";
import Notiflix from 'notiflix';

//inicjaliacja zmiennych
let input = document.querySelector(".input")
let searchButton = document.querySelector(".searchButton")
let gallery = document.querySelector(".photo-card")
let scroll = document.querySelector(".scroll-down")
let newScrollPoint
let pageNumber = 1
let lightbox
let perPage = 40

//inicjalizacja Notyiflix
Notiflix.Notify.init({
  width: '200px',
  position: 'right-top',
  distance: '20px',
  opacity: 0.8,
  borderRadius: '5px',
  timeout: 5000,
  cssAnimation: true,
  cssAnimationDuration: 700,
  cssAnimationStyle: 'zoom', 
  warning: {
    background: 'rgb(214, 138, 23)',
    textColor: '#fff',
    childClassName: 'notiflix-notify-warning',
    fontAwesomeClassName: 'fas fa-exclamation-circle',
    fontAwesomeIconColor: 'rgba(0,0,0,0.2)',
    backOverlayColor: 'rgba(238,191,49,0.2)',
  },
  success: {
    background: 'rgb(157, 214, 23)',
    textColor: '#fff',
    childClassName: 'notiflix-notify-success',
    fontAwesomeClassName: 'fas fa-check-circle',
    fontAwesomeIconColor: 'rgba(0,0,0,0.2)',
    backOverlayColor: 'rgba(50,198,130,0.2)',
  },

});


//nasłuchiwanie przycisku wyszukiwania
searchButton.addEventListener('click', start)

//nasłuchiwanie przycisku przewijania strony
scroll.addEventListener('click', scrollPage)

gallery.addEventListener('click',openBigImage)

function start(event) {
    pageNumber=1
    event.preventDefault()
    gallery.innerHTML = '' 
    scroll.classList.remove("visually-hidden")
    let userInput = input.value;
    userInput.split(" ").join('+');
    getData(userInput)
}

function scrollPage(event) {
    event.preventDefault()
    let userInput = input.value;
    userInput.split(" ").join('+');
    getData(userInput);
}

//funkcja pobierania danych
function getData(data) {
    //wybór parametrów do pobrania danych
    let searchParams = new URLSearchParams({
    key: '42510468-83e1823d3ac9bdf29bf082bf9',
    q: data,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: perPage ,
    page: pageNumber,
    });

    //utworzenie liku do przesłania na serwer
    let url = `https://pixabay.com/api/?${searchParams}`

    //funkcja pobierania danych z serwera
    const photoDwonload = async () => {
        try {
            //wysłanie liku do serwera i czekiwanie na dopiwedz
            const response = await axios.get(url);
            return response;
        } catch (error) {
            Notiflix.Notify.warning('Download error')
            throw error; 
        }
    }   
    //po pobraniu danych z serwera
    photoDwonload()
        .then(response => {
            let totalHits = response.data.totalHits
            console.log(response.data)
        let photoData = response.data.hits;//wybranie odpowiednich danych z obiektu
            console.log(totalHits)
            console.log(photoData.length)
        //spawdzenie czy cos jest w obiekcie
        if (photoData.length !== 0 && pageNumber === 1) {
            //zwrócenie obrobionych danych
            Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`)
            return photoData
        }
        else if (photoData.length !== 0) {
            //zwrócenie obrobionych danych
            return photoData
        }  
        else if (totalHits < perPage){
            Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.")
            scroll.classList.add('visually-hidden')
            return photoData
        } 
        else if (photoData.length === 0)  {
            Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.")
        }    
       
    })
    .then((photoData) => {
        //wywołaeni funkcji tworzenia galerii
        createGallery(photoData)
        //utworzenie punkut przewijania
        let scrollPoint = `<div id='${pageNumber}'></div>`;
        gallery.insertAdjacentHTML("beforeend", scrollPoint);
        //ustawienie nowego numeru strony do pobrania zdjęc  
    })
    .then(() => {
        //jezeli juz istnieje galeria to pszeskocz do nowego punktu
        if (pageNumber !== 1) {
            newScrollPoint.scrollIntoView({ behavior: "smooth", block:"start" });
        }  
        //utwórz nowy punkt przewijania
        newScrollPoint = document.getElementById(`${pageNumber}`)
        //dodaj nowe id do linku a
        scroll.href = `#${pageNumber}`;
        pageNumber += 1   
    })
    .catch((error) => {
        console.error("Error in photoDownload:", error);
       }); 
}

//funkcja tworzenia galerii
function createGallery(photoData) { 
    const markup = photoData.map((list) => `
    <div class='img-div overflow-hidden'>
        <div class='link-div'>
            <a href='${list.largeImageURL}'>
                <img class='img-block drop-in-2' src="${list.webformatURL}" alt="${list.tags}" loading="lazy" />
            </a>
        </div>
        <div class="info drop-in">
            <p class="info-item">
                <b>Likes:${list.likes}</b>
            </p>
            <p class="info-item">
                <b>Views:${list.views}</b>
            </p>
            <p class="info-item">
                <b>Comments:${list.comments}</b>
            </p>
            <p class="info-item">
                <b>Downloads:${list.downloads}</b>
            </p>
        </div>
    </div>`).join('')
    gallery.insertAdjacentHTML("beforeend", markup);
    lightbox = new SimpleLightbox('.photo-card a', {
        nav: true,
        close: true,
        animationSlide: true,
        });
}

function openBigImage(event) {
        event.preventDefault()
        dataSource = event.target.parentNode.href
        lightbox.open(dataSource)
}



