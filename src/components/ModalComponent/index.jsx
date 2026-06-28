import {
  Dialog, DialogTitle, DialogContent,
  IconButton, Typography, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function ModalComponent({
  open,
  onClose,
  title,
  children,
  maxWidth = 'xl',   // full-width by default
  fullWidth = true,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '10px',
          maxHeight: '94vh',
          m: { xs: 1, sm: 2 },
          // xl = 1536px, but we cap so there's a little breathing room
          width: maxWidth === 'xl' ? 'min(100% - 32px, 1400px)' : undefined,
        },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 1.75,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: '#fafafa', flexShrink: 0,
        }}
      >
        <Typography variant="h6" fontWeight={700} fontSize="1rem">
          {title}
        </Typography>
        <IconButton
          aria-label="close" onClick={onClose} size="small"
          sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Scrollable body ── */}
      <Box sx={{ overflowY: 'auto', flex: 1, px: { xs: 2, sm: 3 }, py: 2.5 }}>
        {children}
      </Box>
    </Dialog>
  );
}

export default ModalComponent;
