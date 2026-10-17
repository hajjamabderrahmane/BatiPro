import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [utilisateur, setUtilisateur] = useState(
        JSON.parse(localStorage.getItem('utilisateur')) || null
    );
    const [token, setToken] = useState(
        localStorage.getItem('token') || null
    );

    const login = async (email, motDePasse) => {
        const response = await api.post('/login', {
            email: email,
            mot_de_passe: motDePasse
        });

        const { token, utilisateur } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('utilisateur', JSON.stringify(utilisateur));

        setToken(token);
        setUtilisateur(utilisateur);

        return utilisateur;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('utilisateur');
        setToken(null);
        setUtilisateur(null);
    };

    return (
        <AuthContext.Provider value={{ utilisateur, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}