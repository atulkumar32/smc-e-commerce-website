import { useRef, useState } from 'react';
import { Grid, Stack, Typography, Box, IconButton, Divider, Button } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import { VARIANT_IMAGE_MAX } from '../../AddNewVarientsData';

function ColorImageUpload({ color, images = [], onChange }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const addFiles = (files) => {
    const slots = VARIANT_IMAGE_MAX - images.length;
    const added = Array.from(files).slice(0, slots).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      isExisting: false,
    }));
    onChange([...images, ...added]);
  };

  const remove = (id) => onChange(images.filter(i => i.id !== id));

  const setMain = (id) => {
    const mainImg = images.find(i => i.id === id);
    const others = images.filter(i => i.id !== id);
    onChange([mainImg, ...others]);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        🖼️ {color.label}
      </Typography>

      <Box className="vi-slots">
        {Array.from({ length: VARIANT_IMAGE_MAX }).map((_, i) => {
          const img = images[i];
          return img ? (
            <Box key={img.id} className={`vi-slot vi-slot--filled${i === 0 ? ' vi-slot--main' : ''}`}>
              <img src={img.preview || img.url} alt="" />
              <span className="vi-slot__lbl">{i === 0 ? 'Main Image' : `Image ${i + 1}`}</span>
              <IconButton className="vi-slot__del" size="small" onClick={() => remove(img.id)}>
                <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
              </IconButton>
              {i !== 0 && (
                <button type="button" className="vi-slot__setmain" onClick={() => setMain(img.id)}>
                  Set Main
                </button>
              )}
            </Box>
          ) : (
            <Box key={`e${i}`} className="vi-slot vi-slot--empty" onClick={() => inputRef.current?.click()}>
              <span className="vi-slot__lbl vi-slot__lbl--empty">
                {i === 0 ? 'Main Image' : `Image ${i + 1}`}
              </span>
            </Box>
          );
        })}
      </Box>

      <Box 
        className={`vi-drop${drag ? ' vi-drop--over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
      >
        <CloudUploadOutlinedIcon className="vi-drop__icon" />
        <Box>
          <span className="vi-drop__link">Click to upload</span>
          <span className="vi-drop__text"> or drag and drop images</span>
        </Box>
      </Box>

      <input 
        ref={inputRef} 
        type="file" 
        multiple 
        accept="image/*" 
        hidden 
        onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} 
      />
    </Box>
  );
}

export default function RightsideSections({ form, onImageChange }) {
  const colors = form.color_name === 'Mixed' 
    ? (form.mixed_colors || []) 
    : form.color_name 
      ? [{ label: form.color_name }] 
      : [];

  const handleColorImagesChange = (colorName, newImages) => {
    onImageChange({ ...(form.colorImages || {}), [colorName]: newImages });
  };

  return (
    <Grid item xs={12} md={5}>
      <Typography className="apv__head" sx={{ mb: 2 }}>
        Color Images Upload
      </Typography>

      {colors.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 4 }}>
          Please select color(s) from the left panel first
        </Typography>
      ) : (
        colors.map((color, index) => (
          <Box key={color.label}>
            <ColorImageUpload
              color={color}
              images={form.colorImages?.[color.label] || []}
              onChange={(imgs) => handleColorImagesChange(color.label, imgs)}
            />
            {index < colors.length - 1 && <Divider sx={{ my: 4 }} />}
          </Box>
        ))
      )}
    </Grid>
  );
}