import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";



export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setMessage("Both fields are required");
      return;
    }

    try {
       setLoading(true);
        const response = await axios.post(
        "https://checkyourcard.free.nf/apiv1/signup.php",
        { username, password },
        {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
        );

      if (response.data.success) {
        setMessage("Signup successful! 🎉");
        setUsername("");
        setPassword("");
        navigate("/admin-login");

      } else {
        setMessage(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-sm w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Create an Account</h2>

        {message && (
          <p className="text-sm text-center mb-4 text-red-600 bg-red-100 p-2 rounded">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
