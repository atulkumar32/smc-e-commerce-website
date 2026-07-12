import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

import { COLOR_OPTIONS, VARIANT_IMAGE_MAX } from '../AddNewVarientsData';

function SingleColorRow({ colorItem, onUpdate, onRemove }) {
  const [drag, setDrag] = useState(false);
  const inputRef = React.useRef(null);

  const addImages = (files) => {
    const currentImages = colorItem.images || [];
    const slotsLeft = VARIANT_IMAGE_MAX - currentImages.length;
    const newImages = Array.from(files).slice(0, slotsLeft).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    onUpdate({ ...colorItem, images: [...currentImages, ...newImages] });
  };

  const removeImage = (id) => {
    onUpdate({
      ...colorItem,
      images: colorItem.images.filter(img => img.id !== id)
    });
  };

  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, mb: 3, bgcolor: '#fff' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: colorItem.hex }} />
          <Typography variant="h6">{colorItem.label}</Typography>
        </Stack>
        <IconButton color="error" onClick={onRemove}>
          <DeleteOutlinedIcon />
        </IconButton>
      </Stack>

      {/* Images Upload */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        {Array.from({ length: VARIANT_IMAGE_MAX }).map((_, i) => {
          const img = colorItem.images?.[i];
          return img ? (
            <Box 
              key={img.id} 
              sx={{ 
                position: 'relative', width: 140, height: 140, 
                borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd'
              }}
            >
              <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {i === 0 && <Box sx={{ position: 'absolute', top: 6, left: 6, bgcolor: 'primary.main', color: '#fff', px: 1, py: 0.3, borderRadius: 1, fontSize: 11 }}>MAIN</Box>}
              <IconButton size="small" sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.7)' }} onClick={() => removeImage(img.id)}>
                <DeleteOutlinedIcon sx={{ color: '#fff', fontSize: 18 }} />
              </IconButton>
            </Box>
          ) : (
            <Box 
              key={i}
              onClick={() => inputRef.current?.click()}
              sx={{ 
                width: 140, height: 140, border: '2px dashed #ccc', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <Typography variant="caption" color="text.secondary">Image {i+1}</Typography>
            </Box>
          );
        })}
      </Box>

      {/* Dropzone */}
      <Box 
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addImages(e.dataTransfer.files); }}
        sx={{ 
          textAlign: 'center', py: 4, border: `2px dashed ${drag ? '#1976d2' : '#bbb'}`, 
          borderRadius: 2, cursor: 'pointer', background: drag ? '#f0f7ff' : 'transparent'
        }}
      >
        <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: '#666', mb: 1 }} />
        <Typography>Click or Drag Images Here</Typography>
        <Typography variant="caption" color="text.secondary">Max {VARIANT_IMAGE_MAX} images per color</Typography>
      </Box>

      <input 
        ref={inputRef} 
        type="file" 
        multiple 
        accept="image/*" 
        hidden 
        onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} 
      />
    </Box>
  );
}

export default function ColorsImagesSection({ selectedColors, onColorsChange }) {
  const [selectedColorOption, setSelectedColorOption] = useState('');

  const addNewColor = () => {
    if (!selectedColorOption) {
      alert("Please select a color from dropdown");
      return;
    }

    const alreadyAdded = selectedColors.some(c => c.label === selectedColorOption);
    if (alreadyAdded) {
      alert("This color is already added!");
      return;
    }

    const colorData = COLOR_OPTIONS.find(c => c.label === selectedColorOption);
    if (!colorData) return;

    const newColor = { ...colorData, images: [] };
    onColorsChange([...selectedColors, newColor]);
    setSelectedColorOption(''); // Reset dropdown
  };

  const updateColor = (index, updatedColor) => {
    const newColors = [...selectedColors];
    newColors[index] = updatedColor;
    onColorsChange(newColors);
  };

  const removeColor = (index) => {
    onColorsChange(selectedColors.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography className="apv__head" sx={{ mb: 3 }}>Colors & Images</Typography>

      {/* Dropdown + Add Button */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel>Select Color</InputLabel>
          <Select
            value={selectedColorOption}
            label="Select Color"
            onChange={(e) => setSelectedColorOption(e.target.value)}
          >
            <MenuItem value="">-- Select Color --</MenuItem>
            {COLOR_OPTIONS.map((color) => (
              <MenuItem key={color.label} value={color.label}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', background: color.hex, border: '1px solid #ddd' }} />
                  {color.label}
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          startIcon={<AddCircleOutlinedIcon />} 
          onClick={addNewColor}
          disabled={!selectedColorOption}
        >
          Add Color
        </Button>
      </Stack>

      {/* Color Rows with Image Upload */}
      {selectedColors.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography>No colors added yet</Typography>
          <Typography variant="body2">Select a color from dropdown and click "Add Color"</Typography>
        </Box>
      ) : (
        selectedColors.map((colorItem, index) => (
          <SingleColorRow 
            key={index} 
            colorItem={colorItem} 
            onUpdate={(updated) => updateColor(index, updated)}
            onRemove={() => removeColor(index)}
          />
        ))
      )}
    </Box>
  );
}   