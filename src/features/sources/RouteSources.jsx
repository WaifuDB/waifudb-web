import { useParams } from 'react-router';
import RouteSourcesList from './RouteSourcesList';
import RouteSourcesObject from './RouteSourcesObject';

function RouteSources() {
  const { id } = useParams();

  if (id) {
    return <RouteSourcesObject />;
  }

  return <RouteSourcesList />;
}

export default RouteSources;
