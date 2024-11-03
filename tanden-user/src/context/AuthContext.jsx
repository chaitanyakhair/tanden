// AuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { domain } from '../services/getBaseUrl';
import { getSocket } from '../services/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [liveUsersCount, setLiveUsersCount] = useState(0)
  const [socket, setSocket] = useState(null)

  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    return storedUser ? storedUser : {};
  });

  const [token, setToken] = useState(() => {
    const storedToken = JSON.parse(localStorage.getItem('auth'));
    return storedToken ? storedToken : '';
  });

  const [referralsData, setReferralsData] = useState([]);
  const [shareLink, setShareLink] = useState(`${domain}/login/#register`);
  const [karmaPoints, setKarmaPoints] = useState(0);

  useEffect(() => {
    if (user && user.refers) {
      setShareLink(`${domain}/login/${user.refers.code ?? ''}#register`);
      setKarmaPoints(user.refers.points ?? 0);
    } else {
      setShareLink(`${domain}/login/#register`);
      setKarmaPoints(0);
    }
  }, [user]);

  useMemo(() => {
    const socket = getSocket();
    console.log("socket connected")
    setSocket(() => socket.connect())
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, referralsData, setReferralsData, shareLink, setShareLink, karmaPoints, setKarmaPoints, liveUsersCount, setLiveUsersCount, socket, setSocket }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
