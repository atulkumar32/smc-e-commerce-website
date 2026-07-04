import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';


import { fetchDashboardStatsAction } from '../../../Actions/DashboardAction';
import { STAT_CARDS } from './DashboardData';



// ── Single stat card ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, hasInfo, tooltip, isCurrency }) {
  const displayValue = isCurrency
    ? `₹${(value ?? 0).toLocaleString()}`
    : value ?? 0;

  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color, fontSize: 26 }} />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>
            {hasInfo && tooltip && (
              <Tooltip title={tooltip} arrow>
                <IconButton size="small" sx={{ p: 0.3 }}>
                  <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Typography variant="h5" fontWeight={700}>
            {displayValue}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Dashboard page ─────────────────────────────────────────────────────────────
function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStatsAction()
      .then(setStats)
      .catch((err) => setError(err.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ py: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back! Here is an overview of your store performance.
      </Typography>

      {/* ── Stat cards ── */}
      <Grid container spacing={2.5}>
        {STAT_CARDS.map(({ key, label, icon, color, bg, hasInfo, tooltip, isCurrency }) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <StatCard
              label={label}
              value={stats?.[key]}
              icon={icon}
              color={color}
              bg={bg}
              hasInfo={hasInfo}
              tooltip={tooltip}
              isCurrency={isCurrency}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default DashboardPage;