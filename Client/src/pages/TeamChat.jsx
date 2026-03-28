import socket from "../socket";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API from "../api/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Generate a consistent color from a string (for avatars)
const stringToColor = (str = "") => {
  const palette = [
    ["#6366f1", "#e0e7ff"], // indigo
    ["#8b5cf6", "#ede9fe"], // violet
    ["#ec4899", "#fce7f3"], // pink
    ["#f59e0b", "#fef3c7"], // amber
    ["#10b981", "#d1fae5"], // emerald
    ["#3b82f6", "#dbeafe"], // blue
    ["#ef4444", "#fee2e2"], // red
    ["#14b8a6", "#ccfbf1"], // teal
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

const Avatar = ({ name = "", size = 9, className = "" }) => {
  const [bg, light] = stringToColor(name);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
      style={{
        width: `${size * 4}px`,
        height: `${size * 4}px`,
        backgroundColor: bg,
        color: "#fff",
        fontSize: `${size * 1.5}px`,
      }}
    >
      {initials || "?"}
    </div>
  );
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
};

const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ─── Main Component ────────────────────────────────────────────────────────────

const TeamChat = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

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

        // Build member list from accepted applicants + owner
        const accepted = applicationsRes.data
          .filter((app) => (app.project?._id ?? app.project)?.toString() === projectId && app.status === "Accepted")
          .map((app) => app.applicant ?? { name: "Member" });
        setMembers(accepted);

        const isOwner = projectRes.data.owner?._id?.toString() === user?._id?.toString();
        const isAcceptedMember = applicationsRes.data.some(
          (app) => (app.project?._id ?? app.project)?.toString() === projectId && app.status === "Accepted"
        );
        setAllowed(isOwner || isAcceptedMember);
      } catch {
        setError("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    socket.emit("joinProject", projectId);
    const onMessage = (message) => setMessages((prev) => [...prev, message]);
    socket.on("receiveMessage", onMessage);
    return () => socket.off("receiveMessage", onMessage);
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      const text = messageText.trim();
      if (!text || sending) return;
      setSending(true);
      try {
        const res = await API.post(`/messages/project/${projectId}`, { text });
        socket.emit("sendMessage", { projectId, message: res.data });
        setMessages((prev) => [...prev, res.data]);
        setMessageText("");
        inputRef.current?.focus();
      } catch {
        alert("Could not send message. Try again.");
      } finally {
        setSending(false);
      }
    },
    [messageText, projectId, sending]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // ── Loading / Error states ──
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading team chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center bg-slate-50">
        <div className="bg-white border border-red-100 text-red-600 p-8 rounded-2xl max-w-md w-full text-center shadow-sm">
          <p className="text-lg font-bold">{error}</p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm text-indigo-600 underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-800">Project Not Found</h2>
        </div>
      </div>
    );
  }

  if (!allowed) return <Navigate to="/dashboard" />;

  // ── Group messages by date ──
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const dateLabel = formatDate(msg.createdAt);
    if (dateLabel !== lastDate) {
      grouped.push({ type: "date", label: dateLabel });
      lastDate = dateLabel;
    }
    grouped.push({ type: "msg", data: msg });
  }

  // ── Owner info ──
  const ownerName = project.owner?.name || "Owner";

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-slate-100 to-indigo-50 flex flex-col py-3 px-3 sm:px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Project icon */}
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-tight">{project.title}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                <span className="text-xs text-indigo-100 font-medium">
                  {members.length + 1} member{members.length !== 0 ? "s" : ""} · Active
                </span>
              </div>
            </div>
          </div>

          {/* Right side: members pill + back */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMembers((v) => !v)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white text-xs font-semibold transition-all backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Team
            </button>
            <Link
              to="/my-posts"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white text-xs font-semibold transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>

        {/* ── Members sidebar (collapsible) ── */}
        {showMembers && (
          <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-3 flex flex-wrap gap-3 shrink-0">
            {/* Owner */}
            <div className="flex items-center gap-2 bg-white border border-indigo-100 rounded-xl px-3 py-1.5 shadow-sm">
              <Avatar name={ownerName} size={6} />
              <div>
                <p className="text-xs font-bold text-slate-800">{ownerName}</p>
                <p className="text-[10px] text-indigo-500 font-semibold">Owner</p>
              </div>
            </div>
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm">
                <Avatar name={m.name} size={6} />
                <div>
                  <p className="text-xs font-bold text-slate-800">{m.name}</p>
                  <p className="text-[10px] text-emerald-500 font-semibold">Member</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Messages area ── */}
        <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-1 bg-slate-50/60"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.04) 1px, transparent 0)", backgroundSize: "24px 24px" }}
        >
          {grouped.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mb-5 border border-indigo-200">
                <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">No messages yet</h3>
              <p className="text-slate-500 max-w-xs text-sm">
                Be the first to say hello! This is a private channel for your team.
              </p>
            </div>
          ) : (
            grouped.map((item, index) => {
              if (item.type === "date") {
                return (
                  <div key={`date-${index}`} className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full whitespace-nowrap">
                      {item.label}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                );
              }

              const msg = item.data;
              const senderId = msg.sender?._id?.toString() ?? msg.sender?.toString();
              const isMine = senderId === user._id?.toString();
              const senderName = msg.sender?.name || "Unknown";

              // Check if prev message from same sender (to group avatars)
              const prevItem = grouped[index - 1];
              const prevMsg = prevItem?.type === "msg" ? prevItem.data : null;
              const prevSenderId = prevMsg?.sender?._id?.toString() ?? prevMsg?.sender?.toString();
              const isGrouped = prevSenderId === senderId;

              return (
                <div
                  key={msg._id || index}
                  className={`flex items-end gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"} ${isGrouped ? "mt-0.5" : "mt-3"}`}
                >
                  {/* Avatar column — always reserve space */}
                  <div className="w-9 flex-shrink-0 mb-1">
                    {!isGrouped ? (
                      <Avatar name={senderName} size={9} />
                    ) : (
                      <div className="w-9 h-9" /> // spacer
                    )}
                  </div>

                  {/* Bubble column */}
                  <div className={`flex flex-col max-w-[68%] sm:max-w-[55%] ${isMine ? "items-end" : "items-start"}`}>
                    {/* Sender label (first in group) */}
                    {!isGrouped && (
                      <div className={`flex items-center gap-2 mb-1 ${isMine ? "flex-row-reverse" : ""}`}>
                        <span className="text-[11px] font-bold text-slate-600">
                          {isMine ? (
                            <span className="text-indigo-600">You</span>
                          ) : (
                            senderName
                          )}
                        </span>
                        {isMine && (
                          <span className="text-[10px] text-indigo-400 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full font-semibold">
                            Me
                          </span>
                        )}
                        {!isMine && senderId === project.owner?._id?.toString() && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full font-semibold">
                            Owner
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`relative px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                        isMine
                          ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-br-md"
                          : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-md"
                      }`}
                      style={{ wordBreak: "break-word" }}
                    >
                      {msg.text}

                      {/* Tail decoration */}
                      {isMine ? (
                        <svg className="absolute -right-1.5 bottom-[6px] w-3 h-3 text-violet-600 fill-current" viewBox="0 0 10 10">
                          <path d="M0 0 Q10 0 10 10 L0 10 Z" />
                        </svg>
                      ) : (
                        <svg className="absolute -left-1.5 bottom-[6px] w-3 h-3 text-white fill-current" viewBox="0 0 10 10" style={{ filter: "drop-shadow(-1px 1px 0px #e2e8f0)" }}>
                          <path d="M10 0 Q0 0 0 10 L10 10 Z" />
                        </svg>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className={`text-[10px] text-slate-400 mt-1 ${isMine ? "mr-1" : "ml-1"}`}>
                      {formatTime(msg.createdAt)}
                      {isMine && (
                        <span className="ml-1 text-indigo-400">✓</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="px-4 sm:px-5 py-3 bg-white border-t border-slate-200 shrink-0">
          {/* Who is typing hint */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar name={user?.name ?? ""} size={5} />
            <span className="text-xs text-slate-400 font-medium">
              Chatting as <span className="font-bold text-slate-600">{user?.name}</span>
            </span>
          </div>

          <form onSubmit={handleSend} className="flex gap-2.5">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message and press Enter..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="flex-grow px-5 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 ${
                messageText.trim() && !sending
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {sending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default TeamChat;