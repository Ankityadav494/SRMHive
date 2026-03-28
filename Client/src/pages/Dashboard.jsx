import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [projectRes, applicationRes] = await Promise.all([
          API.get("/projects"),
          API.get("/applications/me"),
        ]);

        setProjects(projectRes.data);
        setApplications(applicationRes.data);
      } catch (err) {
        setError("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const myPosts = projects.filter((project) => project.owner._id === user?._id);
  const myApplications = applications;

  return (
    <div className="container">
      <h1 className="page-title">Dashboard</h1>
      <p>Welcome back, <strong>{user?.name}</strong></p>

      <div className="dashboard-cards">
        <div className="stat-box">
          <h3>{myPosts.length}</h3>
          <p>My Posts</p>
        </div>

        <div className="stat-box">
          <h3>{myApplications.length}</h3>
          <p>My Applications</p>
        </div>

        <div className="stat-box">
          <h3>{user?.skills?.length || 0}</h3>
          <p>Skills Added</p>
        </div>
      </div>

      <div style={{ marginTop: "30px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link to="/create-post" className="action-btn">
          Create New Post
        </Link>

        <Link to="/my-posts" className="action-btn">
          View My Posts
        </Link>

        <Link to="/my-applications" className="action-btn">
          View My Applications
        </Link>

        <Link to="/profile" className="action-btn">
          Edit Profile
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;