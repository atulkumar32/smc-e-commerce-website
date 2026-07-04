import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import adminTheme from "../../../theme/adminTheme";
import { adminLoginAction } from "../../../Actions/AuthAction";
import { saveAdminAuth } from "../../../services/apiClients";
import { notifyError, showSuccess } from "../../../utils/toastNotify";
import "./style.scss";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await adminLoginAction(form);

      if (!saveAdminAuth(res)) {
        throw new Error(res?.message || "Login failed");
      }

      showSuccess("Admin signed in successfully");
      console.log("DATA admin :", res)
      if (res.status === true) {
        window.location.href = "/admin/dashboard"; // Force full reload to ensure auth state is fresh
        return;
      }
    } catch (err) {
      const message = err.message || "Login failed. Please try again.";
      setError(message);
      notifyError(err, message);
    } finally {
      console.log("🧹 Login process finished");
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box className="admin-login">
        {/* Left decorative panel */}
        <Box className="admin-login__panel">
          <Box className="admin-login__panel-content">
            <Box className="admin-login__logo-wrap">
              <AdminPanelSettingsOutlinedIcon
                sx={{ fontSize: 56, color: "#fff" }}
              />
            </Box>
            <Typography variant="h4" className="admin-login__panel-title">
              SMC Admin
            </Typography>
            <Typography variant="body1" className="admin-login__panel-sub">
              School Bags Management Portal
            </Typography>
            <Box className="admin-login__panel-dots">
              <span />
              <span />
              <span />
            </Box>
          </Box>
        </Box>

        {/* Right form panel */}
        <Box className="admin-login__form-side">
          <Card className="admin-login__card" elevation={0}>
            <CardContent className="admin-login__card-content">
              <Typography variant="h5" className="admin-login__title">
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sign in to your admin account
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange("password")}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : null
                  }
                  sx={{ py: 1.4, fontWeight: 700, fontSize: "1rem" }}
                >
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                display="block"
              >
                Admin access only · Unauthorised access is prohibited
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default AdminLoginPage;
