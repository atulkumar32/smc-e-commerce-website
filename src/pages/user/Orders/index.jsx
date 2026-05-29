import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import { fetchUserOrders } from "../../../Actions/UserOrderDashboardAction";
import { isUserAuthenticated } from "../../../services/apiClients";
import { notifyError } from "../../../utils/toastNotify";
import "./style.scss";

const getOrderValue = (order) => {
  return (
    order.totalAmount ?? order.total_price ?? order.amount ?? order.total ?? 0
  );
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
};

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

function UserOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate("/login", { replace: true });
      return;
    }

    const User_id = localStorage.getItem("user_id") || localStorage.getItem("userId");
    if (!User_id) {
      notifyError("User ID not found. Please log in again.");
      navigate("/login", { replace: true });
      return;
    }
    const loadOrders = async () => {
      try {
        const data = await fetchUserOrders(user_id);
        setOrders(Array.isArray(data) ? data : (data.orders ?? []));
      } catch (err) {
        console.error("[UserOrders] load error", err);
        notifyError(err, "Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  const totalAmount = orders.reduce(
    (sum, order) => sum + getOrderValue(order),
    0,
  );
  const recentOrders = orders.slice(0, 5);

  return (
    <Box className="user-orders">
      <Box className="user-orders__header">
        <Box>
          <Typography variant="h4" className="user-orders__title">
            My Orders
          </Typography>
          <Typography color="text.secondary">
            Track recent purchases and view order status in one place.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/user/dashboard")}
        >
          Back to dashboard
        </Button>
      </Box>

      <Box className="user-orders__summary">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Box className="summary-card">
              <Typography variant="subtitle2" color="text.secondary">
                Total Orders
              </Typography>
              <Typography variant="h5">{orders.length}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box className="summary-card">
              <Typography variant="subtitle2" color="text.secondary">
                Order Total
              </Typography>
              <Typography variant="h5">₹{totalAmount.toFixed(2)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box className="summary-card">
              <Typography variant="subtitle2" color="text.secondary">
                Recent Order
              </Typography>
              <Typography variant="h5">
                {recentOrders[0]?.order_number || recentOrders[0]?.id || "—"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box className="user-orders__loading">
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Box className="user-orders__empty">
          <Typography variant="body1">No orders found yet.</Typography>
          <Typography color="text.secondary">
            Start shopping to see your orders here.
          </Typography>
        </Box>
      ) : (
        <Box className="user-orders__list">
          {recentOrders.map((order, index) => (
            <Box
              key={order.id || order.order_number || index}
              className="order-card"
            >
              <Box className="order-card__top">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Order #
                    {order.order_number || order.id || order.reference || "N/A"}
                  </Typography>
                  <Typography variant="h6">
                    ₹{getOrderValue(order).toFixed(2)}
                  </Typography>
                </Box>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Box>
              <Box className="order-card__meta">
                <Typography color="text.secondary">
                  placed {formatDate(order.created_at || order.date)} ·{" "}
                  {order.items?.length || order.quantity || 1} items
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Track order
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default UserOrders;
