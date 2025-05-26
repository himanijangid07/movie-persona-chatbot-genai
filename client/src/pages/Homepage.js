import React, { useState } from 'react';
import {
  Box, Typography, TextField, Autocomplete, CircularProgress
} from '@mui/material';
import axiosInstance from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

const Homepage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSuggestions = async (query) => {
    if (!query) return;
    setSearchLoading(true);
    try {
      const movieRes = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`
      );

      const suggestionList = [];

      for (const movie of movieRes.data.results.slice(0, 5)) {
        const creditsRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`
        );
        creditsRes.data.cast.slice(0, 3).forEach((cast) => {
          suggestionList.push({
            label: `${cast.character} (${movie.title})`,
            value: cast.character
          });
        });
      }

      setSuggestions(suggestionList);
    } catch (err) {
      console.error('TMDB fetch error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCharacterSelect = async (option) => {
    if (!option) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("No token found. Please log in.");
        return;
    }
    try {
        const res = await axiosInstance.post('/api/v1/chat/select-character', { character: option.value }, {
            headers: {
                Authorization: `Bearer ${token}`  // Include the token in the headers
            }
        });
        if (res.data.success) {
            // Optionally store character in localStorage or context
            localStorage.setItem('selectedCharacter', option.value);
            navigate('/chat');
        }
    } catch (err) {
        console.error('Character select failed:', err);
    }
};


  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#2e2e2e',
        color: 'white'
      }}
    >
      {/* Title */}
      <Box p={3} textAlign="center">
        <Typography variant="h4" fontWeight="bold">
          Movie Character ChatBot 🎬🤖
        </Typography>
      </Box>

      {/* Character Search */}
      <Box px={3} pb={2}>
        <Autocomplete
          freeSolo
          loading={searchLoading}
          options={suggestions}
          onInputChange={(e, value) => fetchSuggestions(value)}
          onChange={(e, value) => value && handleCharacterSelect(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search for a movie character"
              variant="filled"
              fullWidth
              sx={{ backgroundColor: 'white', borderRadius: 2 }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
      </Box>

      {/* Sticky Footer */}
      <Box mt="auto">
        <Typography variant="body2" p={1} textAlign="center" sx={{ backgroundColor: '#1e1e1e' }}>
          Designed & Developed by himanijangid07
        </Typography>
      </Box>
    </Box>
  );
};

export default Homepage;
