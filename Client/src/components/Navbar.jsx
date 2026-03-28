import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import socket from "../socket";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch {}
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    socket.emit("joinUser", user._id);
    socket.on("newNotification", () => {
      setUnreadCount((prev) => prev + 1);
      fetchNotifications();
    });

    // Reset badge when user reads notifications
    const handleNotificationsRead = () => setUnreadCount(0);
    window.addEventListener("notifications-read", handleNotificationsRead);

    return () => {
      socket.off("newNotification");
      window.removeEventListener("notifications-read", handleNotificationsRead);
    };
  }, [user]);

  // Close dropdown when route changes
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo + Brand ── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/60 transition-all group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
                <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">
              SRM<span className="text-indigo-400">Hive</span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-0.5">
            <NavLink to="/" active={isActive("/")}>Home</NavLink>
            <NavLink to="/browse-projects" active={isActive("/browse-projects")}>Projects</NavLink>

            {user ? (
              <>
                <NavLink to="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>
                <NavLink to="/create-post" active={isActive("/create-post")}>Create Post</NavLink>
                <NavLink to="/my-posts" active={isActive("/my-posts")}>My Posts</NavLink>
                <NavLink to="/my-applications" active={isActive("/my-applications")}>Applications</NavLink>
                <NavLink to="/profile" active={isActive("/profile")}>Profile</NavLink>

                {/* Notifications with badge */}
                <Link
                  to="/notifications"
                  className={`relative flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    isActive("/notifications")
                      ? "bg-white/15 text-white"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[80px] truncate">{user.name?.split(" ")[0]}</span>
                    <svg className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      </div>
                      <DropdownItem to="/profile" icon="👤">Edit Profile</DropdownItem>
                      <DropdownItem to="/my-posts" icon="📋">My Posts</DropdownItem>
                      <DropdownItem to="/my-applications" icon="📩">My Applications</DropdownItem>
                      <div className="border-t border-slate-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <span>🚪</span> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="ml-2 px-4 py-1.5 text-sm font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-1 px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/30 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 flex flex-col gap-1">
            <MobileLink to="/">Home</MobileLink>
            <MobileLink to="/browse-projects">Projects</MobileLink>
            {user ? (
              <>
                <div className="px-4 py-2 mt-1 mb-1 bg-white/5 rounded-lg">
                  <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                  <p className="text-sm text-white font-bold">{user.name}</p>
                </div>
                <MobileLink to="/dashboard">Dashboard</MobileLink>
                <MobileLink to="/create-post">Create Post</MobileLink>
                <MobileLink to="/my-posts">My Posts</MobileLink>
                <MobileLink to="/my-applications">My Applications</MobileLink>
                <MobileLink to="/profile">Profile</MobileLink>
                <MobileLink to="/notifications">
                  <span className="flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </MobileLink>
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-2.5 mt-1 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition flex items-center gap-2 border-t border-white/10"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/login">Login</MobileLink>
                <MobileLink to="/register">Register</MobileLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
      active
        ? "bg-white/15 text-white"
        : "text-slate-300 hover:text-white hover:bg-white/10"
    }`}
  >
    {children}
  </Link>
);

const MobileLink = ({ to, children }) => (
  <Link
    to={to}
    className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition block"
  >
    {children}
  </Link>
);

const DropdownItem = ({ to, children, icon }) => (
  <Link
    to={to}
    className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
  >
    <span>{icon}</span> {children}
  </Link>
);

export default Navbar;