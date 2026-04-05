import RouteImageNew from '../routes/RouteImageNew';
import RouteIndex from '../routes/RouteIndex';
import RouteLogin from '../routes/RouteLogin';
import RouteLogout from '../routes/RouteLogout';
import RouteRegister from '../routes/RouteRegister';
import RouteSourcesList from '../features/sources/RouteSourcesList';
import RouteSourcesObject from '../features/sources/RouteSourcesObject';
import RouteWaifuCreate from '../routes/RouteWaifuCreate';
import RouteWaifuEdit from '../routes/RouteWaifuEdit';
import RouteWaifus from '../routes/RouteWaifus';

export const appRoutes = [
  { path: '/', element: <RouteIndex />, protected: false },
  { path: '/register', element: <RouteRegister />, protected: false },
  { path: '/login', element: <RouteLogin />, protected: false },
  { path: '/logout', element: <RouteLogout />, protected: false },
  { path: '/create', element: <RouteWaifuCreate />, protected: true, creator_only: true },
  { path: '/sources', element: <RouteSourcesList />, protected: false },
  { path: '/sources/:id/:tab?', element: <RouteSourcesObject />, protected: false },
  { path: '/characters/:id', element: <RouteWaifus />, protected: false },
  { path: '/characters/:id/edit', element: <RouteWaifuEdit />, protected: true, creator_only: true },
  { path: '/images/new', element: <RouteImageNew />, protected: true, creator_only: true },
];
