import useAuth from '../utils/useAuth'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RequireAuth = ({ allowedRoles }: { allowedRoles: string[] }) => {

  const {auth} = useAuth();
  const location = useLocation();

  console.log("RequireAuth: auth", auth.userId);

  return (
    allowedRoles.includes(auth?.role)
      ? <Outlet />
      : auth?.userId
      ? <Navigate to="/unauthorized" state={{ from: location }} replace />
      : <Navigate to="/login" state={{ from: location }} replace />
  );
}

export default RequireAuth