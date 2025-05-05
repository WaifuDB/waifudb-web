import { Navigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";

function ProtectedRoute({ creator_only, children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    console.log("ProtectedRoute", user, loading);

    if (!user) {
        // return <Navigate to="/login" replace />;
        return <div>Unauthorized</div>;
    }

    if (creator_only && !user.roles?.some(role => role.can_create)) {
        return <div>Permission Denied</div>;
    }

    return children;
}

export default ProtectedRoute;