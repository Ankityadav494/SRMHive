import { useParams } from "react-router-dom";
import {
  getProjects,
  getApplications,
  setApplications,
  getUser,
  addNotification,
} from "../utils/storage";

const ProjectDetails = () => {
  const { id } = useParams();
  const user = getUser();

  const projects = getProjects();
  const project = projects.find((item) => item.id === id);

  const handleApply = () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    const applications = getApplications();

    const alreadyApplied = applications.find(
      (app) => app.projectId === id && app.applicantName === user.name
    );

    if (alreadyApplied) {
      alert("You already applied to this project");
      return;
    }

    const newApplication = {
      id: Date.now().toString(),
      projectId: id,
      projectTitle: project.title,
      applicantName: user.name,
      applicantEmail: user.email,
      owner: project.owner,
      status: "Pending",
    };

    setApplications([...applications, newApplication]);

    addNotification({
  id: Date.now().toString() + "_owner",
  userEmail: project.ownerEmail,
  title: "New Application Received",
  message: `${user.name} applied to join your project "${project.title}".`,
  isRead: false,
  createdAt: new Date().toLocaleString(),
});

    alert("Applied successfully");
  };

  if (!project) {
    return (
      <div className="container">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>{project.title}</h1>
        <p style={{ margin: "15px 0", lineHeight: "1.7", color: "#555" }}>
          {project.description}
        </p>

        <p><strong>Owner:</strong> {project.owner}</p>
        <p><strong>Deadline:</strong> {project.deadline}</p>
        <p><strong>Type:</strong> {project.type}</p>
        <p><strong>Mode:</strong> {project.mode}</p>
        <p><strong>Difficulty:</strong> {project.difficulty}</p>

        <div style={{ marginTop: "15px" }}>
          <strong>Required Skills:</strong>
          <div style={{ marginTop: "8px" }}>
            {project.skills.map((skill, index) => (
              <span key={index} className="tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <button onClick={handleApply} className="action-btn">
          Apply to Join
        </button>
      </div>
    </div>
  );
};

export default ProjectDetails;