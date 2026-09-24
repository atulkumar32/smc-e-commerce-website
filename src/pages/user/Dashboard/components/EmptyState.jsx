import { Box, Typography, Button } from '@mui/material';

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <Box className="ud-empty-state">
      {icon && <div className="ud-empty-state__icon">{icon}</div>}
      <Typography variant="h6" className="ud-empty-state__title">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" className="ud-empty-state__desc">
          {description}
        </Typography>
      )}
      <Box className="ud-empty-state__actions">
        {actionLabel && onAction && (
          <Button
            variant="contained"
            onClick={onAction}
            className="ud-empty-state__btn ud-empty-state__btn--primary"
          >
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="outlined"
            onClick={onSecondaryAction}
            className="ud-empty-state__btn ud-empty-state__btn--secondary"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}

