import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const Profile = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    bio: "",
    skills: "",
    github: "",
    linkedin: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus("submitting");
    setError(null);

    try {
      const update = {
        name: formData.name,
        email: formData.email,
        college: formData.college,
        bio: formData.bio,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        github: formData.github,
        linkedin: formData.linkedin,
      };

      await API.put(`/auth/profile`, update);
      alert("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="form-box">
      <h2>Edit Profile</h2>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        <input name="college" placeholder="College" value={formData.college} onChange={handleChange} />
        <textarea name="bio" placeholder="Bio" rows="4" value={formData.bio} onChange={handleChange} />
        <input
          name="skills"
          placeholder="Skills separated by comma"
          value={formData.skills}
          onChange={handleChange}
        />
        <input name="github" placeholder="GitHub link" value={formData.github} onChange={handleChange} />
        <input name="linkedin" placeholder="LinkedIn link" value={formData.linkedin} onChange={handleChange} />

        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;