import socket from "../socket";
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const TeamChat = () => {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [project, setProject] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const [projectRes, historyRes, applicationsRes] = await Promise.all([
          API.get(`/projects/${projectId}`),
          API.get(`/messages/project/${projectId}`),
          API.get(`/applications/me`),
        ]);

        setProject(projectRes.data);
        setMessages(historyRes.data);

        const isOwner = projectRes.data.owner?._id === user?._id;
        const isAcceptedMember = applicationsRes.data.some(
          (app) => app.project?._id === projectId && app.status === "Accepted"
        );

        setAllowed(isOwner || isAcceptedMember);
      } catch (err) {
        setError("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      socket.emit("joinProject", projectId);

      socket.on("receiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socket.off("receiveMessage");
      };
    }
  }, [projectId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    try {
      const res = await API.post(`/messages/project/${projectId}`, {
        text: messageText,
      });

      socket.emit("sendMessage", {
        projectId,
        senderId: user._id,
        text: messageText,
      });

      setMessages((prev) => [...prev, res.data]);
      setMessageText("");
    } catch (err) {
      setError("Unable to send message");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p>{error}</p>
      </div>
    );
  }

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
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: "15px",
                padding: "12px",
                background:
                  msg.sender === user._id
                    ? "#eef2ff"
                    : "#f5f5f5",
                borderRadius: "10px",
              }}
            >
              <p style={{ fontWeight: "bold" }}>
                {msg.sender?.name || "User"}
              </p>
              <p>{msg.text}</p>
            </div>
          ))
        ) : (
          <p>No messages yet</p>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="card">
        <textarea
          rows="3"
          placeholder="Type message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button type="submit" className="action-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default TeamChat;