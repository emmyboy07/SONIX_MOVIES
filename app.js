// Wait for the splash screen to finish animation before displaying the rest of the page
window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splash-screen');
    const logoText = document.querySelector('#logo-container h1');
    const spinner = document.getElementById('loading-spinner');

    // Animate text and then show spinner
    logoText.classList.add('animate-finished'); // Trigger the fade-in text animation
    setTimeout(() => {
        spinner.style.display = 'inline-block'; // Show the spinner after the text animation
    }, 1500); // Wait until the text animation finishes

    // After a total of 3 seconds, remove splash screen
    setTimeout(() => {
        splashScreen.style.display = 'none';
        document.body.classList.add('loaded'); // Re-enable scrolling
    }, 3000); // Keep splash screen for 3 seconds
});

const tmdbApiKey = '1e2d76e7c45818ed61645cb647981e5c';  // TMDb API Key

// Elements
const movieContainer = document.getElementById('movie-container');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search');
const genreSelect = document.getElementById('genre');
const modal = document.getElementById('modal');
const trailer = document.getElementById('trailer');
const closeModal = document.getElementsByClassName('close')[0];
const backButton = document.getElementById('back-button');
const darkModeToggle = document.getElementById('dark-mode-toggle'); // Dark mode toggle button
const errorMessageContainer = document.getElementById('error-message'); // Error message container

let currentPage = 1;
let totalPages = 1;

// Show Loading Spinner
function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = 'inline-block'; // Show the spinner
}

// Hide Loading Spinner
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = 'none'; // Hide the spinner
}

// Display Error Message
function displayErrorMessage(message) {
    errorMessageContainer.textContent = message;
    errorMessageContainer.style.display = 'block';
}

// Hide Error Message
function hideErrorMessage() {
    errorMessageContainer.style.display = 'none';
}

// Fetch Movies from TMDb API
async function fetchMovies(query = '', genre = '') {
    let apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${currentPage}`;

    if (query) {
        apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&language=en-US&query=${query}&page=${currentPage}`;
    }
    if (genre) {
        apiUrl += `&with_genres=${genre}`;
    }

    try {
        showLoadingSpinner();
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch movies. Please try again later.');
        const data = await response.json();
        if (data.results.length === 0) {
            displayErrorMessage('No movies found for your search.');
        } else {
            hideErrorMessage();
            displayMovies(data.results);
        }
        totalPages = data.total_pages;
    } catch (error) {
        displayErrorMessage(error.message || 'An error occurred while fetching the data.');
    } finally {
        hideLoadingSpinner();
    }
}

// Fetch Movie Details from TMDb API
async function fetchMovieDetails(movieId) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}`);
    const data = await response.json();
    return data;
}

// Fetch Trailer from TMDb API
async function fetchTrailer(movieId) {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${tmdbApiKey}`);
    const data = await response.json();
    const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : null;
}

// Display Movies in the UI
function displayMovies(movies) {
    movies.forEach(async movie => {
        if (!movie.poster_path) return;  // Skip movies without posters

        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        const movieImage = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        const movieTitle = movie.title || movie.name;

        movieCard.innerHTML = `
            <img src="${movieImage}" alt="${movieTitle}">
            <h3>${movieTitle}</h3>
        `;

        // Add click event to show movie details and trailer
        movieCard.addEventListener('click', async () => {
            const trailerUrl = await fetchTrailer(movie.id);
            const movieDetails = await fetchMovieDetails(movie.id);

            // Set movie details in the modal
            document.getElementById('movie-title').innerText = movieDetails.title;
            document.getElementById('movie-description').innerText = movieDetails.overview;
            document.getElementById('release-date').innerText = movieDetails.release_date;
            document.getElementById('rating').innerText = movieDetails.vote_average;

            // Set trailer URL in iframe or show message if not available
            if (trailerUrl) {
                trailer.src = trailerUrl;
            } else {
                trailer.src = ''; // Clear the trailer if not available
                document.getElementById('movie-description').innerText += "\n\nTrailer not available.";
            }

            modal.style.display = 'flex';
        });

        movieContainer.appendChild(movieCard);
    });
}

// Handle Search Button Click
searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    const genre = genreSelect.value;
    currentPage = 1; // Reset to first page
    movieContainer.innerHTML = ''; // Clear previous movies
    fetchMovies(query, genre);
});

// Handle Genre Change
genreSelect.addEventListener('change', () => {
    const query = searchInput.value;
    const genre = genreSelect.value;
    currentPage = 1; // Reset to first page
    movieContainer.innerHTML = ''; // Clear previous movies
    fetchMovies(query, genre);  // Fetch movies with the selected genre
});

// Close Modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    trailer.src = ''; // Clear the trailer when closing the modal
});

// Back Button Functionality
backButton.addEventListener('click', () => {
    modal.style.display = 'none';
    trailer.src = ''; // Clear the trailer when going back
});

// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode'); // Toggle dark mode on body
});

// Lazy Scroll (Infinite Scroll)
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && currentPage < totalPages) {
        currentPage++; // Increment page number for next set of movies
        const query = searchInput.value;
        const genre = genreSelect.value;
        fetchMovies(query, genre);
    }
});

// Initial Load of Movies
fetchMovies();
