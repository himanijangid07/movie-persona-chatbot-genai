import './App.css';
import {Routes, Route} from 'react-router-dom'
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Register from './pages/Register';
import Login from './pages/Login';
import { useMemo } from 'react';
import { themeSettings } from "./theme";
import {CssBaseline, ThemeProvider} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import {Toaster} from 'react-hot-toast'
import ChatPage from './pages/ChatPage'


function App() {
  const theme = useMemo(() => createTheme(themeSettings()), [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster />
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;