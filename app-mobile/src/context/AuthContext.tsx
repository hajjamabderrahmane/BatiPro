// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../api/axios';

// export interface Utilisateur {
//     id: number;
//     name: string;        // construit à partir de nom + prenom
//     nom: string;
//     prenom: string;
//     email: string;
//     role: string;
// }

// interface AuthContextType {
//     utilisateur: Utilisateur | null;
//     token: string | null;
//     isLoading: boolean;
//     login: (email: string, motDePasse: string) => Promise<Utilisateur>;
//     logout: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// function buildUtilisateur(raw: any): Utilisateur {
//     const nom = raw?.nom ?? '';
//     const prenom = raw?.prenom ?? '';
//     const fullName = `${prenom} ${nom}`.trim();
//     return {
//         id: raw?.id,
//         name: fullName || raw?.email || 'Utilisateur',
//         nom,
//         prenom,
//         email: raw?.email ?? '',
//         role: raw?.role ?? 'employe',
//     };
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//     const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
//     const [token, setToken] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         const chargerSession = async () => {
//             try {
//                 const storedToken = await AsyncStorage.getItem('token');
//                 const storedUtilisateur = await AsyncStorage.getItem('utilisateur');

//                 if (storedToken && storedUtilisateur) {
//                     setToken(storedToken);
//                     setUtilisateur(buildUtilisateur(JSON.parse(storedUtilisateur)));

//                     // Rafraîchir depuis /me pour avoir les données à jour
//                     try {
//                         const res = await fetch('http://192.168.1.12:8000/api/me', {
//                             headers: { Authorization: `Bearer ${storedToken}` },
//                         });
//                         if (res.ok) {
//                             const data = await res.json();
//                             if (data.utilisateur) {
//                                 const fresh = buildUtilisateur(data.utilisateur);
//                                 setUtilisateur(fresh);
//                                 await AsyncStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));
//                             }
//                         }
//                     } catch {
//                         // réseau indisponible, garder le cache
//                     }
//                 }
//             } catch {
//                 // ignore
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         chargerSession();
//     }, []);

//     const login = async (email: string, motDePasse: string) => {
//         const API_BASE_URL = 'http://192.168.1.12:8000/api';

//         const response = await fetch(`${API_BASE_URL}/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, mot_de_passe: motDePasse }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             throw new Error(data.message || 'Identifiants incorrects');
//         }

//         const { token, utilisateur: rawUser } = data;
//         const user = buildUtilisateur(rawUser);

//         await AsyncStorage.setItem('token', token);
//         await AsyncStorage.setItem('utilisateur', JSON.stringify(rawUser));

//         setToken(token);
//         setUtilisateur(user);

//         return user;
//     };

//     const logout = async () => {
//         try {
//             const storedToken = await AsyncStorage.getItem('token');
//             if (storedToken) {
//                 await fetch('http://192.168.1.12:8000/api/logout', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${storedToken}`,
//                     },
//                 });
//             }
//         } catch {
//             // ignore
//         }
//         await AsyncStorage.removeItem('token');
//         await AsyncStorage.removeItem('utilisateur');
//         setToken(null);
//         setUtilisateur(null);
//     };

//     return (
//         <AuthContext.Provider value={{ utilisateur, token, isLoading, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export function useAuth() {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// }



import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

export interface Utilisateur {
    id: number;
    name: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
}

interface AuthContextType {
    utilisateur: Utilisateur | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, motDePasse: string) => Promise<Utilisateur>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUtilisateur(raw: any): Utilisateur {
    const nom = raw?.nom ?? '';
    const prenom = raw?.prenom ?? '';
    const fullName = `${prenom} ${nom}`.trim();

    return {
        id: raw?.id,
        name: fullName || raw?.email || 'Utilisateur',
        nom,
        prenom,
        email: raw?.email ?? '',
        role: raw?.role ?? 'employe',
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const chargerSession = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                const storedUtilisateur = await AsyncStorage.getItem('utilisateur');

                if (storedToken && storedUtilisateur) {
                    setToken(storedToken);
                    setUtilisateur(
                        buildUtilisateur(JSON.parse(storedUtilisateur))
                    );

                    try {
                        const data = await api.get<any>('/me');

                        if (data.utilisateur) {
                            const fresh = buildUtilisateur(data.utilisateur);

                            setUtilisateur(fresh);

                            await AsyncStorage.setItem(
                                'utilisateur',
                                JSON.stringify(data.utilisateur)
                            );
                        }
                    } catch {
                        // Garder les données en cache si le réseau est indisponible.
                    }
                }
            } catch {
                // Ignorer les erreurs de lecture de session.
            } finally {
                setIsLoading(false);
            }
        };

        chargerSession();
    }, []);

    const login = async (
        email: string,
        motDePasse: string
    ): Promise<Utilisateur> => {
        const data = await api.post<any>('/login', {
            email,
            mot_de_passe: motDePasse,
        });

        const { token: newToken, utilisateur: rawUser } = data;

        if (!newToken || !rawUser) {
            throw new Error('Réponse invalide du serveur.');
        }

        const user = buildUtilisateur(rawUser);

        await AsyncStorage.setItem('token', newToken);
        await AsyncStorage.setItem(
            'utilisateur',
            JSON.stringify(rawUser)
        );

        setToken(newToken);
        setUtilisateur(user);

        return user;
    };

    const logout = async (): Promise<void> => {
        try {
            await api.post('/logout', {});
        } catch {
            // Continuer la déconnexion même si le réseau est indisponible.
        }

        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('utilisateur');

        setToken(null);
        setUtilisateur(null);
    };

    return (
        <AuthContext.Provider
            value={{
                utilisateur,
                token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
