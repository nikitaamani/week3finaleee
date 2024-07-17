
const BASE_URL = "https://my-json-server.typicode.com/nikitaamani/week-3-final/films";
let movies = []; // Global array to store fetched movies

document.addEventListener("DOMContentLoaded", () => {
  fetchMovies();

  // Search movies form
  const form = document.querySelector("#search-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent form submission
    const searchTerm = document
      .querySelector("#search")
      .value.trim()
      .toLowerCase();
    fetchMovies(searchTerm);
  });

  // Add movie form
  const addMovieForm = document.querySelector("#add-movie-form");
  addMovieForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent form submission
    const formData = new FormData(addMovieForm);
    const movieData = Object.fromEntries(formData.entries());
    addMovie(movieData);
  });

  // Event delegation for Buy Movie buttons
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("buy-movie")) {
      const movieId = e.target.closest(".card").dataset.movieId;
      buyTicket(movieId);
    }
  });
});

function fetchMovies(searchTerm = "") {
  fetch(BASE_URL)
    .then((response) => response.json())
    .then((data) => {
      movies = data; // Store fetched movies in global array
      renderMovies(searchTerm);
    })
    .catch((error) => console.error("Error fetching movies:", error));
}

function renderMovies(searchTerm) {
  const moviesContainer = document.getElementById("movies");
  moviesContainer.innerHTML = ""; // Clear previous content

  movies.forEach((movie) => {
    if (!searchTerm || movie.title.toLowerCase().includes(searchTerm)) {
      renderMovieCard(movie, moviesContainer);
    }
  });
}
function renderMovieCard(movie, container) {
  const existingCard = container.querySelector(`[data-movie-id="${movie.id}"]`);

  const card = document.createElement("div");
  card.classList.add("card", "col-md-4");
  card.setAttribute("data-movie-id", movie.id);

  const image = document.createElement("img");
  image.classList.add("card-img-top");
  image.src = movie.poster;
  image.alt = movie.title;

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const title = document.createElement("h5");
  title.classList.add("card-title");
  title.textContent = movie.title;

  const description = document.createElement("p");
  description.classList.add("card-text");
  description.textContent = movie.description;

  const seats = document.createElement("p");
  seats.classList.add("card-text", "seats");
  seats.textContent = `Seats available: ${movie.capacity - movie.tickets_sold}`;

  const button = document.createElement("button");
  button.classList.add("btn", "btn-primary", "buy-movie");
  button.textContent =
    movie.tickets_sold >= movie.capacity ? "Sold Out" : "Buy Ticket";
  button.dataset.movieId = movie.id;
  button.disabled = movie.tickets_sold >= movie.capacity;

  cardBody.append(title, description, seats, button);
  card.append(image, cardBody);

  if (existingCard) {
    container.replaceChild(card, existingCard);
  } else {
    container.appendChild(card);
  }
}

function buyTicket(movieId) {
  console.log("Attempting to buy ticket for movie ID:", movieId);

  const movie = movies.find((movie) => movie.id == movieId);

  if (!movie) {
    console.error("Movie not found.");
    return;
  }

  if (movie.tickets_sold < movie.capacity) {
    const updatedMovie = { ...movie, tickets_sold: movie.tickets_sold + 1 };

    // Update UI immediately
    updateMovieUI(updatedMovie);

    // Then update server
    updateMovie(updatedMovie)
      .then(() => {
        console.log("Movie updated successfully on server");
      })
      .catch((error) => {
        console.error("Failed to update movie on server:", error);
        alert(
          "Server update failed, but ticket purchase is reflected locally."
        );
        // If you want to revert the UI change on server failure, uncomment the next line
        // updateMovieUI(movie);
      });
  } else {
    alert("Sorry, this movie is sold out.");
  }
}
function updateMovieUI(updatedMovie) {
  // Update local data
  movies = movies.map((m) => (m.id == updatedMovie.id ? updatedMovie : m));

  // Update UI for this specific movie
  const movieCard = document.querySelector(
    `[data-movie-id="${updatedMovie.id}"]`
  );
  if (movieCard) {
    const seatsElement = movieCard.querySelector(".seats");
    const buyButton = movieCard.querySelector(".buy-movie");

    seatsElement.textContent = `Seats available: ${
      updatedMovie.capacity - updatedMovie.tickets_sold
    }`;

    if (updatedMovie.tickets_sold >= updatedMovie.capacity) {
      buyButton.textContent = "Sold Out";
      buyButton.disabled = true;
    }
  }
}

function renderMovieCard(movie, container) {
  const existingCard = container.querySelector(`[data-movie-id="${movie.id}"]`);

  const card = document.createElement("div");
  card.classList.add("card", "col-md-4");
  card.setAttribute("data-movie-id", movie.id);

  const image = document.createElement("img");
  image.classList.add("card-img-top");
  image.src = movie.poster;
  image.alt = movie.title;

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const title = document.createElement("h5");
  title.classList.add("card-title");
  title.textContent = movie.title;

  const description = document.createElement("p");
  description.classList.add("card-text");
  description.textContent = movie.description;

  const seats = document.createElement("p");
  seats.classList.add("card-text", "seats");
  seats.textContent = `Seats available: ${movie.capacity - movie.tickets_sold}`;

  const button = document.createElement("button");
  button.classList.add("btn", "btn-primary", "buy-movie");
  button.textContent =
    movie.tickets_sold >= movie.capacity ? "Sold Out" : "Buy Ticket";
  button.dataset.movieId = movie.id;
  button.disabled = movie.tickets_sold >= movie.capacity;

  cardBody.append(title, description, seats, button);
  card.append(image, cardBody);

  if (existingCard) {
    existingCard.replaceWith(card);
  } else {
    container.appendChild(card);
  }
}

function updateMovie(movie) {
  console.log("Sending update for movie:", movie);
  return fetch(`${BASE_URL}/${movie.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tickets_sold: movie.tickets_sold }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Server error: ${text}`);
        });
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error updating movie:", error);
      throw error;
    });
}
function addMovie(movie) {
  fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...movie, tickets_sold: 0 }),
  })
    .then((response) => response.json())
    .then(() => {
      const modal = new bootstrap.Modal(
        document.getElementById("exampleModal")
      );
      modal.hide(); // Close modal after successful addition
      fetchMovies(); // Fetch movies after adding new one
    })
    .catch((error) => console.error("Error adding movie:", error));
}

function catchError(error) {
  console.error("Error:", error);
}
