import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Store } from "../Store";
import { getError } from "../utils";

export default function NotificationBell() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_NOTIFICATION_URL}/api/notifications/${userInfo.email}`
      );
      setNotifications(data);
    } catch (err) {
      console.error(getError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      return;
    }

    fetchNotifications();

    const eventSource = new EventSource(
      `${process.env.REACT_APP_NOTIFICATION_URL}/api/notifications/stream/${userInfo.email}`
    );

    eventSource.addEventListener("notification", (event) => {
      const notification = JSON.parse(event.data);
      setNotifications((prev) => [notification, ...prev]);
    });

    eventSource.onerror = () => {
      // EventSource retries automatically; nothing to do here.
    };

    return () => eventSource.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.email]);

  if (!userInfo) {
    return null;
  }

  return (
    <NavDropdown
      align="end"
      id="notification-dropdown"
      onToggle={(isOpen) => isOpen && fetchNotifications()}
      title={
        <span className="icon-pill-btn">
          <i className="fas fa-bell" />
          {notifications.length > 0 && (
            <Badge pill bg="danger">
              {notifications.length}
            </Badge>
          )}
        </span>
      }
    >
      <div className="notification-panel">
        {loading ? (
          <div className="notification-empty">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">No notifications yet</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="notification-item">
              <div>{n.message}</div>
              <small className="text-muted">
                {new Date(n.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </NavDropdown>
  );
}
