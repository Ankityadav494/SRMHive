import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/applications/me");
        setApplications(res.data);
      } catch (err) {
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetch();
  }, [user]);

  if (loading) return <p className="empty-state">Loading applications...</p>;
  if (error) return <p className="empty-state">{error}</p>;

  return (
    <div className="container">
      <h1 className="page-title">My Applications</h1>

      {applications.length > 0 ? (
        <div className="grid">
          {applications.map((app) => (
            <div key={app._id} className="card">
              <h3>{app.project.title}</h3>
              <p style={{ marginTop: "10px" }}>
                <strong>Project Owner:</strong> {app.project.owner.name}
              </p>
              <p>
                <strong>Status:</strong> {app.status}
              </p>

              {app.status === "Accepted" && (
                <Link to={`/team-chat/${app.project._id}`} className="action-btn">
                  Open Team Chat
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">You have not applied to any project yet.</p>
      )}
    </div>
  );
};

export default MyApplications;