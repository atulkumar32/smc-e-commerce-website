import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  fetchCurrentUserProfile,
  fetchCurrentUserOrders,
} from "../../../Actions/UserAction";
import { isUserAuthenticated } from "../../../services/apiClients";
import { notifyError } from "../../../utils/toastNotify";
import "./style.scss";

const getOrderValue = (order) =>
  order.totalAmount ?? order.total_price ?? order.amount ?? order.total ?? 0;

const getStatusLabel = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("delivered")) return "Delivered";
  if (normalized.includes("shipped")) return "Shipped";
  if (normalized.includes("pending")) return "Pending";
  if (normalized.includes("cancel")) return "Canceled";
  return status || "Processing";
};

const getStatusColor = (status) => {
  const label = getStatusLabel(status).toLowerCase();
  if (label === "delivered") return "success";
  if (label === "shipped") return "primary";
  if (label === "pending") return "warning";
  if (label === "canceled") return "error";
  return "info";
};

function UserDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    const load = async () => {
      try {
        const profileData = await fetchCurrentUserProfile();
        setProfile(profileData);
      } catch (err) {
        console.warn("[UserDashboard] profile load failed", err);
      }

      try {
        const list = await fetchCurrentUserOrders();
        setOrders(list);
      } catch (err) {
        notifyError(err, "Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + getOrderValue(order),
      0,
    );
    const pending = orders.filter((order) => {
      const status = String(order.status || "").toLowerCase();
      return status.includes("pending") || status.includes("processing");
    }).length;
    return { totalOrders, totalSpent, pending };
  }, [orders]);

  const recentOrders = orders.slice(0, 4);
  const name =
    profile?.name ||
    JSON.parse(localStorage.getItem("user_profile") || "{}")?.name ||
    "Customer";

  return (
    <Box className="user-dashboard">
      <Box className="user-dashboard__hero">
        <Box>
          <Typography variant="h4" className="user-dashboard__title">
            Hello, {name}
          </Typography>
          <Typography color="text.secondary">
            Welcome back to your dashboard. Review recent activity, manage
            orders, and update your profile.
          </Typography>
        </Box>
        {/* <Stack direction="row" spacing={2} className="user-dashboard__actions">
          <Button variant="contained" onClick={() => navigate('/user/profile')}>
            Edit Profile
          </Button>
          <Button variant="outlined" onClick={() => navigate('/user/orders')}>
            View Orders
          </Button>
        </Stack> */}
      </Box>

      <Grid container spacing={3} className="user-dashboard__summary-grid">
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Total orders
              </Typography>
              <Typography variant="h4">{stats.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Total spent
              </Typography>
              <Typography variant="h4">
                ₹{stats.totalSpent.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Pending orders
              </Typography>
              <Typography variant="h4">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box className="user-dashboard__activity">
        <Box className="user-dashboard__section-header">
          <Typography variant="h5">Recent orders</Typography>
          <Button size="small" onClick={() => navigate("/user/orders")}>
            See all orders
          </Button>
        </Box>

        {loading ? (
          <Box className="user-dashboard__loading">
            <CircularProgress />
          </Box>
        ) : recentOrders.length === 0 ? (
          <Box className="user-dashboard__empty">
            <Typography>No recent orders available.</Typography>
            <Typography color="text.secondary">
              Start shopping to place your first order.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {recentOrders.map((order, key) => (
              <Grid
                item
                xs={12}
                md={6}
                key={order.id ?? order.order_number ?? key}
              >
                <Card className="dashboard-card dashboard-card--order">
                  <CardContent>
                    <Box className="order-meta">
                      <div>
                        <Typography variant="subtitle2" color="text.secondary">
                          Order #{order.order_number || order.id || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(
                            order.created_at || order.date || Date.now(),
                          ).toLocaleDateString()}
                        </Typography>
                      </div>
                      <Chip
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status)}
                      />
                    </Box>

                    <Box className="order-detail">
                      <Typography variant="h5">
                        ₹{getOrderValue(order).toFixed(2)}
                      </Typography>
                      <Typography color="text.secondary">
                        {order.items?.length ?? order.quantity ?? 1} items
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate("/user/orders")}
                    >
                      Track order
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default UserDashboard;
