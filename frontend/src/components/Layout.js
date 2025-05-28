import React, { useContext, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  ListItemText,
  Avatar,
  Divider,
  Tooltip,
  CircularProgress,
  Button
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";

// Helper for relative time (short format)
function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// PUBLIC_INTERFACE
/**
 * Layout component with persistent AppBar, notification dropdown, unread badge,
 * and children rendering. Shows notification bell for logged-in users.
 */
export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingRead, setMarkingRead] = useState({});
  const [error, setError] = useState("");

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/notifications", { withCredentials: true });
      setNotifications(res.data.notifications || []);
      const unread = (res.data.notifications || []).filter((n) => n.unread).length;
      setUnreadCount(unread);
    } catch (e) {
      setError("Failed to load notifications");
      setNotifications([]);
      setUnreadCount(0);
    }
    setLoading(false);
  }, [user]);

  // Initial fetch and (simple) polling
  useEffect(() => {
    fetchNotifications();
    if (!user) return;
    const interval = setInterval(fetchNotifications, 60000); // poll every 1m
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const handleBellClick = (event) => {
    if (!anchorEl) fetchNotifications(); // refresh on open
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  // Mark notification as read
  const handleMarkRead = async (notifId) => {
    setMarkingRead((mr) => ({ ...mr, [notifId]: true }));
    try {
      await axios.patch(`/api/notifications/${notifId}/read`, {}, { withCredentials: true });
      setNotifications((old) =>
        old.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
      );
      setUnreadCount((old) => (old > 0 ? old - 1 : 0));
    } catch (e) {
      // handle error - maybe show message
    }
    setMarkingRead((mr) => ({ ...mr, [notifId]: false }));
  };

  // Render notification dropdown
  const renderNotifications = () => {
    if (loading) {
      return (
        <MenuItem>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>Loading...</Typography>
        </MenuItem>
      );
    }
    if (error) {
      return <MenuItem disabled>{error}</MenuItem>;
    }
    if (!notifications.length)
      return <MenuItem disabled>No notifications</MenuItem>;

    return notifications.slice(0, 8).map((n) => (
      <MenuItem
        key={n.id}
        dense
        sx={{
          alignItems: "flex-start",
          backgroundColor: n.unread ? "#f5f6fa" : "inherit",
          gap: 1.5,
        }}
        disableRipple
      >
        {n.sender && (
          <Avatar
            src={n.sender.avatar || ""}
            alt={n.sender.name || "U"}
            sx={{ width: 34, height: 34, mr: 1, mt: 0.7 }}
          />
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <ListItemText
            primary={
              <span style={{
                fontWeight: n.unread ? 800 : 400,
                color: n.unread ? "#184ad4" : "#364368",
                fontSize: 15.2
              }}>
                {n.message || "Notification"}
                {" "}
                <span style={{
                  fontWeight: 400,
                  color: "#b2bbc8",
                  fontSize: 13.5,
                  marginLeft: 8,
                }}>
                  • {timeAgo(n.createdAt)}
                </span>
              </span>
            }
            secondary={n.type ? <span style={{ color: "#4c5caf" }}>{n.type.replace("_", " ")}</span> : null}
          />
          {n.unread && (
            <Button
              size="small"
              color="primary"
              disabled={markingRead[n.id]}
              onClick={() => handleMarkRead(n.id)}
              sx={{
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 2,
                px: 1.5,
                py: .3,
                mt: .6,
                background: "#edf1ff",
                textTransform: "none",
                "&:hover": { background: "#e5eaff" },
              }}
            >
              {markingRead[n.id] ? "Marking..." : "Mark as read"}
            </Button>
          )}
        </Box>
      </MenuItem>
    ));
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static" elevation={0} color="inherit">
        <Toolbar sx={{ minHeight: 72, px: { xs: 1.5, md: 3 }, background: "#f6f9ff" }}>
          <Typography
            variant="h5"
            fontWeight={900}
            color="primary"
            sx={{ flexGrow: 1, letterSpacing: .6, cursor: "pointer", userSelect: "none" }}
            onClick={() => window.location.href = "/"}
          >
            IntraTech Blog
          </Typography>
          {user && (
            <Tooltip title="Notifications">
              <IconButton
                color="primary"
                onClick={handleBellClick}
                size="large"
                aria-label="show notifications"
                sx={{ mx: .4 }}
              >
                <Badge badgeContent={unreadCount} color="error" max={9}>
                  <NotificationsIcon fontSize="medium" />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          {user && (
            <Tooltip title="Profile">
              <IconButton
                size="large"
                sx={{ ml: 1.3 }}
                onClick={() => window.location.href = "/profile"}
              >
                <Avatar src={user.avatar || ""} alt={user.name || "U"} />
              </IconButton>
            </Tooltip>
          )}
          {user && (
            <Button variant="text" onClick={logout} sx={{ ml: { xs: .5, md: 2 }, color: "#364368", fontWeight: 700 }}>
              Logout
            </Button>
          )}
          {!user && (
            <Button
              variant="contained"
              color="primary"
              href="/login"
              sx={{ ml: 2, borderRadius: 2, fontWeight: 700, boxShadow: "none" }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      {user && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            sx: {
              mt: 1.4,
              minWidth: 340,
              maxWidth: "94vw",
              borderRadius: 3.5,
              boxShadow: "0 12px 36px 0 rgba(44,70,130,0.13)",
              px: 0,
              py: 1,
            },
          }}
        >
          <Typography sx={{ px: 2, pb: 1.2, fontWeight: 900, fontSize: 18, color: "#32549a" }}>
            Notifications
          </Typography>
          <Divider sx={{ mb: .5 }} />
          {renderNotifications()}
          <Divider sx={{ mt: 1, mb: .6 }} />
          <MenuItem
            dense
            component="a"
            href="/profile"
            sx={{ fontWeight: 500, color: "#426adb", fontSize: 15.3 }}
          >
            View profile &rarr;
          </MenuItem>
        </Menu>
      )}

      {/* Page Content Render Below AppBar */}
      <Box sx={{ flex: 1, p: 0, background: "#f7fafc", minHeight: "86vh" }}>
        {children}
      </Box>
    </Box>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
