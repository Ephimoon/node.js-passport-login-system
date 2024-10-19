import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';

function Home() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:3000/', { withCredentials: true });
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUser();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      await axios.delete('http://localhost:3000/logout', { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error('Error during logout', err);
    }
  };

  return (
    <div>
      <h1>Hi, {user ? user.name : 'Guest'}</h1>
      {user && <button onClick={handleLogout}>Log Out</button>}
    </div>
  );
}

export default Home;
