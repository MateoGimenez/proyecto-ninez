import {createContext, useState , useContext} from 'react';
import { useLocation, Navigate } from 'react-router-dom';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe utilizarse dentro de un AuthProvider.');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [user, setUser] = useState(() =>{
        // Esto sirve para recuperar la sesión del usuario si recarga la página. Se puede almacenar en localStorage o sessionStorage según tus necesidades.
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (email, password) => {
        try{
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if(!res.ok){
                const errorData = await res.json();
                return { ok: false, error: errorData.message || 'Error durante login' };
            }

            const session = await res.json();
            setUser(session);

            sessionStorage.setItem('user', JSON.stringify(session));

            return { ok: true };
            
        } catch (error) {
            console.error('Error during login:', error);
            return { ok: false, error: 'Error durante login' };
        }
    }

    const logout = () => {
        setUser(null);

        sessionStorage.removeItem('user');
    }
    return(
        <AuthContext.Provider value={{ user, login, logout }}>
        {children}
        </AuthContext.Provider>
    )
}


export const AuthPage = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    if(!user){
        return <Navigate to="/login" state={{ from: location }} replace />
    }
    return children;
}