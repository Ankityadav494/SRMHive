import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const CreatePost = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    deadline: "",
    type: "Hackathon",
    difficulty: "Beginner",
    mode: "Remote",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setError(null);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please login first");
      return;
    }

    if (!formData.title || !formData.description) {
      setError("Please provide title and description");
      return;
    }

    setStatus("submitting");
    try {
      await API.post("/projects", {
        title: formData.title,
        description: formData.description,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        deadline: formData.deadline,
        type: formData.type,
        difficulty: formData.difficulty,
        mode: formData.mode,
      });

      setFormData({
        title: "",
        description: "",
        skills: "",
        deadline: "",
        type: "Hackathon",
        difficulty: "Beginner",
        mode: "Remote",
      });
      setError(null);
      alert("Project created successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating project");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="form-box">
      <h2>Create Collaboration Post</h2>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Project title"
          value={formData.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Project description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
        />

        <input
          name="skills"
          placeholder="Required skills separated by comma"
          value={formData.skills}
          onChange={handleChange}
        />

        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
        />

        <select name="type" value={formData.type} onChange={handleChange}>
          <option>Hackathon</option>
          <option>Startup</option>
          <option>Academic</option>
          <option>Personal</option>
        </select>

        <select
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <select name="mode" value={formData.mode} onChange={handleChange}>
          <option>Remote</option>
          <option>Offline</option>
          <option>Hybrid</option>
        </select>

        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
