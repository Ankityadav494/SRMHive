import { Link, useNavigate } from "react-router-dom";
import { getUser, logoutUser, getNotifications } from "../utils/storage";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const unreadCount = user
    ? getNotifications().filter(
        (item) => item.userEmail === user.email && !item.isRead
      ).length
    : 0;

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav
      style={{
        background: "#111",
        color: "white",
        padding: "15px 30px",
      }}
    >
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
                Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
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