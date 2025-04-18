

import React, { createContext, useState } from "react";

export const MainContext = createContext();

const ContextProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem("accessToken"));
    const [userId, setSUserId] = useState(null);
    const [userAndRoleId, setUserAndRoleId] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    return (
        <MainContext.Provider
            value={{
                authToken,
                setAuthToken,
            }}
        >
            {children}
        </MainContext.Provider>
    );
};

export default ContextProvider;