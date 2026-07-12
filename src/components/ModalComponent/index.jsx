// src/components/ModalComponent/index.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function ModalComponent({
  open,
  onClose,
  title,
  children,
  maxWidth = 'lg',           // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  fullWidth = true,
  scroll = 'paper',          // 'paper' or 'body'
  hideCloseButton = false,
  disableEscapeKeyDown = false,
  PaperProps = {},
  titleProps = {},
  contentProps = {},
  ...rest
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll={scroll}
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={{
        component: Paper,
        sx: {
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          maxHeight: '96vh',
          ...PaperProps.sx,
        },
        ...PaperProps,
      }}
      {...rest}
    >
      {/* Header */}
      {title && (
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: '#f8f9fa',
            ...titleProps.sx,
          }}
          {...titleProps}
        >
          <Typography
            variant="h6"
            component="div"
            fontWeight={700}
            fontSize="1.05rem"
          >
            {title}
          </Typography>

          {!hideCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>
      )}

      {/* Content */}
      <DialogContent
        dividers={scroll === 'paper'}
        sx={{
          p: { xs: 2, sm: 3 },
          overflowY: 'auto',
          maxHeight: 'calc(96vh - 80px)', // Adjust based on header height
          ...contentProps.sx,
        }}
        {...contentProps}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default ModalComponent;