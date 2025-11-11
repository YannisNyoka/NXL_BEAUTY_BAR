import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
    // Initialize from localStorage synchronously to avoid redirect on first render
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('authUser');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    const [appointmentRefreshTrigger, setAppointmentRefreshTrigger] = useState(0);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('authUser', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        if (userData.isAdmin) {
            localStorage.setItem('isAdmin', 'true');
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authUser');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('isAdmin');
    };

    // Function to trigger appointment refresh across all components
    const triggerAppointmentRefresh = () => {
        setAppointmentRefreshTrigger(prev => prev + 1);
    };

    const value = {
        user,
        isAuthenticated,
        login,
        logout,
        appointmentRefreshTrigger,
        triggerAppointmentRefresh
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};