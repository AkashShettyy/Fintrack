import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0f1117] border border-white/10 text-white placeholder-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition";

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-white tracking-tight">
            Fin<span className="text-indigo-400">Track</span>
          </span>
          <p className="text-gray-500 text-sm mt-1">Personal & Group Finance Manager</p>
        </div>

        <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-6">Start managing your finances today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Name", type: "text", value: name, set: setName, placeholder: "Your name" },
              { label: "Email", type: "email", value: email, set: setEmail, placeholder: "you@example.com" },
              { label: "Password", type: "password", value: password, set: setPassword, placeholder: "••••••••" },
            ].map(({ label, type, value, set, placeholder }) => (
              <div key={label}>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  required
                  className={inputClass}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
