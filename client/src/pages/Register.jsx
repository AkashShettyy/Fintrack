import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20 transition-all";

  return (
    <div className="min-h-screen bg-[#080a10] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-violet-600/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">FinTrack</h1>
          <p className="text-gray-500 text-sm mt-1">Personal & Group Finance Manager</p>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-7">Start managing your finances today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Full Name", type: "text", val: name, set: setName, ph: "Your name" },
              { label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
              { label: "Password", type: "password", val: password, set: setPassword, ph: "Min. 6 characters" },
            ].map(({ label, type, val, set, ph }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
                <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} required className={inputCls} />
              </div>
            ))}
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 mt-1"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account...</span>
                : "Create account"
              }
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-7 pt-6 border-t border-white/[0.06]">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
