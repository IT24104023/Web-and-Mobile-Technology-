import api from "./api";

// Get all notifications
export const getNotifications = async (unreadOnly = false) => {
  try {
    const response = await api.get("/notifications", {
      params: { unread_only: unreadOnly },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/notifications/unread/count");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
