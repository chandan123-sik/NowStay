import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Stay = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to rooms
        navigate('/rooms', { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
};

export default Stay;
