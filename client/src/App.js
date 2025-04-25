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


function App() {
  const theme = useMemo(() => createTheme(themeSettings(), []))
  return (
    <>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Navbar/>
      <Toaster/>
      <Routes>
        <Route path="/" element={<Homepage/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </ThemeProvider>
    </>
  );
}

export default App;
