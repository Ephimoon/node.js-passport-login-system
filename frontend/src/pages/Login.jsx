import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserContext from '../contexts/UserContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(UserContext);  // Make sure setUser is used correctly
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const response = await axios.get('http://localhost:3000/', { withCredentials: true});
            if (response.data.user) 
                navigate('/');
        } catch (error) {
            console.error('Error: ', error);
        }
    }
    fetchUser();
  }, [setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', { email, password }, { withCredentials: true });
      setUser(response.data.user);  // Update the user context
      navigate('/');  // Navigate to home after login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed, please try again.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register here</a></p>
    </div>
  );
}

export default Login;
