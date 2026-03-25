import { useEffect, useState } from "react";
import {
  getNotifications,
  getUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../utils/storage";

const Notifications = () => {
  const user = getUser();
  const [notifications, setNotificationState] = useState([]);

  useEffect(() => {
    const allNotifications = getNotifications();

    const userNotifications = allNotifications.filter(
      (item) => item.userEmail === user?.email
    );

    setNotificationState(userNotifications);
  }, [user]);

  const handleMarkAsRead = (id) => {
    markNotificationAsRead(id);

    const updatedNotifications = getNotifications().filter(
      (item) => item.userEmail === user?.email
    );

    setNotificationState(updatedNotifications);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(user?.email);

    const updatedNotifications = getNotifications().filter(
      (item) => item.userEmail === user?.email
    );

    setNotificationState(updatedNotifications);
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
              key={notification.id}
              className="card"
              style={{
                borderLeft: notification.isRead
                  ? "6px solid #ccc"
                  : "6px solid #222",
              }}
            >
              <h3 style={{ marginBottom: "10px" }}>{notification.title}</h3>
              <p style={{ color: "#555", lineHeight: "1.6" }}>
                {notification.message}
              </p>

              <p className="small-text">
                {notification.createdAt}
              </p>

              {!notification.isRead && (
                <button
                  className="action-btn"
                  onClick={() => handleMarkAsRead(notification.id)}
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