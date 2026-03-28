import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "", email: "", college: "", bio: "", skills: "", github: "", linkedin: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || "",
      email: user.email || "",
      college: user.college || "",
      bio: user.bio || "",
      skills: (user.skills || []).join(", "),
      github: user.github || "",
      linkedin: user.linkedin || "",
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    setSuccess(false);
    try {
      await API.put(`/auth/profile`, {
        name: formData.name,
        email: formData.email,
        college: formData.college,
        bio: formData.bio,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        github: formData.github,
        linkedin: formData.linkedin,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setStatus("idle");
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white">
            <h1 className="text-2xl font-extrabold">Edit Profile</h1>
            <p className="text-indigo-100 text-sm mt-1">Update your SRMHive profile and showcase your skills</p>
          </div>

          <div className="p-8">
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Profile updated successfully!
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mb-6">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input name="name" placeholder="Your name" value={formData.name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>College / University</label>
                <input name="college" placeholder="e.g. SRM University" value={formData.college} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Bio</label>
                <textarea name="bio" placeholder="Tell others about yourself..." rows="4" value={formData.bio} onChange={handleChange} className={inputClass + " resize-none"} />
              </div>

              <div>
                <label className={labelClass}>Skills <span className="text-slate-400 font-normal">(comma separated)</span></label>
                <input name="skills" placeholder="React, Node.js, Python..." value={formData.skills} onChange={handleChange} className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>GitHub URL</label>
                  <input name="github" placeholder="https://github.com/..." value={formData.github} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn URL</label>
                  <input name="linkedin" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;