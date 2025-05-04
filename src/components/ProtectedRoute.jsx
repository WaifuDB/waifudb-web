import { Navigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    console.log("ProtectedRoute", user, loading);

    if (!user) {
        // return <Navigate to="/login" replace />;
        return <div>Unauthorized</div>;
    }

    return children;
}

export default ProtectedRoute;