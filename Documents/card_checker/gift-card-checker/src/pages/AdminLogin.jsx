import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    
    if (username === '' || password === '') {
        setError('Please fill in both fields.');
        return;
    } 
    setError(''); 

    try{
        setLoading(true);
        const response = await axios.post(
      "https://checkyourcard.free.nf/apiv1/login.php",
      { username, password },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data.success) {
        setUsername('');
        setPassword('');
        setError(''); 
        localStorage.setItem('logged_in', true); // use context/session in real app
        navigate('/admin'); // redirect to your admin page
    } else {
      setError(response.data.error || 'Login failed. Please check your credentials.');
    }

    }catch(err){
        console.error("Error during login:", err);
        setError('An error occurred while logging in.', err);
        return;
    }
  };






  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-sm w-full bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Admin Login</h2>
        {error && <p className="text-red-600 bg-red-100 p-2 mb-4 rounded text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
