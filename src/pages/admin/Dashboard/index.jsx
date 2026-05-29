import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import TodayIcon from '@mui/icons-material/Today';
import { fetchDashboardStatsAction } from '../../../Actions/DashboardAction';

// ── Stat card config ───────────────────────────────────────────────────────────
const STAT_CARDS = [
  {
    key: 'totalProducts',
    label: 'Total Products',
    icon: InventoryIcon,
    color: '#1565c0',
    bg: '#e3f2fd',
  },
  {
    key: 'totalPublishedProducts',
    label: 'Published',
    icon: PublishedWithChangesIcon,
    color: '#2e7d32',
    bg: '#e8f5e9',
  },
  {
    key: 'totalDraftProducts',
    label: 'Drafts',
    icon: UnpublishedIcon,
    color: '#ed6c02',
    bg: '#fff3e0',
  },
  {
    key: 'totalCategories',
    label: 'Categories',
    icon: CategoryIcon,
    color: '#7b1fa2',
    bg: '#f3e5f5',
  },
  {
    key: 'totalUserCount',
    label: 'Total Users',
    icon: PeopleIcon,
    color: '#0288d1',
    bg: '#e1f5fe',
  },
  {
    key: 'totalNewUsersLast7Days',
    label: 'New Users (7d)',
    icon: PersonAddIcon,
    color: '#00695c',
    bg: '#e0f2f1',
  },
  {
    key: 'totalNewUsersLast1Month',
    label: 'New Users (30d)',
    icon: PersonAddIcon,
    color: '#558b2f',
    bg: '#f1f8e9',
  },
  {
    key: 'todayTotalNewUsers',
    label: 'New Users Today',
    icon: TodayIcon,
    color: '#c62828',
    bg: '#ffebee',
  },
];

// ── Single stat card ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg }) {
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
        <Box>
          <Typography variant="body2" color="text.secondary" noWrap>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value ?? 0}
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
        {STAT_CARDS.map(({ key, label, icon, color, bg }) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <StatCard
              label={label}
              value={stats?.[key]}
              icon={icon}
              color={color}
              bg={bg}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Quick summary ── */}
      {/* <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Products Summary
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {[
                ['Total Products',    stats?.totalProducts],
                ['Published',         stats?.totalPublishedProducts],
                ['Drafts',            stats?.totalDraftProducts],
                ['Categories',        stats?.totalCategories],
              ].map(([label, val]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{val ?? 0}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Users Activity
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              {[
                ['Total Users',         stats?.totalUserCount],
                ['Active (last 7d)',     stats?.totalUserActiveLast7Days],
                ['New (last 7d)',        stats?.totalNewUsersLast7Days],
                ['New (last 30d)',       stats?.totalNewUsersLast1Month],
                ['New Today',           stats?.todayTotalNewUsers],
              ].map(([label, val]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{val ?? 0}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}
    </Box>
  );
}

export default DashboardPage;
