import { Notify } from 'notiflix';
import { PixabayAPI } from './pixabay-app.js';
import { createMarkUp } from './createmarkup.js';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.js-searh-form'),
  searchButton: document.querySelector('.search-button'),
  list: document.querySelector('.gallery'),
  anchor: document.querySelector('.target-element'),
};

const { form, searchButton, list, input, anchor } = refs;

const observer = new IntersectionObserver(
  (entries, observer) => {
    if (entries[0].isIntersecting) {
      loadMoreData();
    }
  },
  {
    root: null,
    rootMargin: '300px',
    threshold: 1,
  }
);

const pixabayAPI = new PixabayAPI(40);

form.addEventListener('submit', handleSearch);
async function handleSearch(event) {
  event.preventDefault();
  pixabayAPI.page = 1;
  const searchQuery = input.value.trim();
  pixabayAPI.q = searchQuery;
  if (!searchQuery) {
    list.innerHTML = '';
    return Notify.failure('Sorry, your search query is empty. Please try again.');
  }

  try {
    const response = await pixabayAPI.getPhotos();

    if (response.data.total) {
      Notify.success(`We found ${Math.ceil(response.data.total / pixabayAPI.perPage)} pages of results.`);
    } else {
      Notify.failure('Sorry! Your query is empty! Try again, please.');
    }

    list.innerHTML = createMarkUp(response.data.hits);

    if (response.data.hits.length === 0) {
      list.innerHTML = '';
      observer.unobserve(anchor);
    }

    if (response.data.total > pixabayAPI.perPage) {
      observer.observe(anchor);
    }
  } catch (error) {
    console.log(error);
  }
}

async function loadMoreData() {
  try {
    pixabayAPI.page += 1;
    if (pixabayAPI.page > 1) {
      const response = await pixabayAPI.getPhotos();
      list.insertAdjacentHTML('beforeend', createMarkUp(response.data.hits));

      if (Math.ceil(response.data.total / pixabayAPI.perPage) === pixabayAPI.page) {
        observer.unobserve(anchor);
        return Notify.success('End of search results.');
      }

      if (response.data.hits.length === 0) {
        observer.unobserve(anchor);
        return Notify.failure('No more search results to load.');
      }
    }
  } catch (error) {
    console.log(error);
  }
}