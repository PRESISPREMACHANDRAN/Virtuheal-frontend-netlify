// src/context/TopBarContext.jsx
import {createContext, useState} from 'react';

const TopBarContext = createContext();

export const TopBarProvider = ({children}) => {
    const [title, setTitle] = useState('Virtuheal Administration');
    return (
        <TopBarContext.Provider value={{title, setTitle}}>
            {children}
        </TopBarContext.Provider>
    );
};

export default TopBarContext;
