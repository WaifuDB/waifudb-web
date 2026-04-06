import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';
import './App.css';
import Header from './components/Header';
import { renderRoute } from './app/RouteRenderer';
import { appRoutes } from './app/routesConfig';
import { appTheme } from './app/theme';

function App() {
  const [, setTitle] = useState('');

  window.onTitleChange = (title) => {
    setTitle(title);
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ToastContainer hideProgressBar theme="dark" />
      <Box className="app-shell">
        <Header />
        <Box component="main" className="app-main">
          <Box className="app-surface">
            <Routes>
              {appRoutes.map((route) => renderRoute(route))}
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
