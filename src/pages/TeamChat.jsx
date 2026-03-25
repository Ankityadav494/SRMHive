import { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  getProjects,
  getApplications,
  getUser,
  getMessages,
  addMessage,
} from "../utils/storage";

const TeamChat = () => {
  const { projectId } = useParams();
  const user = getUser();
  const [messageText, setMessageText] = useState("");
  const [refresh, setRefresh] = useState(false);

  const projects = getProjects();
  const applications = getApplications();
  const allMessages = getMessages();

  const project = projects.find((item) => item.id === projectId);

  const isOwner = project?.ownerEmail === user?.email;

  const isAcceptedMember = applications.some(
    (app) =>
      app.projectId === projectId &&
      app.applicantEmail === user?.email &&
      app.status === "Accepted"
  );

  const allowed = isOwner || isAcceptedMember;

  const teamMembers = useMemo(() => {
    const acceptedMembers = applications
      .filter(
        (app) => app.projectId === projectId && app.status === "Accepted"
      )
      .map((app) => app.applicantName);

    return project
      ? [project.owner, ...acceptedMembers]
      : [];
  }, [applications, project, projectId]);

  const projectMessages = allMessages.filter(
    (message) => message.projectId === projectId
  );

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    addMessage({
      id: Date.now().toString(),
      projectId,
      senderName: user.name,
      senderEmail: user.email,
      text: messageText,
      createdAt: new Date().toLocaleString(),
    });

    setMessageText("");
    setRefresh(!refresh);
  };

  if (!project) {
    return (
      <div className="container">
        <p>Project not found.</p>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: "20px" }}>
        <h1>{project.title} - Team Chat</h1>
        <p style={{ marginTop: "10px", color: "#555" }}>
          Private chat room for project owner and accepted members.
        </p>

        <div style={{ marginTop: "15px" }}>
          <strong>Team Members:</strong>
          <div style={{ marginTop: "10px" }}>
            {teamMembers.map((member, index) => (
              <span key={index} className="tag">
                {member}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          minHeight: "350px",
          maxHeight: "450px",
          overflowY: "auto",
          marginBottom: "20px",
        }}
      >
        {projectMessages.length > 0 ? (
          projectMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: "15px",
                padding: "12px",
                background: msg.senderEmail === user.email ? "#eef2ff" : "#f5f5f5",
                borderRadius: "10px",
              }}
            >
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                {msg.senderName}
              </p>
              <p style={{ marginBottom: "6px" }}>{msg.text}</p>
              <p className="small-text">{msg.createdAt}</p>
            </div>
          ))
        ) : (
          <p className="empty-state">No messages yet. Start the conversation.</p>
        )}
      </div>

      <form className="card" onSubmit={handleSendMessage}>
        <textarea
          rows="4"
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            outline: "none",
            marginBottom: "12px",
          }}
        />
        <button type="submit" className="action-btn">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default TeamChat;