import { Link } from "react-router-dom";
import { getApplications, getUser } from "../utils/storage";

const MyApplications = () => {
  const user = getUser();
  const applications = getApplications();

  const myApplications = applications.filter(
    (app) => app.applicantName === user?.name
  );

  return (
    <div className="container">
      <h1 className="page-title">My Applications</h1>

      {myApplications.length > 0 ? (
        <div className="grid">
          {myApplications.map((app) => (
            <div key={app.id} className="card">
              <h3>{app.projectTitle}</h3>
              <p style={{ marginTop: "10px" }}>
                <strong>Project Owner:</strong> {app.owner}
              </p>
              <p>
                <strong>Status:</strong> {app.status}
              </p>

              {app.status === "Accepted" && (
                <Link
                  to={`/team-chat/${app.projectId}`}
                  className="action-btn"
                >
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