import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, Stack,
  CircularProgress, Alert,
  Autocomplete, TextField,
} from '@mui/material';
import AddCircleOutlinedIcon  from '@mui/icons-material/AddCircleOutlined';
import DeleteOutlinedIcon     from '@mui/icons-material/DeleteOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

import { VARIANT_IMAGE_MAX } from '../AddNewVarientsData';
import { URL_GET_VARIANT_COLORS } from '../../../../../../Config/UrlsConfig';

// ── Fetch colours from API ────────────────────────────────────────────────────
function useVariantColors() {
  const [colors,  setColors]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(URL_GET_VARIANT_COLORS)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        // API shape: { success, data: [{ id, name, code }] }
        const list = Array.isArray(data.data) ? data.data : [];
        setColors(list.map((c) => ({ id: c.id, label: c.name, hex: c.code })));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load colours');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { colors, loading, error };
}

// ── Single colour row ─────────────────────────────────────────────────────────
function SingleColorRow({ colorItem, onUpdate, onRemove }) {
  const [drag, setDrag] = useState(false);
  const inputRef = React.useRef(null);

  const addImages = (files) => {
    const current   = colorItem.images || [];
    const slotsLeft = VARIANT_IMAGE_MAX - current.length;
    const newImgs   = Array.from(files).slice(0, slotsLeft).map((file) => ({
      id:      crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    onUpdate({ ...colorItem, images: [...current, ...newImgs] });
  };

  const removeImage = (id) =>
    onUpdate({ ...colorItem, images: colorItem.images.filter((img) => img.id !== id) });

  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, mb: 3, bgcolor: '#fff' }}>
      {/* Row header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 24, height: 24, borderRadius: '50%',
            background: colorItem.hex, border: '1px solid rgba(0,0,0,0.15)',
          }} />
          <Typography variant="h6">{colorItem.label}</Typography>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#6b7280' }}>
            {colorItem.hex}
          </Typography>
        </Stack>
        <IconButton color="error" onClick={onRemove}>
          <DeleteOutlinedIcon />
        </IconButton>
      </Stack>

      {/* Image slots */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        {Array.from({ length: VARIANT_IMAGE_MAX }).map((_, i) => {
          const img = colorItem.images?.[i];
          return img ? (
            <Box key={img.id} sx={{
              position: 'relative', width: 140, height: 140,
              borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd',
            }}>
              <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {i === 0 && (
                <Box sx={{
                  position: 'absolute', top: 6, left: 6,
                  bgcolor: 'primary.main', color: '#fff',
                  px: 1, py: 0.3, borderRadius: 1, fontSize: 11,
                }}>
                  MAIN
                </Box>
              )}
              <IconButton size="small"
                sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.7)' }}
                onClick={() => removeImage(img.id)}>
                <DeleteOutlinedIcon sx={{ color: '#fff', fontSize: 18 }} />
              </IconButton>
            </Box>
          ) : (
            <Box key={i} onClick={() => inputRef.current?.click()} sx={{
              width: 140, height: 140,
              border: '2px dashed #ccc', borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: '#1976d2', bgcolor: '#f0f7ff' },
            }}>
              <Typography variant="caption" color="text.secondary">Image {i + 1}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* Drop zone */}
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addImages(e.dataTransfer.files); }}
        sx={{
          textAlign: 'center', py: 4,
          border: `2px dashed ${drag ? '#1976d2' : '#bbb'}`,
          borderRadius: 2, cursor: 'pointer',
          background: drag ? '#f0f7ff' : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: '#666', mb: 1 }} />
        <Typography>Click or Drag Images Here</Typography>
        <Typography variant="caption" color="text.secondary">
          Max {VARIANT_IMAGE_MAX} images per colour
        </Typography>
      </Box>

      <input
        ref={inputRef} type="file" multiple accept="image/*" hidden
        onChange={(e) => { addImages(e.target.files); e.target.value = ''; }}
      />
    </Box>
  );
}

// ── Main section ─────────────────────────────────────────────────────────────
export default function ColorsImagesSection({ selectedColors, onColorsChange }) {
  const { colors: colorOptions, loading: colorsLoading, error: colorsError } = useVariantColors();
  const [selectedColorOption, setSelectedColorOption] = useState(null); // { id, label, hex }

  const addNewColor = () => {
    if (!selectedColorOption) return;

    const alreadyAdded = selectedColors.some((c) => c.id === selectedColorOption.id);
    if (alreadyAdded) {
      alert('This colour is already added!');
      return;
    }

    onColorsChange([...selectedColors, { ...selectedColorOption, images: [] }]);
    setSelectedColorOption(null);
  };

  const updateColor = (index, updatedColor) => {
    const next = [...selectedColors];
    next[index] = updatedColor;
    onColorsChange(next);
  };

  const removeColor = (index) =>
    onColorsChange(selectedColors.filter((_, i) => i !== index));

  return (
    <Box>
      <Typography className="apv__head" sx={{ mb: 3 }}>Colors &amp; Images</Typography>

      {/* API error */}
      {colorsError && (
        <Alert severity="error" sx={{ mb: 2 }}>{colorsError}</Alert>
      )}

      {/* Searchable dropdown + Add button */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Autocomplete
          size="small"
          sx={{ minWidth: 260 }}
          options={colorOptions}
          loading={colorsLoading}
          value={selectedColorOption}
          onChange={(_, val) => setSelectedColorOption(val)}
          getOptionLabel={(opt) => opt.label ?? ''}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
          // Filter by name as user types
          filterOptions={(opts, { inputValue }) =>
            opts.filter((o) =>
              o.label.toLowerCase().includes(inputValue.toLowerCase())
            )
          }
          renderOption={(props, option) => {
            const { key, ...restProps } = props;
            return (
              <Box component="li" key={key} {...restProps}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: option.hex,
                    border: '1px solid rgba(0,0,0,0.15)',
                    flexShrink: 0,
                  }} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{option.label}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#9ca3af' }}>
                      {option.hex}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Colour"
              placeholder="Search colour…"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {colorsLoading && <CircularProgress size={16} sx={{ mr: 1 }} />}
                    {params.InputProps?.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Button
          variant="contained"
          startIcon={<AddCircleOutlinedIcon />}
          onClick={addNewColor}
          disabled={!selectedColorOption || colorsLoading}
        >
          Add Color
        </Button>
      </Stack>

      {/* Colour rows with image upload */}
      {selectedColors.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography>No colours added yet</Typography>
          <Typography variant="body2">
            Search and select a colour above, then click "Add Color"
          </Typography>
        </Box>
      ) : (
        selectedColors.map((colorItem, index) => (
          <SingleColorRow
            key={colorItem.id ?? index}
            colorItem={colorItem}
            onUpdate={(updated) => updateColor(index, updated)}
            onRemove={() => removeColor(index)}
          />
        ))
      )}
    </Box>
  );
}
