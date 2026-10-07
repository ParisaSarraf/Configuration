import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { MainContext } from '../../Services/Context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { authToken } = useContext(MainContext)

    return authToken ? children : <Navigate to="/sign-in" replace />;
};

export default ProtectedRoute;