/**
 * StatsCard — shared stat card component for admin + user dashboards.
 *
 * Props:
 *   icon       – React element (MUI icon or emoji)
 *   label      – string  "Total Orders"
 *   value      – string|number
 *   sub        – optional sub-text
 *   color      – hex color string e.g. '#1565c0'
 *   bg         – optional background for icon circle (defaults to color + 10% opacity)
 *   onClick    – optional click handler (adds hover lift)
 *   trend      – optional { value: '+12%', up: true } for trend badge
 */

import { Box, Paper, Typography, Stack } from '@mui/material';

function StatsCard({
  icon,
  label,
  value,
  sub,
  color = '#1565c0',
  bg,
  onClick,
  trend,
}) {
  const iconBg = bg || `${color}1a`; // ~10% opacity

  return (
    <Paper
      elevation={0}
      spacing={2}
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.18s ease',
        flex: '1 1 140px',
        minWidth: 110,
        height: '100%', // makes cards equal height in a row
        display: 'flex',
        // gap:"10px",
        gap:1,
        flexDirection: 'column',
        '&:hover': onClick
          ? {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 20px rgba(16,24,40,0.1)',
              borderColor: color,
            }
          : {},
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ flex: 1 }}>
        {/* Icon circle */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: iconBg,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 22 },
            fontSize: '1.25rem',
          }}
        >
          {/* {icon} */}
            {value ?? '—'}
        </Box>

        {/* Content */}
        <Box flex={1} minWidth={0}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.25, lineHeight: 1,marginRight:0 }}
          >
            {label}
          </Typography>

          {/* <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color, lineHeight: 1.1, mb: 0.25 }}
          >
            {value ?? '—'}
          </Typography> */}

          {sub && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.7rem', display: 'block' }}
            >
              {sub}
            </Typography>
          )}

          {trend && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                mt: 0.5,
                px: 0.75,
                py: 0.125,
                borderRadius: '4px',
                bgcolor: trend.up ? '#dcfce7' : '#fee2e2',
                color: trend.up ? '#16a34a' : '#dc2626',
                fontSize: '0.65rem',
                fontWeight: 700,
              }}
            >
              {trend.up ? '▲' : '▼'} {trend.value}
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export default StatsCard;