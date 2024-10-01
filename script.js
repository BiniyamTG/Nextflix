const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query=';
const GENRE_API = 'https://api.themoviedb.org/3/discover/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&with_genres=';
const TRAILER_API = 'https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key=3fd2be6f0c70a2a598f084ddfb75487c&language=en-US';

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const genreButtons = document.querySelectorAll('.genre-btn');
const loadMoreBtn = document.getElementById('load-more');

let currentPage = 1;
let currentGenre = '';
let currentSearchTerm = '';

// Get initial movies
getMovies(API_URL + currentPage);

// Event listener for form submission (search)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;
    currentPage = 1; // Reset page when searching

    if (searchTerm && searchTerm !== '') {
        currentSearchTerm = searchTerm;
        currentGenre = ''; // Reset genre
        main.innerHTML = ''; // Clear previous results
        getMovies(SEARCH_API + searchTerm + '&page=' + currentPage);
        search.value = '';
    } else {
        window.location.reload();
    }
});

// Event listener for genre buttons
genreButtons.forEach(button => {
    button.addEventListener('click', () => {
        const genreId = button.getAttribute('data-genre');
        currentPage = 1; // Reset page when changing genre
        currentGenre = genreId;
        currentSearchTerm = ''; // Reset search term

        // Highlight the active genre button
        genreButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Clear previous results and fetch movies by the selected genre
        main.innerHTML = '';
        getMovies(`${GENRE_API}${genreId}&page=${currentPage}`);
    });
});

// Event listener for Load More button
loadMoreBtn.addEventListener('click', () => {
    currentPage++; // Increment page
    if (currentSearchTerm) {
        getMovies(SEARCH_API + currentSearchTerm + '&page=' + currentPage);
    } else if (currentGenre) {
        getMovies(`${GENRE_API}${currentGenre}&page=${currentPage}`);
    } else {
        getMovies(API_URL + currentPage);
    }
});

async function getMovies(url) {
    const res = await fetch(url);
    const data = await res.json();

    showMovies(data.results);
}

async function getTrailer(movieId) {
    const res = await fetch(TRAILER_API.replace('{movie_id}', movieId));
    const data = await res.json();
    const trailer = data.results.find(video => video.type === 'Trailer');

    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '#';
}

function showMovies(movies) {
    movies.forEach(async (movie) => {
        const { title, poster_path, vote_average, overview, id } = movie;
        const trailerURL = await getTrailer(id);

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');

        movieEl.innerHTML = `
            <img src="${IMG_PATH + poster_path}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${vote_average}</span>
            </div>
            <div class="overview">
                <h3>Overview</h3>
                ${overview}
                <a href="${trailerURL}" class="trailer-btn" target="_blank">Watch Trailer</a>
            </div>
        `;
        main.appendChild(movieEl);
    });
}

function getClassByRate(vote) {
    if (vote >= 8) {
        return 'green';
    } else if (vote >= 5) {
        return 'orange';
    } else {
        return 'red';
    }
}

