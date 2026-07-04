import { useRef } from 'react';
import {
  Box, Typography, IconButton, FormHelperText,
  Chip, Tooltip,
} from '@mui/material';
import CloudUploadOutlinedIcon     from '@mui/icons-material/CloudUploadOutlined';
import CloseIcon                   from '@mui/icons-material/Close';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import PaletteOutlinedIcon         from '@mui/icons-material/PaletteOutlined';
import {
  PRODUCT_IMAGE_MIN,
  PRODUCT_IMAGE_MAX,
  ALLOWED_IMAGE_ACCEPT,
  COLOR_OPTIONS,
} from './AddNewProductData';
import { validateImageFile } from '../../AllProductuploadFields';

/**
 * ProductImageUpload
 *
 * Extended to support per-image color assignment.
 * Each image card shows:
 *   - thumbnail
 *   - "Primary" badge on first
 *   - color chips for available product colors (from COLOR_OPTIONS)
 *   - remove button
 *
 * Props:
 *   images          – array of image objects (from form.images)
 *   onChange        – fn(images, errorMsg)
 *   error           – validation error string
 *   selectedColors  – array of { label, hex } currently selected for product
 */
function ProductImageUpload({ images = [], onChange, error, selectedColors = [] }) {
  const inputRef  = useRef(null);
  const canAddMore = images.length < PRODUCT_IMAGE_MAX;

  // ── File upload ───────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const remaining = PRODUCT_IMAGE_MAX - images.length;
    const toAdd     = files.slice(0, remaining);
    const newImgs   = [];
    const errs      = [];

    toAdd.forEach((file) => {
      const err = validateImageFile(file);
      if (err) { errs.push(`${file.name}: ${err}`); return; }
      newImgs.push({
        id:         crypto.randomUUID(),
        file,
        preview:    URL.createObjectURL(file),
        name:       file.name,
        type:       file.type,
        colorLabel: '',
        colorHex:   '',
      });
    });

    onChange([...images, ...newImgs], errs.join('. '));
  };

  // ── Remove image ──────────────────────────────────────────────
  const handleRemove = (id) => {
    const removed = images.find((img) => img.id === id);
    if (removed?.preview?.startsWith('blob:')) URL.revokeObjectURL(removed.preview);
    onChange(images.filter((img) => img.id !== id), '');
  };

  // ── Assign a color to an image ────────────────────────────────
  const handleColorAssign = (imgId, color) => {
    // Toggle: if same color already assigned, clear it
    const updated = images.map((img) => {
      if (img.id !== imgId) return img;
      const isSame = img.colorLabel === color.label;
      return {
        ...img,
        colorLabel: isSame ? '' : color.label,
        colorHex:   isSame ? '' : color.hex,
      };
    });
    onChange(updated, '');
  };

  // Colors to show — use product's selectedColors, fallback to common palette
  const colorPalette = selectedColors.length > 0 ? selectedColors : COLOR_OPTIONS.slice(0, 6);

  return (
    <Box className="add-new-product__images">
      <Typography variant="body2" fontWeight={600} gutterBottom sx={{ fontSize: '0.82rem' }}>
        Product Images *
        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          ({PRODUCT_IMAGE_MIN}–{PRODUCT_IMAGE_MAX} · JPG, PNG · max 5 MB each)
        </Typography>
      </Typography>

      {/* ── Image cards grid ── */}
      <Box className="add-new-product__images-grid" sx={{ flexWrap: 'wrap', gap: '12px', display: 'flex', mb: 1.5 }}>
        {images.map((img, index) => (
          <Box
            key={img.id}
            sx={{
              position: 'relative',
              width: 110,
              borderRadius: '8px',
              overflow: 'visible',
              flexShrink: 0,
            }}
          >
            {/* Thumbnail */}
            <Box
              className="add-new-product__image-card"
              sx={{ width: 110, height: 110, borderRadius: '8px', overflow: 'hidden',
                border: img.colorHex ? `2.5px solid ${img.colorHex}` : '1.5px solid #e8eaed',
                position: 'relative', bgcolor: '#f8f9fa' }}
            >
              <img
                src={img.preview || img.url}
                alt={img.name || `Product ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Primary badge */}
              {index === 0 && (
                <Box sx={{
                  position: 'absolute', bottom: 4, left: 4,
                  bgcolor: '#1565c0', color: '#fff',
                  fontSize: '0.58rem', fontWeight: 700,
                  px: 0.75, borderRadius: '3px', letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  Primary
                </Box>
              )}

              {/* Color dot indicator */}
              {img.colorHex && (
                <Tooltip title={img.colorLabel} placement="top">
                  <Box sx={{
                    position: 'absolute', top: 4, left: 4,
                    width: 14, height: 14, borderRadius: '50%',
                    bgcolor: img.colorHex,
                    border: '1.5px solid rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                  }} />
                </Tooltip>
              )}

              {/* Remove button */}
              <IconButton
                size="small"
                onClick={() => handleRemove(img.id)}
                aria-label="Remove image"
                sx={{
                  position: 'absolute', top: 3, right: 3,
                  bgcolor: 'rgba(0,0,0,0.45)', color: '#fff',
                  p: '2px',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.72)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>

            {/* Color assignment row */}
            {colorPalette.length > 0 && (
              <Box sx={{
                mt: 0.75,
                display: 'flex', flexWrap: 'wrap', gap: '4px',
                justifyContent: 'center',
              }}>
                {colorPalette.map((c) => {
                  const isSelected = img.colorLabel === c.label;
                  return (
                    <Tooltip key={c.label} title={c.label} placement="top">
                      <Box
                        onClick={() => handleColorAssign(img.id, c)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleColorAssign(img.id, c)}
                        aria-label={`Assign color ${c.label}`}
                        aria-pressed={isSelected}
                        sx={{
                          width: 16, height: 16,
                          borderRadius: '50%',
                          bgcolor: c.hex,
                          border: isSelected
                            ? '2.5px solid #1565c0'
                            : '1.5px solid rgba(0,0,0,0.18)',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          transition: 'transform 0.15s, border 0.15s',
                          '&:hover': { transform: 'scale(1.25)' },
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            )}

            {/* Color label text */}
            {img.colorLabel && (
              <Typography variant="caption"
                sx={{ display: 'block', textAlign: 'center', mt: 0.25,
                  fontSize: '0.65rem', color: '#6b7280', lineHeight: 1 }}>
                {img.colorLabel}
              </Typography>
            )}
          </Box>
        ))}

        {/* Add more slot */}
        {canAddMore && (
          <Box
            onClick={() => inputRef.current?.click()}
            role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            sx={{
              width: 110, height: 110,
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '4px',
              cursor: 'pointer', bgcolor: '#f8f9fa', flexShrink: 0,
              transition: 'border-color .2s, background .2s',
              '&:hover': { borderColor: '#1565c0', bgcolor: '#eff6ff' },
            }}
          >
            <AddPhotoAlternateOutlinedIcon color="action" fontSize="small" />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {images.length === 0 ? 'Upload' : 'Add more'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Drop zone (shown when no images) ── */}
      {images.length === 0 && (
        <Box
          onClick={() => inputRef.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            p: '2rem 1rem',
            border: '2px dashed #d1d5db', borderRadius: '10px',
            bgcolor: '#f8f9fa', cursor: 'pointer', textAlign: 'center',
            transition: 'border-color .2s, background .2s',
            '&:hover': { borderColor: '#1565c0', bgcolor: '#eff6ff' },
          }}
        >
          <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="body2" fontWeight={500}>Click to upload product images</Typography>
          <Typography variant="caption" color="text.secondary">
            Min {PRODUCT_IMAGE_MIN}, max {PRODUCT_IMAGE_MAX} · JPG, PNG · up to 5 MB each
          </Typography>
        </Box>
      )}

      {/* ── Hint about color assignment ── */}
      {images.length > 0 && colorPalette.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <PaletteOutlinedIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
          <Typography variant="caption" color="text.secondary">
            Click the color dots under each image to assign which color it represents
          </Typography>
        </Box>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        multiple
        hidden
        onChange={handleFileSelect}
      />

      {error && <FormHelperText error sx={{ mt: 0.5 }}>{error}</FormHelperText>}
      {!error && images.length > 0 && (
        <FormHelperText sx={{ mt: 0.25 }}>
          {images.length}/{PRODUCT_IMAGE_MAX} images ·
          {images.filter(i => i.colorLabel).length}/{images.length} color-assigned ·
          First image is primary
        </FormHelperText>
      )}
    </Box>
  );
}

export default ProductImageUpload;
