import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { jwtDecode } from 'jwt-decode';

interface User {
    email: string;
    role: 'retailer' | 'supplier';
    company_name: string;
    user_id: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded: any = jwtDecode(storedToken);
                // Check expiry?
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setToken(storedToken);
                    setUser({
                        email: decoded.sub,
                        role: decoded.role,
                        company_name: decoded.company,
                        user_id: decoded.user_id
                    });
                }
            } catch (e) {
                logout();
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            const res = await api.login({ email, password: pass });
            const { access_token, user_role } = res.data;

            // Store
            localStorage.setItem('token', access_token);
            setToken(access_token);

            // Decode to get user details immediately
            const decoded: any = jwtDecode(access_token);
            setUser({
                email: decoded.sub,
                role: decoded.role,
                company_name: decoded.company,
                user_id: decoded.user_id
            });

        } catch (e) {
            console.error("Login failed", e);
            throw e;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
