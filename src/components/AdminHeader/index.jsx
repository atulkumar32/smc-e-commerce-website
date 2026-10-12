import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Badge,
  Tooltip,
  Popover,
  Paper,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Rating,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { DRAWER_WIDTH } from '../Sidebar';
import { fetchPendingReviewsAction } from '../../Actions/ReviewNotificationActions';

function formatDate(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now - d;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24 && d.getDate() === now.getDate()) {
      return `Today, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function AdminHeader({ title, onMenuClick }) {
  const navigate = useNavigate();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingReviewsAction({ limit: 100 });
      setPendingReviews(res.pendingReviews || []);
      setPendingCount(res.count || 0);
    } catch {
      // Fail gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Auto-check for new reviews periodically (every 60s)
    const interval = setInterval(() => {
      loadNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleOpen = (event) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMouseEnter = (event) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    const currentTarget = event.currentTarget;
    hoverTimeoutRef.current = setTimeout(() => {
      setAnchorEl(currentTarget);
    }, 150);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setAnchorEl(null);
    }, 250);
  };

  const handleItemClick = (review) => {
    handleClose();
    navigate('/admin/reviews?filter=pending');
  };

  const handleViewAll = () => {
    handleClose();
    navigate('/admin/reviews?filter=pending');
  };

  const isPopoverOpen = Boolean(anchorEl);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="h1" fontWeight={600} sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notification Bell Button */}
          <Box
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{ display: 'inline-flex' }}
          >
            <Tooltip title={pendingCount > 0 ? `${pendingCount} new inactive review(s)` : 'Notifications'}>
              <IconButton
                color="inherit"
                onClick={(e) => {
                  if (isPopoverOpen) handleClose();
                  else handleOpen(e);
                }}
                sx={{
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.08)' },
                }}
                aria-haspopup="true"
                aria-expanded={isPopoverOpen}
              >
                <Badge
                  badgeContent={pendingCount > 0 ? pendingCount : 0}
                  color="error"
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      minWidth: 18,
                      height: 18,
                      padding: '0 4px',
                      boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                    },
                  }}
                >
                  <NotificationsOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>

          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
            AD
          </Avatar>
        </Box>
      </Toolbar>

      {/* ── Notification Popover (Hover & Click) ── */}
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          onMouseEnter: () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          },
          onMouseLeave: handleMouseLeave,
          sx: {
            mt: 1.2,
            width: { xs: 320, sm: 380 },
            maxWidth: '92vw',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(0, 31, 63, 0.16)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          },
        }}
      >
        {/* Popover Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#001F3F',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RateReviewIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
            <div>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#ffffff' }}>
                Reviews &amp; Ratings
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                Inactive reviews pending activation
              </Typography>
            </div>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${pendingCount} Pending`}
              size="small"
              sx={{
                bgcolor: pendingCount > 0 ? '#ef4444' : 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 22,
              }}
            />
            <Tooltip title="Refresh reviews">
              <IconButton
                size="small"
                onClick={loadNotifications}
                disabled={loading}
                sx={{ color: '#ffffff', p: 0.5 }}
              >
                {loading ? <CircularProgress size={16} sx={{ color: '#D4AF37' }} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Popover Body List */}
        <Box sx={{ maxHeight: 380, overflowY: 'auto', p: 1 }}>
          {pendingReviews.length === 0 ? (
            <Box sx={{ py: 5, px: 2, textAlign: 'center', color: '#64748b' }}>
              <CheckCircleIcon sx={{ fontSize: 44, color: '#10b981', mb: 1 }} />
              <Typography variant="body2" fontWeight={700} color="#1e293b">
                All Reviews Up to Date!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                No inactive customer reviews requiring action.
              </Typography>
            </Box>
          ) : (
            pendingReviews.slice(0, 6).map((item) => {
              const stars = Number(item.rating || 5);
              const initials = (item.user_name || 'Customer')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  onClick={() => handleItemClick(item)}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#f1f5f9',
                      borderColor: '#D4AF37',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 31, 63, 0.08)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: '#001F3F',
                          color: '#D4AF37',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {initials}
                      </Avatar>
                      <div>
                        <Typography variant="body2" fontWeight={700} color="#0f172a" noWrap sx={{ maxWidth: 140 }}>
                          {item.user_name || 'Customer'}
                        </Typography>
                        {item.product_id && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem' }}>
                            PID: {item.product_id}
                          </Typography>
                        )}
                      </div>
                    </Box>

                    {/* Star Rating Badge */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3,
                        bgcolor: '#fef3c7',
                        color: '#92400e',
                        px: 0.9,
                        py: 0.25,
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}
                    >
                      <StarIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
                      <span>{stars.toFixed(1)}</span>
                    </Box>
                  </Box>

                  {/* Review Excerpt */}
                  <Typography
                    variant="body2"
                    color="#334155"
                    sx={{
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontStyle: 'italic',
                      bgcolor: '#ffffff',
                      p: '6px 8px',
                      borderRadius: '8px',
                      border: '1px dashed #cbd5e1',
                    }}
                  >
                    &ldquo;{item.review_text || 'No text review'}&rdquo;
                  </Typography>

                  {/* Footer tags */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Chip
                      label="Inactive"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                      }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#64748b', fontSize: '0.7rem' }}>
                      <AccessTimeIcon sx={{ fontSize: 12 }} />
                      <span>{formatDate(item.created_at)}</span>
                    </Box>
                  </Box>
                </Paper>
              );
            })
          )}
        </Box>

        <Divider />

        {/* Popover Footer Action */}
        <Box sx={{ p: 1.2, bgcolor: '#ffffff', textAlign: 'center' }}>
          <Button
            fullWidth
            size="small"
            variant="text"
            onClick={handleViewAll}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#001F3F',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(0, 31, 63, 0.05)',
                color: '#D4AF37',
              },
            }}
          >
            View All Reviews &amp; Ratings ({pendingCount > 0 ? `${pendingCount} pending` : 'All'})
          </Button>
        </Box>
      </Popover>
    </AppBar>
  );
}

export default AdminHeader;
