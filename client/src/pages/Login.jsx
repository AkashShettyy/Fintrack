import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[12%] top-[14%] h-56 w-56 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-violet-600/12 blur-[120px]" />
        <div className="absolute bottom-[8%] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch">
        <section className="hero-panel hidden lg:flex flex-col justify-between p-8 xl:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              FinTrack
            </div>
            <h1 className="mt-6 max-w-lg text-4xl font-bold tracking-tight text-white xl:text-5xl">
              Keep subscriptions, shared costs, and renewal risk in one place.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300">
              A cleaner command center for personal spending and group settlements. Track recurring spend, spot renewals early, and open shared groups without digging through spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Renewals", value: "Smart", tone: "text-cyan-300" },
              { label: "Shared bills", value: "Grouped", tone: "text-indigo-300" },
              { label: "Monthly view", value: "Instant", tone: "text-violet-300" },
            ].map(({ label, value, tone }) => (
              <div key={label} className="glass-card p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{label}</p>
                <p className={`mt-2 text-xl font-semibold ${tone}`}>{value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="glass-card p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Sign in to your account</h2>
              <p className="text-gray-400 text-sm mt-1">Enter your credentials below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 mt-1"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</span>
                : "Sign in"
              }
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-7 pt-6 border-t border-white/[0.06]">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
