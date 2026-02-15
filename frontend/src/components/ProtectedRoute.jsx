import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await getMe();
                // If adminOnly is true, check if user is admin
                if (adminOnly && !user.data.is_superuser) {
                    throw new Error("Not authorized");
                }
                setIsAuthorized(true);
            } catch (err) {
                localStorage.removeItem('token');
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [navigate, adminOnly]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <p>Loading...</p>
            </div>
        );
    }

    return isAuthorized ? children : null;
};

export default ProtectedRoute;
