import { useRef } from 'react';
import { Box, Typography, IconButton, FormHelperText } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import {
  PRODUCT_IMAGE_MIN,
  PRODUCT_IMAGE_MAX,
  ALLOWED_IMAGE_ACCEPT,
} from './AddNewProductData';
import { validateImageFile } from '../../AllProductuploadFields';

function ProductImageUpload({ images = [], onChange, error }) {
  const inputRef = useRef(null);
  const canAddMore = images.length < PRODUCT_IMAGE_MAX;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    if (!files.length) return;

    const remainingSlots = PRODUCT_IMAGE_MAX - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages = [];
    const fileErrors = [];

    filesToAdd.forEach((file) => {
      const err = validateImageFile(file);
      if (err) {
        fileErrors.push(`${file.name}: ${err}`);
        return;
      }
      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
      });
    });

    if (fileErrors.length) {
      onChange([...images, ...newImages], fileErrors.join('. '));
      return;
    }

    onChange([...images, ...newImages], '');
  };

  const handleRemove = (id) => {
    const removed = images.find((img) => img.id === id);
    if (removed?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(removed.preview);
    }
    onChange(
      images.filter((img) => img.id !== id),
      ''
    );
  };

  return (
    <Box className="add-new-product__images">
      <Typography variant="body2" fontWeight={500} gutterBottom>
        Product Images * ({PRODUCT_IMAGE_MIN}–{PRODUCT_IMAGE_MAX} images, JPG / JPEG / PNG)
      </Typography>

      <Box className="add-new-product__images-grid">
        {images.map((img, index) => (
          <Box key={img.id} className="add-new-product__image-card">
            <img src={img.preview || img.url} alt={img.name || `Product ${index + 1}`} />
            {index === 0 && (
              <span className="add-new-product__image-primary">Primary</span>
            )}
            <IconButton
              size="small"
              className="add-new-product__image-remove"
              onClick={() => handleRemove(img.id)}
              aria-label="Remove image"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        {canAddMore && (
          <Box
            className="add-new-product__image-upload-slot"
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          >
            <AddPhotoAlternateOutlinedIcon color="action" />
            <Typography variant="caption" color="text.secondary">
              {images.length === 0 ? 'Upload' : 'Add more'}
            </Typography>
          </Box>
        )}
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        multiple
        hidden
        onChange={handleFileSelect}
      />

      {images.length === 0 && (
        <Box
          className="add-new-product__images-dropzone"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="body2" fontWeight={500}>
            Click to upload product images
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Min {PRODUCT_IMAGE_MIN}, max {PRODUCT_IMAGE_MAX} · JPG, JPEG, PNG · up to 5MB each
          </Typography>
        </Box>
      )}

      {error && <FormHelperText error>{error}</FormHelperText>}
      {!error && images.length > 0 && (
        <FormHelperText>
          {images.length}/{PRODUCT_IMAGE_MAX} images uploaded · First image is the primary
        </FormHelperText>
      )}
    </Box>
  );
}

export default ProductImageUpload;
