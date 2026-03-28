import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import API from "../api/api";

const BrowseProjects = () => {
  const [projects, setProjectState] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await API.get("/projects");
        setProjectState(res.data);
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.skills.join(" ").toLowerCase().includes(search.toLowerCase());

    const matchesType = type ? project.type === type : true;
    const matchesMode = mode ? project.mode === mode : true;

    return matchesSearch && matchesType && matchesMode;
  });

  return (
    <div className="container">
      <h1 className="page-title">Browse Projects</h1>

      <div className="filter-box">
        <input
          type="text"
          placeholder="Search by title or skill"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Hackathon">Hackathon</option>
          <option value="Startup">Startup</option>
          <option value="Academic">Academic</option>
          <option value="Personal">Personal</option>
        </select>

        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="">All Modes</option>
          <option value="Remote">Remote</option>
          <option value="Offline">Offline</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      {loading ? (
        <p className="empty-state">Loading projects...</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : filteredProjects.length > 0 ? (
        <div className="grid">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No projects found.</p>
      )}
    </div>
  );
};

export default BrowseProjects;