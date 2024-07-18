import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/NotFound.css'; // Updated import path

const NotFound = () => {
    const navigate = useNavigate();

    const handleNavigation = () => {
        navigate('/login');
    };

    return (
        <div className="not-found-container">
            <div>
                <h1>404</h1>
                <p>The page you are looking for does not exist.</p>
            </div>
            <div>
                <h1 className="return-link" onClick={handleNavigation}>Return to Login page</h1>
            </div>
        </div>
    );
}

export default NotFound;
