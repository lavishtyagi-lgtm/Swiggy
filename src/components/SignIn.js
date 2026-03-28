import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOGO_URL } from "../utils/constants";

export function SignIn() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: "", dob: "" });
  const [error, setError]   = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    if (!form.dob)          { setError("Please enter your date of birth."); return; }
    localStorage.setItem("foodrush_user", JSON.stringify({ name: form.name.trim(), dob: form.dob }));
    navigate("/");
  };

  const formatDob = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <img src={LOGO_URL} alt="FoodRush" className="h-10 w-10 object-contain rounded-xl" />
            <span className="font-black text-2xl tracking-tight">
              <span className="text-orange-500">Food</span>
              <span className="text-gray-800">Rush</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm">Sign in to personalise your experience</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-lg font-bold text-gray-900 mb-6">Welcome</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Lavish Tyagi"
                value={form.name}
                onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dob}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => { setForm((f) => ({ ...f, dob: e.target.value })); setError(""); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 transition-colors"
              />
              {form.dob && (
                <p className="text-xs text-gray-400 mt-1">{formatDob(form.dob)}</p>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              Let's Go
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your data stays on this device only.
        </p>
      </div>
    </div>
  );
}
