import { useState } from 'react';
import { Box, CardContent, CssBaseline, Paper, ThemeProvider } from '@mui/material';
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
      <ToastContainer hideProgressBar />
      <Box>
        <Header />
      </Box>
      <Paper
        sx={{
          borderRadius: 0,
        }}
      >
        <CardContent>
          <Routes>
            {appRoutes.map((route) => renderRoute(route))}
          </Routes>
        </CardContent>
      </Paper>
      <Box sx={{ pb: 2 }}>
        {/* <Footer /> */}
      </Box>
    </ThemeProvider>
  );
}

export default App;
