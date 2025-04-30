const axios = require("axios");

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function getCharacterInfo(characterName) {
  try {
    // Search the character across people/movies
    const response = await axios.get(`https://api.themoviedb.org/3/search/multi`, {
      params: {
        api_key: TMDB_API_KEY,
        query: characterName,
      },
    });

    const results = response.data.results;

    // Pick the first relevant result
    const matched = results.find(item => item.media_type === "movie" || item.media_type === "person");

    if (!matched) return null;

    if (matched.media_type === "movie") {
      return {
        character: characterName,
        movieTitle: matched.title || matched.name,
        movieDescription: matched.overview || "No description available.",
      };
    }

    if (matched.media_type === "person") {
      // Optional enhancement: fetch person’s known movies
      const known = matched.known_for?.[0];
      return {
        character: characterName,
        movieTitle: known?.title || known?.name || "Unknown",
        movieDescription: known?.overview || "No description available.",
      };
    }

    return null;
  } catch (error) {
    console.error("TMDB fetch error:", error.message);
    return null;
  }
}

module.exports = { getCharacterInfo };
