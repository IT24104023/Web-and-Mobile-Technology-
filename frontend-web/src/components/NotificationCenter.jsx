import React, { useState, useEffect } from "react";
import { getNotifications, markAsRead, deleteNotification, getUnreadCount } from "../services/notificationService";
import "../styles/notification.css";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(false);
      if (response.success) {
        setNotifications(response.data);
        // Count unread
        const unread = response.data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await markAsRead(notificationId);
      if (response.success) {
        setNotifications(
          notifications.map((n) =>
            n._id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const response = await deleteNotification(notificationId);
      if (response.success) {
        setNotifications(notifications.filter((n) => n._id !== notificationId));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment_cancelled":
        return "🔔";
      case "appointment_confirmed":
        return "✓";
      case "prescription_created":
        return "📋";
      case "feedback_received":
        return "⭐";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "appointment_cancelled":
        return "notification-error";
      case "appointment_confirmed":
        return "notification-success";
      case "prescription_created":
        return "notification-info";
      case "feedback_received":
        return "notification-warning";
      default:
        return "notification-default";
    }
  };

  return (
    <div className="notification-center">
      {/* Notification Bell */}
      <div
        className="notification-bell"
        onClick={() => setShowPanel(!showPanel)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h3>Notifications</h3>
            <button
              className="close-btn"
              onClick={() => setShowPanel(false)}
            >
              ✕
            </button>
          </div>

          <div className="notification-list">
            {loading && <div className="notification-loading">Loading...</div>}

            {!loading && notifications.length === 0 && (
              <div className="notification-empty">No notifications</div>
            )}

            {!loading &&
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${getNotificationColor(
                    notification.type
                  )} ${!notification.is_read ? "unread" : ""}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    {notification.data?.cancellation_reason && (
                      <div className="notification-reason">
                        <strong>Reason:</strong> {notification.data.cancellation_reason}
                      </div>
                    )}
                    <div className="notification-time">
                      {new Date(notification.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="notification-actions">
                    {!notification.is_read && (
                      <button
                        className="action-btn mark-read"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(notification._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
