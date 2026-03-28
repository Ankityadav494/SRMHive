import { useEffect, useState } from "react";
import API from "../api/api";

const Notifications = () => {
  const [notifications, setNotificationState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndMarkRead = async () => {
      try {
        const res = await API.get("/notifications");
        setNotificationState(res.data);

        // Auto-mark all unread as read when page opens
        const unread = res.data.filter((n) => !n.isRead);
        if (unread.length > 0) {
          await Promise.all(unread.map((n) => API.put(`/notifications/${n._id}`)));
          setNotificationState((prev) => prev.map((item) => ({ ...item, isRead: true })));
          // Dispatch event so Navbar resets its badge count
          window.dispatchEvent(new Event("notifications-read"));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMarkRead();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}`);
      setNotificationState((prev) =>
        prev.map((item) => item._id === id ? { ...item, isRead: true } : item)
      );
      window.dispatchEvent(new Event("notifications-read"));
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => API.put(`/notifications/${n._id}`)));
      setNotificationState((prev) => prev.map((item) => ({ ...item, isRead: true })));
      window.dispatchEvent(new Event("notifications-read"));
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-100 text-red-700 py-0.5 px-2.5 rounded-full text-sm font-bold border border-red-200 shadow-sm">
                {unreadCount} New
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={handleMarkAllAsRead}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark All as Read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex flex-col sm:flex-row gap-4 p-5 sm:p-6 rounded-2xl border transition-all duration-200 shadow-sm ${
                  notification.isRead
                    ? "bg-white border-gray-200"
                    : "bg-indigo-50 border-indigo-200 relative overflow-hidden ring-1 ring-indigo-50"
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                )}

                <div className="flex-shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.isRead ? "bg-gray-100" : "bg-indigo-100"}`}>
                    <svg className={`w-5 h-5 ${notification.isRead ? "text-gray-500" : "text-indigo-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {notification.title.toLowerCase().includes("application") ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      ) : notification.title.toLowerCase().includes("accepted") ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : notification.title.toLowerCase().includes("rejected") ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      )}
                    </svg>
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                    <h3 className={`text-lg transition-colors ${notification.isRead ? "font-semibold text-gray-800" : "font-bold text-gray-900"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs font-medium text-gray-500 whitespace-nowrap bg-white/60 px-2 py-1 rounded inline-block">
                      {new Date(notification.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className={`text-base leading-relaxed ${notification.isRead ? "text-gray-600 mb-0" : "text-gray-800 mb-4"}`}>
                    {notification.message}
                  </p>

                  {!notification.isRead && (
                    <button
                      className="mt-3 inline-flex items-center px-4 py-2 bg-white text-indigo-700 text-sm font-semibold rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-500 max-w-sm mx-auto">You don't have any new notifications at the moment. Check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;