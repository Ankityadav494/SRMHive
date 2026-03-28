import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import socket from "../socket";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      const unread = res.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      setError("Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    socket.emit("joinUser", user._id);

    socket.on("newNotification", () => {
      setUnreadCount((prev) => prev + 1);
      fetchNotifications();
    });

    return () => {
      socket.off("newNotification");
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ background: "#111", color: "white", padding: "15px 30px" }}>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 0,
        }}
      >
        <Link
          to="/"
          style={{ color: "white", fontSize: "1.4rem", fontWeight: "bold" }}
        >
          SyncNest
        </Link>

        <div
          style={{
            display: "flex",
            gap: "18px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Link to="/" style={{ color: "white" }}>
            Home
          </Link>

          <Link to="/browse-projects" style={{ color: "white" }}>
            Projects
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" style={{ color: "white" }}>
                Dashboard
              </Link>

              <Link to="/create-post" style={{ color: "white" }}>
                Create Post
              </Link>

              <Link to="/profile" style={{ color: "white" }}>
                Profile
              </Link>

              <Link to="/notifications" style={{ color: "white" }}>
                Notifications {loading ? "(loading...)" : unreadCount > 0 ? `(${unreadCount})` : ""}
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  background: "#fff",
                  color: "#111",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: "white" }}>
                Login
              </Link>

              <Link to="/register" style={{ color: "white" }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;