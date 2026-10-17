import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RouteProtegee({ children }) {
    const { token } = useAuth();

    if (!token) {
        return <Navigate to="/login" />;
    }

    return children;
}

export default RouteProtegee;