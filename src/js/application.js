import { Notify } from 'notiflix';
import { PixabayAPI } from './pixabay-application.js';
import { createMarkup } from './createmarkup.js';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.js-search-form'),
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
    return Notify.failure('Apologies, your search query is empty. Please try again.');
  }

  try {
    const response = await pixabayAPI.getPhotos();
    if (response.data.total) {
      Notify.success(`We discovered ${response.data.total} images.`);
    } else {
      Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    }
    list.innerHTML = createMarkup(response.data.hits);

    if (response.data.hits.length === 0 || pixabayAPI.page * pixabayAPI.perPage >= response.data.total) {
      list.innerHTML = '';
      observer.unobserve(anchor);
      Notify.success('End of search results.');
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
    const response = await pixabayAPI.getPhotos();
    list.insertAdjacentHTML('beforeend', createMarkup(response.data.hits));

    if (response.data.hits.length === 0 || pixabayAPI.page * pixabayAPI.perPage >= response.data.total) {
      observer.unobserve(anchor);
      Notify.success('End of search results.');
    }
  } catch (error) {
    console.log(error);
  }
}
