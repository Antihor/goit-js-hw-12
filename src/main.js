import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formRef = document.querySelector('.search-form');
const containerRef = document.querySelector('.container');
const galleryRef = document.querySelector('.gallery');
const buttonRef = document.querySelector('.btn-LM');
const optionsSL = {
  captions: true,
  captionSelector: 'img',
  captionsData: 'alt',
  captionPosition: 'bottom',
  animation: 250,
};

let page = 1;
let per_page = 15;
let lightbox;

async function fetchImg() {
  const params = new URLSearchParams({
    page: page,
    per_page: per_page,
  });
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '42059071-0978dc0d7158b742eee7c30f5';
  const searchQuery = formRef.input.value;

  const response = await axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(
      searchQuery
    )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${per_page}`
  );
  return response.data;
}

function renderImg(data) {
  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a href="${largeImageURL}" class="gallery-link"><li class="gallery-item">
          <img class="gallery-image" src="${webformatURL}" alt="${tags}">
          <p>Likes: ${likes}</p>
          <p>Views: ${views}</p>
          <p>Comments: ${comments}</p>
          <p>Downloads: ${downloads}</p>
          </li></a>`;
      }
    )
    .join('');

  galleryRef.insertAdjacentHTML('beforeend', markup);
  lightbox = new SimpleLightbox('.gallery a', optionsSL);
  lightbox.on('show.simplelightbox');
  lightbox.refresh();
}

formRef.addEventListener('submit', async event => {
  event.preventDefault();
  loaderOn();
  galleryRef.innerHTML = '';

  try {
    const images = await fetchImg();
    renderImg(images);
    loaderOff();
    showButton();

    if (images.hits.length === 0) {
      iziToast.error({
        title: '',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });

      const { height: imageHeight } =
        galleryRef.firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: imageHeight * 2,
        behavior: 'smooth',
      });
    }
    if (galleryRef.children.length >= images.totalHits) {
      hideButton();
    } else {
      showButton();
    }
  } catch (error) {
    console.log(error);
    hideButton();
  }
  formRef.reset();
});

buttonRef.addEventListener('click', async () => {
  loaderOn();
  try {
    page += 1;
    const images = await fetchImg();
    renderImg(images);
    loaderOff();

    const { height: imageHeight } =
      galleryRef.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: imageHeight * 2,
      behavior: 'smooth',
    });

    if (galleryRef.children.length >= images.totalHits) {
      iziToast.warning({
        title: '',
        message:
          'We are sorry, but you have reached the end of search results.',
        position: 'bottomRight',
      });

      hideButton();
    }
  } catch (error) {
    console.log(error);
    loaderOff();
    hideButton();
  }
});

const showButton = () => {
  buttonRef.style.display = 'block';
};

const hideButton = () => {
  buttonRef.style.display = 'none';
};

const loaderOn = () => {
  const loader = document.createElement('span');
  loader.classList.add('loader');
  containerRef.append(loader);
};
const loaderOff = () => {
  const loader = document.querySelector('.loader');
  if (loader) {
    loader.remove();
  }
};
