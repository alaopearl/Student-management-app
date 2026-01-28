import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    
    const isAuthenticated = localStorage.getItem('logged_in') === 'true';

    if (!isAuthenticated) {
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]); 

  return children;
};

export default ProtectedRoute;
