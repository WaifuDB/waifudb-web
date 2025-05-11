import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Box, CardContent, createTheme, CssBaseline, Paper, ThemeProvider } from '@mui/material'
import Header from './components/Header'
import RouteIndex from './routes/RouteIndex'
import { Route, Routes } from 'react-router'
import RouteRegister from './routes/RouteRegister'
import { ToastContainer } from 'react-toastify'
import RouteLogin from './routes/RouteLogin'
import ProtectedRoute from './components/ProtectedRoute'
import RouteLogout from './routes/RouteLogout'
import RouteWaifuCreate from './routes/RouteWaifuCreate'
import RouteWaifus from './routes/RouteWaifus'
import RouteSources from './routes/RouteSources'
import RouteWaifuEdit from './routes/RouteWaifuEdit'
import RouteImageNew from './routes/RouteImageNew'

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
})

function App() {
  window.onTitleChange = (title) => {
    setTitle(title);
  }

  const routes = [
    { path: '/', element: <RouteIndex />, protected: false, },
    { path: '/register', element: <RouteRegister />, protected: false, },
    { path: '/login', element: <RouteLogin />, protected: false, },
    { path: '/logout', element: <RouteLogout />, protected: false, },
    { path: '/create', element: <RouteWaifuCreate />, protected: true, creator_only: true, },
    { path: '/sources/:id?/:tab?', element: <RouteSources />, protected: false, },
    { path: '/characters/:id', element: <RouteWaifus />, protected: false, },
    { path: '/characters/:id/edit', element: <RouteWaifuEdit />, protected: true, creator_only: true, },
    { path: '/images/new', element: <RouteImageNew />, protected: true, creator_only: true, },
  ];

  const getRoute = (obj, is_child = false) => {
    const _route = <Route
      key={obj.path}
      path={obj.path}
      element={
        obj.protected ? <ProtectedRoute creator_only={obj.creator_only ?? false}>{obj.element}</ProtectedRoute> : obj.element
      }
    >
      {
        obj.children && obj.children.map((child) => getRoute(child, true))
      }
    </Route>;
    return <>
      {
        is_child && <Route
          onTitleChange={(title) => setTitle(title)}
          index
          element={obj.element}
        />
      }
      {_route}
    </>
  }

  const basePage = (
    <>
      <Box>
        <Header />
      </Box>
      <Paper sx={{
        borderRadius: 0,
      }}>
        <CardContent>
          <Routes>
            {
              routes.map((route) => getRoute(route))
            }
          </Routes>
        </CardContent>
      </Paper>
      <Box sx={{ pb: 2 }}>
        {/* <Footer /> */}
      </Box>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer hideProgressBar />
      {basePage}
    </ThemeProvider>
  )
}

export default App
