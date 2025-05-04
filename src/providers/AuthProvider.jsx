import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { getAPIUrl } from "../helpers/API";
import { useNavigate } from "react-router";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("site") || "");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in on initial load
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const storedToken = localStorage.getItem("token");
            const storedUserId = localStorage.getItem("user_id");
            if (!storedToken || !storedUserId) {
                setUser(null);
                setToken(null);
                setLoading(false);
                return;
            }

            const response = await axios.post(`${getAPIUrl()}/auth/profile`, { user_id: storedUserId, token: storedToken }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            
            if (!response.data.user?.id || response.data.user?.id != storedUserId) {
                throw new Error(`User ID mismatch or user not found (Remote: ${response.data.user?.id}, Local: ${storedUserId})`);
            }


            setUser(storedUserId);
            setToken(storedToken);
            setLoading(false);
        } catch (err) {
            console.error('Session check error:', err);
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post(
                `${getAPIUrl()}/auth/login`,
                { username, password },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                }
            );
            if (!response.data.user) {
                throw new Error('Server didn\'t return user data');
            }
            if (!response.data.token) {
                throw new Error('Server didn\'t return token data');
            }
            setToken(response.data.token);
            setUser(response.data.user.id);

            //save user_id and token to local storage
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user_id", response.data.user.id);

            navigate("/");

            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.error || err.message || 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${getAPIUrl()}/auth/logout`, {
                user_id: user,
                token: token,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            navigate("/login");
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const register = async (username, password) => {
        try {
            await axios.post(`${getAPIUrl()}/auth/register`, { username, password }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            navigate("/login");

            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.error || 'Registration failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}