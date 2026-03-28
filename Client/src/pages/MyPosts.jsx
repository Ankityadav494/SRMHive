import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const MyPosts = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const projectRes = await API.get("/projects");
        setProjects(projectRes.data);

        const ownerProjects = projectRes.data
          .filter((project) => project.owner._id === user?._id)
          .map((project) => project._id);

        const applicationsByProject = await Promise.all(
          ownerProjects.map((projectId) => API.get(`/applications/project/${projectId}`))
        );

        setApplications(
          applicationsByProject.flatMap((res) => res.data)
        );
      } catch (err) {
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetch();
  }, [user]);

  const myPosts = projects.filter((project) => project.owner._id === user?._id);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await API.put(`/applications/${applicationId}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      setError("Could not update application status.");
    }
  };

  if (loading) return <p className="empty-state">Loading posts...</p>;
  if (error) return <p className="empty-state">{error}</p>;

  return (
    <div className="container">
      <h1 className="page-title">My Posts</h1>

      {myPosts.length > 0 ? (
        myPosts.map((project) => {
          const projectApplications = applications.filter(
            (app) => app.project._id === project._id
          );

          return (
            <div key={project._id} className="card" style={{ marginBottom: "20px" }}>
              <h2>{project.title}</h2>
              <p style={{ margin: "10px 0", color: "#555" }}>{project.description}</p>

              <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>

              <Link
                to={`/team-chat/${project._id}`}
                className="action-btn"
                style={{ marginTop: "12px", marginBottom: "15px" }}
              >
                Open Team Chat
              </Link>

              <div style={{ marginTop: "15px" }}>
                <h3>Applicants</h3>

                {projectApplications.length > 0 ? (
                  projectApplications.map((app) => (
                    <div
                      key={app._id}
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        marginTop: "10px",
                      }}
                    >
                      <p><strong>Name:</strong> {app.applicant.name}</p>
                      <p><strong>Email:</strong> {app.applicant.email}</p>
                      <p><strong>Status:</strong> {app.status}</p>

                      {app.status === "Pending" && (
                        <div style={{ marginTop: "10px" }}>
                          <button
                            className="action-btn"
                            onClick={() => handleStatusChange(app._id, "Accepted")}
                          >
                            Accept
                          </button>
                          <button
                            className="action-btn secondary-btn"
                            onClick={() => handleStatusChange(app._id, "Rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="small-text">No applicants yet.</p>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p className="empty-state">You have not created any posts yet.</p>
      )}
    </div>
  );
};

export default MyPosts;