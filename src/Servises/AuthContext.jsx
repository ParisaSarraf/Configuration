

import React, { createContext, useState } from "react";

export const MainContext = createContext();

const ContextProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem("accessToken") || null);

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