import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import toast from "react-hot-toast";

const NAV = [
  {
    to: "/dashboard", label: "Dashboard",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    to: "/subscriptions", label: "Subscriptions",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
  },
  {
    to: "/groups", label: "Bill Splitter",
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentSection = useMemo(
    () => NAV.find(({ to }) => pathname.startsWith(to))?.label || "Workspace",
    [pathname],
  );

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#070908]/85 backdrop-blur-2xl">
      <div className="max-w-screen-xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 via-emerald-500 to-orange-500 flex items-center justify-center shadow-lg shadow-teal-950/40 ring-1 ring-white/10">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block font-bold text-white text-[15px] tracking-tight">FinTrack</span>
            <span className="block text-[11px] uppercase tracking-[0.28em] text-gray-500">Money OS</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] p-1.5 shadow-[0_12px_40px_rgba(2,6,4,0.22)]">
          {NAV.map(({ to, label, icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                  active ? "bg-gradient-to-r from-teal-500 to-orange-500 text-white shadow-md shadow-teal-950/35" : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 rounded-md border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
            {currentSection}
          </div>
          <div className="hidden sm:flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-teal-400 via-emerald-500 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0 ring-2 ring-white/10">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="leading-none">
              <span className="block text-gray-200 text-sm font-medium">{user?.name}</span>
              <span className="block text-[11px] text-gray-500 mt-1">Signed in</span>
            </div>
          </div>
          <button onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-md text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition text-sm font-medium border border-transparent hover:border-red-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>

          <button onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-md border border-white/[0.08] bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.05] px-4 py-4 space-y-3 bg-[#07100c]/95">
          <div className="flex items-center gap-3 px-2 pb-2">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-teal-400 via-emerald-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/10">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">{currentSection}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 px-2 pb-1">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-gray-600">Workspace</p>
              <p className="mt-1 text-sm font-semibold text-white">FinTrack</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.24em] text-gray-600">Account</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{user?.email || "Signed in"}</p>
            </div>
          </div>
          {NAV.map(({ to, label, icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                  active ? "bg-gradient-to-r from-teal-500 to-orange-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                {label}
              </Link>
            );
          })}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
