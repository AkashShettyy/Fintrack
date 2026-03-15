import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="text-2xl font-bold text-indigo-400">
          FinTrack 💸
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-gray-300 hover:text-white transition"
          >
            Dashboard
          </Link>
          <Link
            to="/subscriptions"
            className="text-gray-300 hover:text-white transition"
          >
            Subscriptions
          </Link>
          <Link
            to="/groups"
            className="text-gray-300 hover:text-white transition"
          >
            Bill Splitter
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Hey, {user?.name} 👋</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
