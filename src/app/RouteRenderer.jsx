import { Route } from 'react-router';
import ProtectedRoute from '../components/ProtectedRoute';

export function renderRoute(obj, isChild = false) {
  const routeNode = (
    <Route
      key={obj.path}
      path={obj.path}
      element={
        obj.protected
          ? <ProtectedRoute creator_only={obj.creator_only ?? false}>{obj.element}</ProtectedRoute>
          : obj.element
      }
    >
      {obj.children && obj.children.map((child) => renderRoute(child, true))}
    </Route>
  );

  return (
    <>
      {isChild && (
        <Route
          index
          element={obj.element}
        />
      )}
      {routeNode}
    </>
  );
}
