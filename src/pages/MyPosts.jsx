import { Link } from "react-router-dom";
import {
  getProjects,
  getApplications,
  getUser,
  setApplications,
  addNotification,
} from "../utils/storage";

const MyPosts = () => {
  const user = getUser();
  const projects = getProjects();
  const applications = getApplications();

  const myPosts = projects.filter((project) => project.owner === user?.name);

  const handleStatusChange = (applicationId, newStatus) => {
    const selectedApplication = applications.find(
      (app) => app.id === applicationId
    );

    const updatedApplications = applications.map((app) =>
      app.id === applicationId ? { ...app, status: newStatus } : app
    );

    setApplications(updatedApplications);

    addNotification({
      id: Date.now().toString(),
      userEmail: selectedApplication.applicantEmail,
      title:
        newStatus === "Accepted"
          ? "Application Accepted"
          : "Application Rejected",
      message:
        newStatus === "Accepted"
          ? `Your application for "${selectedApplication.projectTitle}" has been accepted.`
          : `Your application for "${selectedApplication.projectTitle}" has been rejected.`,
      isRead: false,
      createdAt: new Date().toLocaleString(),
    });

    window.location.reload();
  };

  return (
    <div className="container">
      <h1 className="page-title">My Posts</h1>

      {myPosts.length > 0 ? (
        myPosts.map((project) => {
          const projectApplications = applications.filter(
            (app) => app.projectId === project.id
          );

          return (
            <div key={project.id} className="card" style={{ marginBottom: "20px" }}>
              <h2>{project.title}</h2>
              <p style={{ margin: "10px 0", color: "#555" }}>{project.description}</p>

              <p><strong>Deadline:</strong> {project.deadline}</p>

              <Link
                to={`/team-chat/${project.id}`}
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
                      key={app.id}
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        marginTop: "10px",
                      }}
                    >
                      <p><strong>Name:</strong> {app.applicantName}</p>
                      <p><strong>Email:</strong> {app.applicantEmail}</p>
                      <p><strong>Status:</strong> {app.status}</p>

                      {app.status === "Pending" && (
                        <div style={{ marginTop: "10px" }}>
                          <button
                            className="action-btn"
                            onClick={() => handleStatusChange(app.id, "Accepted")}
                          >
                            Accept
                          </button>
                          <button
                            className="action-btn secondary-btn"
                            onClick={() => handleStatusChange(app.id, "Rejected")}
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