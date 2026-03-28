import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectRes, myApps] = await Promise.all([
          API.get(`/projects/${id}`),
          user ? API.get("/applications/me") : Promise.resolve({ data: [] }),
        ]);
        setProject(projectRes.data);

        // Check if the user has already applied to this project
        const alreadyApplied = myApps.data.some(
          (app) => (app.project?._id ?? app.project)?.toString() === id
        );
        setApplied(alreadyApplied);
      } catch {
        setError("Unable to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }
    setStatus("submitting");
    try {
      await API.post(`/applications/${id}`);
      setApplied(true);
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    } finally {
      setStatus("idle");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{error}</div>
    </div>
  );

  if (!project) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-slate-500">Project not found.</div>
  );

  const isOwner = project.owner?._id === user?._id;

  const difficultyColor = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-yellow-100 text-yellow-700",
    Advanced: "bg-red-100 text-red-600",
  }[project.difficulty] || "bg-slate-100 text-slate-600";

  const modeColor = {
    Remote: "bg-blue-100 text-blue-700",
    Offline: "bg-orange-100 text-orange-700",
    Hybrid: "bg-purple-100 text-purple-700",
  }[project.mode] || "bg-slate-100 text-slate-600";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link to="/browse-projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full border border-white/30">
                {project.type}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${difficultyColor}`}>
                {project.difficulty}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${modeColor}`}>
                {project.mode}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">{project.title}</h1>
          </div>

          <div className="p-8 space-y-7">
            {/* Description */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">About this project</h2>
              <p className="text-slate-700 leading-relaxed text-base">{project.description}</p>
            </div>

            {/* Meta info row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Project Owner</p>
                <p className="text-slate-800 font-semibold">{project.owner?.name}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Application Deadline</p>
                <p className="text-slate-800 font-semibold">
                  {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "Open"}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg border border-indigo-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action */}
            {!isOwner && (
              <div className="pt-4 border-t border-slate-100">
                {applied ? (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-8 py-3 bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Applied ✓
                  </button>
                ) : !user ? (
                  <Link to="/login" className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md">
                    Login to Apply
                  </Link>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={status === "submitting"}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "submitting" ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Applying...
                      </span>
                    ) : "Apply to Join"}
                  </button>
                )}

              </div>
            )}

            {isOwner && (
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <Link
                  to={`/team-chat/${project._id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Open Team Chat
                </Link>
                <Link
                  to="/my-posts"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  View Applicants
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;