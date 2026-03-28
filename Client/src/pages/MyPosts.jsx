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

        // Use toString() on both sides to safely compare ObjectId vs string
        const ownerProjects = projectRes.data
          .filter((p) => p.owner?._id?.toString() === user?._id?.toString())
          .map((p) => p._id);

        if (ownerProjects.length > 0) {
          const applicationsByProject = await Promise.all(
            ownerProjects.map((id) => API.get(`/applications/project/${id}`))
          );
          setApplications(applicationsByProject.flatMap((res) => res.data));
        }
      } catch (err) {
        console.error('MyPosts fetch error:', err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  // Safely compare owner ID as strings
  const myPosts = projects.filter((p) => p.owner?._id?.toString() === user?._id?.toString());

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await API.put(`/applications/${applicationId}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => app._id === applicationId ? { ...app, status: newStatus } : app)
      );
    } catch {
      setError("Could not update status.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">My Posts</h1>

        {myPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No posts yet</h3>
            <p className="text-slate-400 text-sm">You haven't created any collaboration posts yet.</p>
            <Link to="/create-post" className="inline-block mt-4 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition">
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {myPosts.map((project) => {
              const projectApplications = applications.filter((a) => 
                (a.project?._id ?? a.project)?.toString() === project._id?.toString()
              );

              return (
                <div key={project._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Post header */}
                  <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-100">
                        {project.type}
                      </span>
                      {project.deadline && (
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full border border-orange-100">
                          Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <Link
                      to={`/team-chat/${project._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm mb-5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Open Team Chat
                    </Link>

                    {/* Applicants */}
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
                      Applicants ({projectApplications.length})
                    </h3>

                    {projectApplications.length === 0 ? (
                      <p className="text-slate-400 text-sm py-4 text-center bg-slate-50 rounded-xl">No applicants yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {projectApplications.map((app) => (
                          <div key={app._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{app.applicant.name}</p>
                              <p className="text-slate-500 text-xs">{app.applicant.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                app.status === "Accepted" ? "bg-green-100 text-green-700" :
                                app.status === "Rejected" ? "bg-red-100 text-red-600" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>
                                {app.status}
                              </span>
                              {app.status === "Pending" && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(app._id, "Accepted")}
                                    className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(app._id, "Rejected")}
                                    className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;