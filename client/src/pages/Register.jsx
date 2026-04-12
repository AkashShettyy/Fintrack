import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
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

  const inputCls = "w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-600 px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-teal-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-teal-500/20 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]">
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch">
        <section className="hero-panel hidden lg:flex flex-col justify-between p-8 xl:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-200">
              New Workspace
            </div>
            <h1 className="mt-6 max-w-lg text-4xl font-bold tracking-tight text-white xl:text-5xl">
              Build a calmer view of your recurring money flows.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300">
              Start with subscriptions, then layer in shared group expenses. FinTrack keeps both the solo and shared sides of finance visible without adding friction.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Track subscriptions across monthly and yearly billing cycles",
              "Create groups for trips, rent, and shared household costs",
              "Keep upcoming renewals and total spend visible at a glance",
            ].map((item) => (
              <div key={item} className="glass-card flex items-center gap-3 p-4 text-sm text-gray-200">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-teal-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="glass-card p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-400 via-emerald-500 to-orange-500 flex items-center justify-center shadow-xl shadow-teal-950/40">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create your account</h2>
              <p className="text-gray-400 text-sm mt-1">Start managing your finances today</p>
            </div>
          </div>

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
              className="w-full primary-action mt-1"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account...</span>
                : "Create account"
              }
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-7 pt-6 border-t border-white/[0.06]">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-300 hover:text-teal-200 font-semibold transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
