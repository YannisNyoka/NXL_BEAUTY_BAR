import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Check if user is authenticated and has admin email
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user has admin email
  if (user?.email !== 'admin@nxlbeautybar.com') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;