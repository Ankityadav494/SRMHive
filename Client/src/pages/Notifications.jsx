import { useEffect, useState } from "react";
import API from "../api/api";

const Notifications = () => {
  const [notifications, setNotificationState] = useState([]);

  // ✅ Fetch from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/notifications");
        setNotificationState(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchNotifications();
  }, []);

  // ✅ Mark single as read
  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}`);

      setNotificationState((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Mark all as read (backend loop)
  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.map((n) =>
          API.put(`/notifications/${n._id}`)
        )
      );

      setNotificationState((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <div className="flex-between" style={{ marginBottom: "20px" }}>
        <h1 className="page-title">Notifications</h1>

        {notifications.length > 0 && (
          <button className="action-btn" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="grid">
          {notifications.map((notification) => (
            <div
              key={notification._id} // ✅ fixed
              className="card"
              style={{
                borderLeft: notification.isRead
                  ? "6px solid #ccc"
                  : "6px solid #222",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>
                {notification.title}
              </h3>

              <p style={{ color: "#555", lineHeight: "1.6" }}>
                {notification.message}
              </p>

              <p className="small-text">
                {new Date(notification.createdAt).toLocaleString()} {/* ✅ fixed */}
              </p>

              {!notification.isRead && (
                <button
                  className="action-btn"
                  onClick={() => handleMarkAsRead(notification._id)} // ✅ fixed
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No notifications yet.</p>
      )}
    </div>
  );
};

export default Notifications;