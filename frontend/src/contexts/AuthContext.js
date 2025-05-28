import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

// PUBLIC_INTERFACE
const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // On mount, try to fetch profile to auto-login if cookie is set
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/users/profile', { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

  // PUBLIC_INTERFACE
  const loginSSO = () => {
    window.location.href = `${process.env.REACT_APP_SSO_ISSUER}/auth?client_id=${process.env.REACT_APP_SSO_CLIENT_ID}&redirect_uri=${window.location.origin}/auth/callback`;
  };

  // PUBLIC_INTERFACE
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch (err) {
      setUser(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginSSO, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
