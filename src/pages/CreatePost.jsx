import { useState, useEffect } from "react";
import { getProjects, setProjects, getUser } from "../utils/storage";
import dummyProjects from "../data/dummyProjects";

const CreatePost = () => {
  const user = getUser();

  useEffect(() => {
    const existingProjects = getProjects();
    if (existingProjects.length === 0) {
      setProjects(dummyProjects);
    }
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    deadline: "",
    type: "Hackathon",
    difficulty: "Beginner",
    mode: "Remote",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const projects = getProjects();

    const newProject = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      skills: formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== ""),
      deadline: formData.deadline,
      type: formData.type,
      difficulty: formData.difficulty,
      mode: formData.mode,
      owner: user?.name || "Unknown",
      ownerEmail: user?.email || "",
    };

    setProjects([...projects, newProject]);

    alert("Project created successfully");

    setFormData({
      title: "",
      description: "",
      skills: "",
      deadline: "",
      type: "Hackathon",
      difficulty: "Beginner",
      mode: "Remote",
    });
  };

  return (
    <div className="form-box">
      <h2>Create Collaboration Post</h2>
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
        ></textarea>

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

        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePost;