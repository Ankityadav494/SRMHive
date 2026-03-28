import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container">
      <section className="hero">
        <h1>Find the Right Teammates for Your Next Project</h1>
        <p>
          DevConnect is a student collaboration platform where you can create
          project posts, find skilled teammates, apply to exciting ideas, and
          build your network for hackathons, startups, and academic projects.
        </p>

        <div className="hero-buttons">
          <Link to="/browse-projects" className="btn-primary">
            Explore Projects
          </Link>
          <Link to="/register" className="btn-secondary">
            Join Now
          </Link>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h3>Post Project Ideas</h3>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Create a collaboration post and describe the skills and team members
            you need.
          </p>
        </div>

        <div className="card">
          <h3>Find Teammates</h3>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Browse project listings and apply to join teams that match your
            interests and skills.
          </p>
        </div>

        <div className="card">
          <h3>Build Your Profile</h3>
          <p style={{ marginTop: "10px", color: "#555" }}>
            Showcase your skills, links, and collaboration history to stand out.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;