export const getUser = () => {
  return JSON.parse(localStorage.getItem("devconnect_user")) || null;
};

export const setUser = (user) => {
  localStorage.setItem("devconnect_user", JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem("devconnect_user");
};

export const getProjects = () => {
  return JSON.parse(localStorage.getItem("devconnect_projects")) || [];
};

export const setProjects = (projects) => {
  localStorage.setItem("devconnect_projects", JSON.stringify(projects));
};

export const getApplications = () => {
  return JSON.parse(localStorage.getItem("devconnect_applications")) || [];
};

export const setApplications = (applications) => {
  localStorage.setItem(
    "devconnect_applications",
    JSON.stringify(applications)
  );
};

export const getNotifications = () => {
  return JSON.parse(localStorage.getItem("devconnect_notifications")) || [];
};

export const setNotifications = (notifications) => {
  localStorage.setItem(
    "devconnect_notifications",
    JSON.stringify(notifications)
  );
};

export const addNotification = (notification) => {
  const existingNotifications = getNotifications();
  const updatedNotifications = [notification, ...existingNotifications];
  setNotifications(updatedNotifications);
};

export const markNotificationAsRead = (id) => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map((item) =>
    item.id === id ? { ...item, isRead: true } : item
  );
  setNotifications(updatedNotifications);
};

export const markAllNotificationsAsRead = (userEmail) => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map((item) =>
    item.userEmail === userEmail ? { ...item, isRead: true } : item
  );
  setNotifications(updatedNotifications);
};

export const getMessages = () => {
  return JSON.parse(localStorage.getItem("devconnect_messages")) || [];
};

export const setMessages = (messages) => {
  localStorage.setItem("devconnect_messages", JSON.stringify(messages));
};

export const addMessage = (message) => {
  const existingMessages = getMessages();
  const updatedMessages = [...existingMessages, message];
  setMessages(updatedMessages);
};