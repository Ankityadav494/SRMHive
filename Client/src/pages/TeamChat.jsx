import socket from "../socket";
import { useEffect, useState, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

const TeamChat = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

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

        const isOwner = projectRes.data.owner?._id?.toString() === user?._id?.toString();
        const isAcceptedMember = applicationsRes.data.some(
          (app) => (app.project?._id ?? app.project)?.toString() === projectId && app.status === "Accepted"
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

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    try {
      const res = await API.post(`/messages/project/${projectId}`, {
        text: messageText,
      });

      socket.emit("sendMessage", {
        projectId,
        message: res.data,  // full populated message from API
      });

      setMessages((prev) => [...prev, res.data]);
      setMessageText("");
    } catch (err) {
      console.error(err);
      // Fallback: manually display text message
      alert("Unable to send message to server.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center bg-slate-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md w-full text-center shadow-sm">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-lg font-bold">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800">Project Not Found</h2>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 py-4 px-4 sm:px-6 overflow-hidden flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200 flex-grow">
        
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between shrink-0 shadow-md z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 text-white shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none mb-1">{project.title}</h1>
              <span className="text-xs font-medium text-blue-100 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 shadow-sm"></span>
                Team Active
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-lg text-sm font-semibold backdrop-blur-sm">
              Secured Channel
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-6 overflow-y-auto bg-gray-50/50 flex flex-col gap-6" style={{ scrollBehavior: 'smooth' }}>
          {messages.length > 0 ? (
            messages.map((msg, index) => {
              // sender is always a populated object: { _id, name, email }
              const senderId = msg.sender?._id?.toString() ?? msg.sender?.toString();
              const isMine = senderId === user._id?.toString();
              const senderName = msg.sender?.name || "Team Member";
              return (
                <div key={msg._id || index} className={`flex w-full gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {/* Avatar for others */}
                  {!isMine && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm mt-auto mb-1">
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className={`max-w-[72%] sm:max-w-[60%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    {!isMine && (
                      <span className="text-xs font-semibold text-gray-500 mb-1 ml-1">
                        {senderName}
                      </span>
                    )}

                    <div className={`relative px-4 py-2.5 shadow-sm text-[14.5px] leading-relaxed ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>

                    <span className="text-[10px] text-gray-400 mt-1 mx-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Avatar for self */}
                  {isMine && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm mt-auto mb-1">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 border border-indigo-100">
                <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Start the conversation</h3>
              <p className="text-gray-500 max-w-sm">Say hello to coordinate with your team! All members can view messages sent here.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-200 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-grow px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-[15px] text-gray-800 shadow-sm placeholder-gray-400"
            />
            <button 
              type="submit" 
              disabled={!messageText.trim()}
              className={`flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-white ${
                messageText.trim() 
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5' 
                  : 'bg-indigo-300 cursor-not-allowed hidden sm:flex'
              }`}
            >
              <span className="hidden sm:inline mr-2">Send</span>
              <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
            <button 
              type="submit" 
              disabled={!messageText.trim()}
              className={`sm:hidden flex items-center justify-center p-3.5 rounded-xl transition-all shadow-md ${
                messageText.trim() ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <svg className="w-6 h-6 transform -rotate-90 origin-center translate-x-0.5 -translate-y-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default TeamChat;