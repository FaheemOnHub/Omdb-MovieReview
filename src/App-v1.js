import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const KEY = "558ef075";

  useEffect(
    function () {
      const controller = new AbortController(); //AbortController is a built-in class in JavaScript, which allows you to abort fetch requests.
      async function fetchData() {
        try {
          setIsLoading(true);
          setError(false);
          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );
          const data = await response.json();

          if (data.Response == "False") throw new Error("Movie not found");
          setMovies(data.Search);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          setError(error.message);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError(false);
        return;
      }
      fetchData();
      //This is a cleanup function
      //each time a new keystroke is hit, cleanup function will be called before the next fetch request
      return () => {
        //cleanup function
        controller.abort();
      };
    },
    [query]
  );
  return (
    //returning the JSX
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} handleSelectMovie={handleSelectMovie} />
          )}
          {!isLoading && error && <ErrorMessage error={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              closeMovieDetail={clearMovieID}
              KEY={KEY}
              handleAddWatched={handleAddWatched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                DeleteWatchedMovie={removeWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
  function handleSelectMovie(id) {
    setSelectedId(id);
  }
  function clearMovieID() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    const isMovieAlreadWatched = watched.some(
      (watchedMovie) =>
        watchedMovie.imdbID === movie.imdbID &&
        (watchedMovie.userRating = movie.userRating) //this line is added to update the userRating of the movie, if the movie is already watched
    );
    if (!isMovieAlreadWatched) {
      return setWatched((watched) => [...watched, movie]);
    } else {
      return watched;
    }
  }
  function removeWatchedMovie(movie) {
    setWatched((watched) =>
      watched.filter((watchedMovie) => watchedMovie.imdbID !== movie.imdbID)
    );
  }
}
function MovieDetails({ selectedId, closeMovieDetail, KEY, handleAddWatched }) {
  const [movie, setMovie] = useState({});
  const [userRatings, setuserRatings] = useState("");
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  function addNewWatchedMovie() {
    const newMovie = {
      imdbID: selectedId,
      Title: title,
      year,
      Poster: poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating: userRatings,
    };
    handleAddWatched(newMovie);

    closeMovieDetail();
  }
  useEffect(
    function () {
      document.addEventListener("keydown", (e) => {
        if (e.code === "Escape" && selectedId != null) {
          closeMovieDetail();
        }
      });
      return function () {
        //the removeEventListener second argument should be same to same as the second argument of addEventListener
        //why included removeEventListener, because we don't want to add multiple event listeners,
        //more exactly we don't want to add multiple event listeners for the same event
        //how multiple event listeners are added: each time the component re-renders,
        //useEffect is called then addEventListener is called
        document.removeEventListener("keydown", (e) => {
          if (e.code === "Escape" && selectedId != null) {
            closeMovieDetail();
          }
        });
      };
    },
    [closeMovieDetail, selectedId]
  );
  useEffect(
    function () {
      async function getMovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
      }
      getMovieDetails();
      setuserRatings("");
    },
    [selectedId, KEY]
  );
  useEffect(
    function () {
      document.title = `MOVIE | ${title}`;
      return function () {
        //clean-up : runs only before the title changes and only after the Component Unmount
        //Function returned from useEffect:
        //When you return a function from useEffect, React automatically treats this as a cleanup function.
        document.title = "usePopcorn";
      };
    },

    [title]
  );
  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={closeMovieDetail}>
          &larr;
        </button>
        <img src={poster} alt="poster" />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐️</span>
            {imdbRating} OMDb Rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          <StarRating maxRating={10} size={24} onSetRating={setuserRatings} />
          {userRatings > 0 && (
            <button className="btn-add" onClick={addNewWatchedMovie}>
              add to list +{" "}
            </button>
          )}
        </div>

        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ error }) {
  return <p className="error">{`${error}`}</p>;
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>

      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
*/

function MovieList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectMovie={handleSelectMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectMovie }) {
  return (
    <li onClick={() => handleSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => movie.imdbRating)
  ).toFixed(2);
  const avgUserRating = average(
    watched.map((movie) => movie.userRating)
  ).toFixed(2);
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, DeleteWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          DeleteWatchedMovie={DeleteWatchedMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, DeleteWatchedMovie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => DeleteWatchedMovie(movie)}
        >
          X
        </button>
      </div>
    </li>
  );
}
