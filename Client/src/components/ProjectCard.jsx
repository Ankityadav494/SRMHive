import { Link } from "react-router-dom";

const ProjectCard = ({ project }) => {
  return (
    <div className="card">
      <div className="flex-between">
        <h3>{project.title}</h3>
        <span className="tag">{project.type}</span>
      </div>

      <p style={{ margin: "12px 0", color: "#555", lineHeight: "1.5" }}>
        {project.description}
      </p>

      <div>
        {project.skills.map((skill, index) => (
          <span key={index} className="tag">
            {skill}
          </span>
        ))}
      </div>

      <p style={{ marginTop: "12px" }}>
        <strong>Owner:</strong> {project.owner?.name || project.owner}
      </p>
      <p>
        <strong>Deadline:</strong> {project.deadline ? new Date(project.deadline).toLocaleDateString() : "-"}
      </p>
      <p>
        <strong>Mode:</strong> {project.mode}
      </p>
      <p>
        <strong>Difficulty:</strong> {project.difficulty}
      </p>

      <Link to={`/project/${project._id || project.id}`} className="action-btn">
        View Details
      </Link>
    </div>
  );
};

export default ProjectCard;