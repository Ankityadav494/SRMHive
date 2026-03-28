import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        setError("Unable to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    setStatus("submitting");
    try {
      await API.post(`/applications/${id}`);
      alert("Applied successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    } finally {
      setStatus("idle");
    }
  };

  if (loading) return <p className="empty-state">Loading project...</p>;
  if (error) return <p className="empty-state">{error}</p>;

  if (!project) {
    return (
      <div className="container">
        <p>Project not found</p>
      </div>
    );
  }

  const isOwner = project.owner?._id === user?._id;

  return (
    <div className="container">
      <div className="card">
        <h1>{project.title}</h1>
        <p style={{ margin: "15px 0", lineHeight: "1.7", color: "#555" }}>
          {project.description}
        </p>

        <p>
          <strong>Owner:</strong> {project.owner?.name}
        </p>
        <p>
          <strong>Deadline:</strong>{" "}
          {new Date(project.deadline).toLocaleDateString()}
        </p>
        <p>
          <strong>Type:</strong> {project.type}
        </p>
        <p>
          <strong>Mode:</strong> {project.mode}
        </p>
        <p>
          <strong>Difficulty:</strong> {project.difficulty}
        </p>

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

        {!isOwner && (
          <button onClick={handleApply} className="action-btn" disabled={status !== "idle"}>
            {status === "submitting" ? "Applying..." : "Apply to Join"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;