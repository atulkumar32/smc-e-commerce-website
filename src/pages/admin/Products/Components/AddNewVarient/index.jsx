import { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Typography, Button, Alert, Stack, Chip, IconButton, Table,
  TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './index.scss';

import { emptyVariantForm } from './AddNewVarientsData';
import { createVariantsBulkAction, fetchVariantsAction } from '../../../../../Actions/ProductVariantAction';

import LeftsideSections from './Components/LeftsideSections';
import ColorsImagesSection from './Components/ColorsImagesSection';

function StagedTable({ staged, savedVariants, onRemoveStaged }) {
  const allRows = [
    ...staged.map(v => ({ ...v, _source: 'staged' })),
    ...savedVariants.map(v => ({ ...v, _source: 'saved' })),
  ];

  const Dot = ({ hex }) => (
    <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: hex || '#ccc', border: '1px solid #ddd' }} />
  );

  return (
    <Box className="apv__list" sx={{ mt: 5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography className="apv__list-head">Variant List</Typography>
      </Stack>

      <Box className="apv__list-table">
        <Table size="small">
          <TableHead>
            <TableRow>
              {['#', 'Color', 'Size', 'MRP', 'Discount%', 'Selling', 'Stock', 'Default', 'State', 'Actions'].map(h => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {allRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  No variants added yet
                </TableCell>
              </TableRow>
            ) : (
              allRows.map((v, i) => (
                <TableRow key={v._localId || v.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Dot hex={v.color_hex} /> {v.color_name}
                    </Stack>
                  </TableCell>
                  <TableCell>{v.size || 'Free Size'}</TableCell>
                  <TableCell>₹{Number(v.mrp || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell>{v.discount_percent || 0}%</TableCell>
                  <TableCell>₹{Number(v.selling_price || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell>{v.stock || 0}</TableCell>
                  <TableCell>{v.is_default ? <CheckCircleIcon color="primary" /> : '—'}</TableCell>
                  <TableCell>
                    <Chip label={v._source === 'staged' ? 'Pending' : 'Saved'} size="small" color={v._source === 'staged' ? 'warning' : 'success'} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => onRemoveStaged(v._localId)}>
                      <DeleteOutlinedIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

function AddNewVariant({ productId, onSuccess }) {
  const [form, setForm] = useState(emptyVariantForm);
  const [staged, setStaged] = useState([]);
  const [savedVariants, setSavedVariants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const formTopRef = useRef(null);

  useEffect(() => {
    if (!productId) return;
    fetchVariantsAction(productId).then(res => setSavedVariants(Array.isArray(res) ? res : []));
  }, [productId]);

  const handleFieldChange = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleColorsChange = (newColors) => {
    setForm(p => ({ ...p, selectedColors: newColors }));
  };

  // ✅ Build Payload Exactly as Requested
  const handleAddToList = () => {
    if (!form.selectedColors || form.selectedColors.length === 0) {
      alert("Please add at least one color");
      return;
    }

    const newVariants = form.selectedColors.map((colorItem) => ({
      color_name: colorItem.label,
      color_hex: colorItem.hex,
      size: form.size || 'Free Size',
      mrp: Number(form.mrp || 0),
      discount_percent: Math.max(0, Math.min(100, Number(form.discount_percent || 0))),
      selling_price: Number(form.selling_price || 0),
      stock: Number(form.stock || 0),
      status: form.status || 'active',
      is_default: Boolean(form.is_default),
      images: colorItem.images || [],           // Images per color
      _localId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      _source: 'staged',
    }));

    setStaged(prev => [...prev, ...newVariants]);
    setForm(emptyVariantForm); // Reset form after adding
  };

  const handleSaveAll = async () => {
    if (staged.length === 0) return;

    setSaving(true);
    try {
      // Send clean payload
      await createVariantsBulkAction(productId, { variants: staged });
      onSuccess?.();
      setStaged([]);
    } catch (err) {
      setSubmitError(err.message || 'Failed to save variants');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="apv">
      <Box ref={formTopRef} />

      <Grid container spacing={4}>
        <LeftsideSections 
          productId={productId} 
          form={form} 
          onChange={handleFieldChange} 
        />

        <ColorsImagesSection 
          selectedColors={form.selectedColors || []} 
          onColorsChange={handleColorsChange} 
        />
      </Grid>

      <Box sx={{ textAlign: 'right', mt: 4 }}>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<AddCircleOutlinedIcon />} 
          onClick={handleAddToList}
        >
          Add Variants to List
        </Button>
      </Box>

      <StagedTable 
        staged={staged} 
        savedVariants={savedVariants} 
        onRemoveStaged={(id) => setStaged(p => p.filter(v => v._localId !== id))}
      />

      {staged.length > 0 && (
        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<SaveOutlinedIcon />} 
            onClick={handleSaveAll} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save All Variants'}
          </Button>
        </Box>
      )}

      {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
    </Box>
  );
}

export default AddNewVariant;


// import { useState, useEffect, useRef, useMemo } from 'react';
// import {
//   Box, Grid, Typography, TextField, Button, IconButton,
//   FormControl, InputLabel, Select, MenuItem, Switch,
//   FormControlLabel, Alert, CircularProgress, Stack,
//   InputAdornment, Chip, Table, TableHead, TableRow,
//   TableCell, TableBody, Tooltip, Paper,
// } from '@mui/material';
// import DeleteOutlinedIcon      from '@mui/icons-material/DeleteOutlined';
// import EditOutlinedIcon        from '@mui/icons-material/EditOutlined';
// import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
// import InfoOutlinedIcon        from '@mui/icons-material/InfoOutlined';
// import AddCircleOutlinedIcon   from '@mui/icons-material/AddCircleOutlined';
// import CheckCircleIcon         from '@mui/icons-material/CheckCircle';
// import SaveOutlinedIcon        from '@mui/icons-material/SaveOutlined';
// import './index.scss';
// import {
//   emptyVariantForm, validateVariantForm,
//   SIZE_OPTIONS, COLOR_OPTIONS, STATUS_OPTIONS,
//   VARIANT_IMAGE_MAX,
// } from './AddNewVarientsData';
// import {
//   createVariantsBulkAction,
//   deleteVariantAction,
//   fetchVariantsAction,
// } from '../../../../../Actions/ProductVariantAction';

// // ── Colour dot ────────────────────────────────────────────────────────────────
// const Dot = ({ hex, size = 13 }) => (
//   <span style={{
//     display: 'inline-block', width: size, height: size, borderRadius: '50%',
//     background: hex || '#ccc', border: '1px solid rgba(0,0,0,0.18)', flexShrink: 0,
//   }} />
// );

// // ── Image Upload Panel ────────────────────────────────────────────────────────
// function ImageUpload({ images, onChange }) {
//   const inputRef = useRef(null);
//   const [drag, setDrag] = useState(false);

//   const addFiles = (files) => {
//     const slots = VARIANT_IMAGE_MAX - images.length;
//     const added = Array.from(files).slice(0, slots).map((f) => ({
//       id: crypto.randomUUID(), file: f,
//       preview: URL.createObjectURL(f), name: f.name, isExisting: false,
//     }));
//     onChange([...images, ...added]);
//   };

//   const remove = (id) => {
//     const img = images.find((i) => i.id === id);
//     if (img?.preview?.startsWith('blob:')) URL.revokeObjectURL(img.preview);
//     onChange(images.filter((i) => i.id !== id));
//   };

//   const setMain = (id) => onChange([
//     ...images.filter((i) => i.id === id),
//     ...images.filter((i) => i.id !== id),
//   ]);

//   return (
//     <Box>
//       <Box className="vi-slots">
//         {Array.from({ length: VARIANT_IMAGE_MAX }).map((_, i) => {
//           const img = images[i];
//           return img ? (
//             <Box key={img.id} className={`vi-slot vi-slot--filled${i === 0 ? ' vi-slot--main' : ''}`}>
//               <img src={img.preview || img.url} alt={`img-${i + 1}`} />
//               <span className="vi-slot__lbl">{i === 0 ? 'Main Image' : `Image ${i + 1}`}</span>
//               <IconButton className="vi-slot__del" size="small" onClick={() => remove(img.id)}>
//                 <DeleteOutlinedIcon sx={{ fontSize: 11 }} />
//               </IconButton>
//               {i !== 0 && (
//                 <button type="button" className="vi-slot__setmain" onClick={() => setMain(img.id)}>
//                   Set Main
//                 </button>
//               )}
//             </Box>
//           ) : (
//             <Box key={`e${i}`} className="vi-slot vi-slot--empty"
//               onClick={() => inputRef.current?.click()}>
//               <span className="vi-slot__lbl vi-slot__lbl--empty">
//                 {i === 0 ? 'Main Image' : `Image ${i + 1}`}
//               </span>
//             </Box>
//           );
//         })}
//       </Box>

//       <Box className={`vi-drop${drag ? ' vi-drop--over' : ''}`}
//         onClick={() => inputRef.current?.click()}
//         onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
//         onDragLeave={() => setDrag(false)}
//         onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
//         <CloudUploadOutlinedIcon className="vi-drop__icon" />
//         <Box>
//           <span className="vi-drop__link">Click to upload</span>
//           <span className="vi-drop__text"> or drag and drop</span>
//         </Box>
//         <span className="vi-drop__sub">PNG, JPG, WEBP up to 5MB each</span>
//       </Box>

//       <input ref={inputRef} type="file" multiple accept="image/*" hidden
//         onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />

//       <Box className="vi-guide">
//         <Box className="vi-guide__head"><InfoOutlinedIcon sx={{ fontSize: 13 }} /> Image Guidelines</Box>
//         {[
//           'First image will be the main product image',
//           `Upload minimum 1, maximum ${VARIANT_IMAGE_MAX} images`,
//           'Recommended size: 800×800px or larger',
//           'Supported formats: JPG, PNG, WEBP',
//           'Max file size: 5MB per image',
//         ].map((t) => <Box key={t} className="vi-guide__row">• {t}</Box>)}
//       </Box>
//     </Box>
//   );
// }

// // ── Variant Form ──────────────────────────────────────────────────────────────
// function VariantForm({ productId, form, errors, editingLocalId, onChange, onImageChange }) {
//   const set = (e) => onChange(e.target.name, e.target.value);

//   // Auto-calculate selling price when MRP or discount% changes
//   const handleMrpChange = (e) => {
//     const mrp = e.target.value;
//     onChange('mrp', mrp);
//     if (form.discount_percent && Number(mrp) > 0) {
//       const sp = (Number(mrp) * (1 - Number(form.discount_percent) / 100)).toFixed(2);
//       onChange('selling_price', sp);
//     }
//   };

//   const handleDiscountChange = (e) => {
//     const pct = e.target.value;
//     onChange('discount_percent', pct);
//     if (form.mrp && Number(form.mrp) > 0 && pct !== '') {
//       const sp = (Number(form.mrp) * (1 - Number(pct) / 100)).toFixed(2);
//       onChange('selling_price', sp);
//     }
//   };

//   return (
//     <Grid container spacing={3}>
//       {/* ── LEFT — details ── */}
//       <Grid item xs={12} md={7}>
//         <Typography className="apv__head">
//           {editingLocalId ? '✏️ Edit Variant' : 'Variant Details'}
//         </Typography>

//         <Grid container spacing={2}>
//           {/* Product ID — read-only */}
//           <Grid item xs={12} sm={6}>
//             <TextField fullWidth size="small" label="Product ID"
//               value={productId || ''}
//               InputProps={{ readOnly: true }}
//               helperText="Auto-filled from selected product"
//               sx={{ '& .MuiInputBase-root': { bgcolor: '#f8f9fb' } }} />
//           </Grid>

//           {/* Color */}
//           <Grid item xs={12} sm={6}>
//             <FormControl fullWidth size="small" error={!!errors.color_name}>
//               <InputLabel>Color *</InputLabel>
//               <Select name="color_name" value={form.color_name} onChange={set} label="Color *"
//                 renderValue={(v) => {
//                   const c = COLOR_OPTIONS.find((x) => x.label === v);
//                   return <Stack direction="row" alignItems="center" spacing={1}>
//                     {c && <Dot hex={c.hex} size={14} />}<span>{v}</span>
//                   </Stack>;
//                 }}>
//                 {COLOR_OPTIONS.map((c) => (
//                   <MenuItem key={c.label} value={c.label}>
//                     <Stack direction="row" alignItems="center" spacing={1}>
//                       <Dot hex={c.hex} size={13} /><span>{c.label}</span>
//                     </Stack>
//                   </MenuItem>
//                 ))}
//               </Select>
//               {errors.color_name && (
//                 <Typography variant="caption" color="error" sx={{ mt: 0.25, ml: 1.75 }}>
//                   {errors.color_name}
//                 </Typography>
//               )}
//             </FormControl>
//           </Grid>

//           {/* Size */}
//           <Grid item xs={12} sm={6}>
//             <FormControl fullWidth size="small" error={!!errors.size}>
//               <InputLabel>Size *</InputLabel>
//               <Select name="size" value={form.size} onChange={set} label="Size *">
//                 {SIZE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
//               </Select>
//               {errors.size && (
//                 <Typography variant="caption" color="error" sx={{ mt: 0.25, ml: 1.75 }}>
//                   {errors.size}
//                 </Typography>
//               )}
//             </FormControl>
//           </Grid>

//           {/* MRP */}
//           <Grid item xs={12} sm={6}>
//             <TextField fullWidth size="small" label="MRP *" type="number"
//               name="mrp" value={form.mrp} onChange={handleMrpChange}
//               error={!!errors.mrp} helperText={errors.mrp}
//               InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
//           </Grid>

//           {/* Discount % — auto-calc selling */}
//           <Grid item xs={12} sm={6}>
//             <TextField fullWidth size="small" label="Discount %" type="number"
//               name="discount_percent" value={form.discount_percent} onChange={handleDiscountChange}
//               helperText={
//                 form.mrp && form.discount_percent
//                   ? `Selling = ₹${(Number(form.mrp) * (1 - Number(form.discount_percent) / 100)).toFixed(2)}`
//                   : 'Enter % to auto-fill selling price'
//               }
//               InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
//           </Grid>

//           {/* Selling Price — editable override */}
//           <Grid item xs={12} sm={6}>
//             <TextField fullWidth size="small" label="Selling Price *" type="number"
//               name="selling_price" value={form.selling_price} onChange={set}
//               error={!!errors.selling_price} helperText={errors.selling_price || 'Auto-filled from Discount %'}
//               InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
//           </Grid>

//           {/* Stock */}
//           <Grid item xs={12} sm={6}>
//             <TextField fullWidth size="small" label="Stock *" type="number"
//               name="stock" value={form.stock} onChange={set}
//               error={!!errors.stock} helperText={errors.stock}
//               InputProps={{ endAdornment: <InputAdornment position="end">pcs</InputAdornment> }} />
//           </Grid>

//           {/* Status */}
//           <Grid item xs={12} sm={6}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Status</InputLabel>
//               <Select name="status" value={form.status} onChange={set} label="Status">
//                 {STATUS_OPTIONS.map((s) => (
//                   <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>

//           {/* Default toggle */}
//           <Grid item xs={12} sm={6}>
//             <Box className="apv__toggle">
//               <FormControlLabel
//                 control={<Switch size="small" color="primary" checked={Boolean(form.is_default)}
//                   onChange={(e) => onChange('is_default', e.target.checked)} />}
//                 label={<Typography variant="body2" fontWeight={600}>Default Variant</Typography>}
//                 sx={{ ml: 0, mb: 0 }} />
//               <Typography variant="caption" color="text.secondary" display="block">
//                 This will be the default selected variant
//               </Typography>
//             </Box>
//           </Grid>
//         </Grid>
//       </Grid>

//       {/* ── RIGHT — images ── */}
//       <Grid item xs={12} md={5}>
//         <Stack direction="row" alignItems="baseline" spacing={1} mb={0.5}>
//           <Typography className="apv__head" sx={{ mb: '0 !important' }}>Variant Images</Typography>
//           <Typography variant="caption" color="text.secondary">(Max {VARIANT_IMAGE_MAX})</Typography>
//         </Stack>
//         <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
//           First image will be the main display image
//         </Typography>
//         <Box className="apv__imgcard">
//           <ImageUpload images={form.images} onChange={onImageChange} />
//         </Box>
//       </Grid>
//     </Grid>
//   );
// }

// // ── Staged Variant Table ──────────────────────────────────────────────────────
// function StagedTable({ staged, savedVariants, editingLocalId, onEdit, onRemoveStaged, onDeleteSaved, onAddNew }) {
//   const allRows = [
//     ...staged.map((v) => ({ ...v, _source: 'staged' })),
//     ...savedVariants.map((v) => ({ ...v, _source: 'saved' })),
//   ];

//   return (
//     <Box className="apv__list">
//       <Stack direction="row" alignItems="center" justifyContent="space-between" className="apv__list-toolbar">
//         <Typography className="apv__list-head">
//           Variant List
//           {staged.length > 0 && (
//             <Chip label={`${staged.length} pending`} size="small" color="warning"
//               sx={{ ml: 1, fontSize: '0.65rem' }} />
//           )}
//           {savedVariants.length > 0 && (
//             <Chip label={`${savedVariants.length} saved`} size="small" color="success"
//               sx={{ ml: 0.5, fontSize: '0.65rem' }} />
//           )}
//         </Typography>
//         <Button type="button" size="small" variant="text" className="apv__add-btn"
//           startIcon={<AddCircleOutlinedIcon sx={{ fontSize: 18 }} />}
//           onClick={() => onAddNew?.()}>
//           + Add New Variant
//         </Button>
//       </Stack>

//       <Box className="apv__list-table">
//         <Table size="small">
//           <TableHead>
//             <TableRow>
//               {['#','Color','Size','MRP','Discount%','Selling','Stock','Status','Default','State','Actions'].map((h) => (
//                 <TableCell key={h} className="apv__th">{h}</TableCell>
//               ))}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {allRows.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={11} className="apv__empty-cell">
//                   No variants yet. Fill the form above and click "Add to List".
//                 </TableCell>
//               </TableRow>
//             ) : (
//               allRows.map((v, i) => {
//                 const isEditing = v._source === 'staged' && v._localId === editingLocalId;
//                 const isActive  = v.status === '1' || v.status === 'active' || v.status === 1;
//                 const discPct   = v.discount_percent ? `${v.discount_percent}%` : '—';

//                 return (
//                   <TableRow key={v._localId || v.variant_id || v.id} hover
//                     className={`apv__tr${isEditing ? ' apv__tr--editing' : ''}`}>
//                     <TableCell className="apv__td apv__td--num">{i + 1}</TableCell>
//                     <TableCell className="apv__td">
//                       <Stack direction="row" alignItems="center" spacing={0.75}>
//                         <Dot hex={v.color_hex} size={12} />
//                         <span>{v.color_name || '—'}</span>
//                       </Stack>
//                     </TableCell>
//                     <TableCell className="apv__td">{v.size || '—'}</TableCell>
//                     <TableCell className="apv__td">
//                       {Number(v.mrp) > 0 ? `₹${Number(v.mrp).toLocaleString('en-IN')}` : '—'}
//                     </TableCell>
//                     <TableCell className="apv__td">{discPct}</TableCell>
//                     <TableCell className="apv__td apv__td--price">
//                       ₹{Number(v.selling_price || 0).toLocaleString('en-IN')}
//                     </TableCell>
//                     <TableCell className="apv__td apv__td--stock">{v.stock}</TableCell>
//                     <TableCell className="apv__td">
//                       <Chip label={isActive ? 'Active' : (v.status || '—')} size="small"
//                         color={isActive ? 'success' : 'default'} className="apv__status-chip" />
//                     </TableCell>
//                     <TableCell className="apv__td">
//                       {v.is_default === '1' || v.is_default === true
//                         ? <CheckCircleIcon sx={{ fontSize: 16, color: '#175cd3' }} />
//                         : <span className="apv__dash">—</span>}
//                     </TableCell>
//                     <TableCell className="apv__td">
//                       <Chip
//                         label={v._source === 'staged' ? 'Pending' : 'Saved'}
//                         size="small"
//                         color={v._source === 'staged' ? 'warning' : 'success'}
//                         variant="outlined"
//                         sx={{ fontSize: '0.62rem' }}
//                       />
//                     </TableCell>
//                     <TableCell className="apv__td">
//                       <Stack direction="row" spacing={0.25}>
//                         {v._source === 'staged' && (
//                           <Tooltip title="Edit this variant">
//                             <IconButton size="small" color="primary" onClick={() => onEdit(v)}>
//                               <EditOutlinedIcon sx={{ fontSize: 14 }} />
//                             </IconButton>
//                           </Tooltip>
//                         )}
//                         <Tooltip title={v._source === 'staged' ? 'Remove from list' : 'Delete from server'}>
//                           <IconButton size="small" color="error"
//                             onClick={() => v._source === 'staged'
//                               ? onRemoveStaged(v._localId)
//                               : onDeleteSaved(v)}>
//                             <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
//                           </IconButton>
//                         </Tooltip>
//                       </Stack>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })
//             )}
//           </TableBody>
//         </Table>
//       </Box>
//     </Box>
//   );
// }

// // ── Main Component ────────────────────────────────────────────────────────────
// function AddNewVariant({ productId, editingVariant = null, onSuccess, onCancel }) {
//   const [form,         setForm]         = useState(emptyVariantForm);
//   const [errors,       setErrors]       = useState({});
//   const [submitError,  setSubmitError]  = useState('');
//   const [saving,       setSaving]       = useState(false);

//   // Local staging — variants added but not yet sent to API
//   const [staged,       setStaged]       = useState([]);       // [{ _localId, ...fields }]
//   const [editingLocalId, setEditingLocalId] = useState(null); // which staged row is being edited

//   // Already-saved variants (fetched from server)
//   const [savedVariants,    setSavedVariants]    = useState([]);
//   const [variantsLoading,  setVariantsLoading]  = useState(false);

//   const formTopRef = useRef(null);

//   // ── Scroll to form ─────────────────────────────────────────────────────────
//   const scrollTop = () => {
//     const parent = formTopRef.current?.closest('.MuiDialogContent-root, [data-scroll]');
//     if (parent) { parent.scrollTo({ top: 0, behavior: 'smooth' }); return; }
//     formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   };

//   // ── Load saved variants on mount ───────────────────────────────────────────
//   useEffect(() => {
//     if (!productId) return;
//     console.group('🔍 [Variants] Fetch on mount');
//     console.log('product_id:', productId);
//     console.groupEnd();
//     setVariantsLoading(true);
//     fetchVariantsAction(productId)
//       .then((res) => {
//         const list = Array.isArray(res) ? res
//           : Array.isArray(res?.variants) ? res.variants
//           : Array.isArray(res?.data) ? res.data : [];
//         console.log(`✅ [Variants] Loaded ${list.length} saved variant(s)`, list);
//         setSavedVariants(list);
//       })
//       .catch((err) => {
//         console.warn('⚠️ [Variants] Fetch failed (may not exist yet):', err.message);
//         setSavedVariants([]);
//       })
//       .finally(() => setVariantsLoading(false));
//   }, [productId]);

//   // ── Pre-fill when external editingVariant prop changes ────────────────────
//   useEffect(() => {
//     if (!editingVariant) return;
//     setForm({
//       color_name:       editingVariant.color_name     || '',
//       color_hex:        editingVariant.color_hex      || '#1976d2',
//       size:             editingVariant.size           || '',
//       mrp:              editingVariant.mrp            ?? '',
//       discount_percent: editingVariant.discount_percent ?? '',
//       selling_price:    editingVariant.selling_price  ?? '',
//       stock:            editingVariant.stock          ?? '',
//       status:           editingVariant.status         || 'active',
//       is_default:       Boolean(editingVariant.is_default),
//       images:           (editingVariant.images || []).map((img) => ({
//         id: crypto.randomUUID(),
//         url: img.image_url || img.url || '',
//         preview: img.image_url || img.url || '',
//         isExisting: true,
//       })),
//     });
//   }, [editingVariant]);

//   const handleFieldChange = (name, value) => {
//     setForm((p) => ({ ...p, [name]: value }));
//     setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
//     setSubmitError('');
//   };

//   // ── Add to local staging table ─────────────────────────────────────────────
//   const handleAddToList = () => {
//     const errs = validateVariantForm(form);
//     if (Object.keys(errs).length) {
//       console.warn('❌ [Variant] Validation failed:', errs);
//       setErrors(errs);
//       scrollTop();
//       return;
//     }

//     const colorObj = COLOR_OPTIONS.find((c) => c.label === form.color_name);

//     if (editingLocalId) {
//       // Update existing staged row
//       setStaged((prev) => prev.map((v) =>
//         v._localId === editingLocalId
//           ? { ...v, ...form, color_hex: colorObj?.hex || form.color_hex, _localId: editingLocalId }
//           : v
//       ));
//       console.log('✏️ [Staged] Updated local variant:', editingLocalId);
//       setEditingLocalId(null);
//     } else {
//       // New staged row
//       const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
//       const newVariant = {
//         ...form,
//         color_hex: colorObj?.hex || form.color_hex,
//         _localId:  localId,
//         _source:   'staged',
//       };
//       console.group('➕ [Staged] Added to local list');
//       console.log('product_id      :', productId);
//       console.log('color           :', newVariant.color_name, newVariant.color_hex);
//       console.log('size            :', newVariant.size);
//       console.log('mrp             :', newVariant.mrp);
//       console.log('discount_percent:', newVariant.discount_percent);
//       console.log('selling_price   :', newVariant.selling_price);
//       console.log('stock           :', newVariant.stock);
//       console.log('status          :', newVariant.status);
//       console.log('is_default      :', newVariant.is_default);
//       console.groupEnd();
//       setStaged((prev) => [...prev, newVariant]);
//     }

//     // Reset form for next entry
//     setForm(emptyVariantForm);
//     setErrors({});
//   };

//   // ── Edit a staged row ──────────────────────────────────────────────────────
//   const handleEditStaged = (v) => {
//     console.log('✏️ [Staged] Editing local variant:', v._localId);
//     setEditingLocalId(v._localId);
//     setForm({
//       color_name:       v.color_name     || '',
//       color_hex:        v.color_hex      || '#1976d2',
//       size:             v.size           || '',
//       mrp:              v.mrp            ?? '',
//       discount_percent: v.discount_percent ?? '',
//       selling_price:    v.selling_price  ?? '',
//       stock:            v.stock          ?? '',
//       status:           v.status         || 'active',
//       is_default:       Boolean(v.is_default),
//       images:           v.images || [],
//     });
//     setErrors({});
//     scrollTop();
//   };

//   // ── Remove from staging ────────────────────────────────────────────────────
//   const handleRemoveStaged = (localId) => {
//     console.log('🗑️ [Staged] Removed local variant:', localId);
//     setStaged((prev) => prev.filter((v) => v._localId !== localId));
//     if (editingLocalId === localId) {
//       setEditingLocalId(null);
//       setForm(emptyVariantForm);
//     }
//   };

//   // ── Delete saved variant from server ──────────────────────────────────────
//   const handleDeleteSaved = async (v) => {
//     const vid = v.variant_id || v.id;
//     console.group('🗑️ [Variants] DELETE saved');
//     console.log('variant_id:', vid);
//     console.log('product_id:', productId);
//     console.groupEnd();
//     try {
//       await deleteVariantAction(vid);
//       setSavedVariants((prev) => prev.filter((x) => (x.variant_id || x.id) !== vid));
//       console.log('✅ [Variants] Deleted:', vid);
//     } catch (err) {
//       console.error('❌ [Variants] Delete failed:', err.message);
//       setSubmitError(err.message || 'Failed to delete variant');
//     }
//   };

//   // ── Reset form for new entry ───────────────────────────────────────────────
//   const handleAddNew = () => {
//     console.log('➕ [Staged] Reset form for new variant');
//     setEditingLocalId(null);
//     setForm(emptyVariantForm);
//     setErrors({});
//     setSubmitError('');
//     scrollTop();
//   };

//   // ── Save All staged variants → bulk API ───────────────────────────────────
//   const handleSaveAll = async () => {
//     if (staged.length === 0) {
//       setSubmitError('No pending variants to save. Add at least one variant to the list first.');
//       return;
//     }

//     setSaving(true);
//     setSubmitError('');

//     try {
//       const result = await createVariantsBulkAction(productId, staged);
//       console.log('✅ [Variants Bulk] All saved:', result);

//       // Refresh saved list
//       const res = await fetchVariantsAction(productId);
//       const list = Array.isArray(res) ? res
//         : Array.isArray(res?.variants) ? res.variants
//         : Array.isArray(res?.data) ? res.data : [];
//       setSavedVariants(list);

//       // Clear staging
//       setStaged([]);
//       setEditingLocalId(null);
//       setForm(emptyVariantForm);
//       setErrors({});

//       onSuccess?.(result);
//     } catch (err) {
//       console.error('❌ [Variants Bulk] Save failed:', err.message);
//       setSubmitError(err.message || 'Failed to save variants');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const pendingCount = staged.length;
//   const totalCount   = staged.length + savedVariants.length;

//   return (
//     <Box className="apv">
//       <Box ref={formTopRef} />

//       <Typography variant="body2" color="text.secondary" mb={2}>
//         Add variants for this product. Fill the form → click <strong>Add to List</strong> to stage, then <strong>Save All Variants</strong> to send to the server.
//       </Typography>

//       {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

//       {editingLocalId && (
//         <Alert severity="info" sx={{ mb: 2 }}>
//           Editing a pending variant — click <strong>Add to List</strong> to update it.
//         </Alert>
//       )}

//       {/* Form */}
//       <VariantForm
//         productId={productId}
//         form={form}
//         errors={errors}
//         editingLocalId={editingLocalId}
//         onChange={handleFieldChange}
//         onImageChange={(imgs) => setForm((p) => ({ ...p, images: imgs }))}
//       />

//       {/* Add to List button */}
//       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 3 }}>
//         <Button variant="outlined" color="primary" size="small"
//           startIcon={<AddCircleOutlinedIcon />}
//           onClick={handleAddToList}
//           sx={{ borderRadius: '8px', fontWeight: 600, textTransform: 'none', px: 2.5 }}>
//           {editingLocalId ? 'Update in List' : 'Add to List'}
//         </Button>
//       </Box>

//       {/* Staged + Saved table */}
//       {variantsLoading ? (
//         <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', py: 3 }}>
//           <CircularProgress size={20} />
//           <Typography variant="body2" color="text.secondary">Loading saved variants…</Typography>
//         </Box>
//       ) : (
//         <StagedTable
//           staged={staged}
//           savedVariants={savedVariants}
//           editingLocalId={editingLocalId}
//           onEdit={handleEditStaged}
//           onRemoveStaged={handleRemoveStaged}
//           onDeleteSaved={handleDeleteSaved}
//           onAddNew={handleAddNew}
//         />
//       )}

//       {/* Footer */}
//       <Box className="apv__footer">
//         <Button onClick={onCancel} disabled={saving} variant="outlined"
//           sx={{ borderColor: '#d0d5dd', color: '#344054', fontWeight: 600,
//             borderRadius: '8px', textTransform: 'none', px: 3 }}>
//           Cancel
//         </Button>

//         {pendingCount > 0 && (
//           <Button variant="contained" onClick={handleSaveAll} disabled={saving}
//             startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon />}
//             sx={{ bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' },
//               fontWeight: 600, borderRadius: '8px', textTransform: 'none',
//               px: 3, boxShadow: 'none' }}>
//             {saving ? 'Saving…' : `Save All Variants (${pendingCount})`}
//           </Button>
//         )}

//         {pendingCount === 0 && totalCount > 0 && (
//           <Typography variant="body2" color="success.dark" sx={{ fontWeight: 600 }}>
//             ✅ All {totalCount} variant{totalCount !== 1 ? 's' : ''} saved
//           </Typography>
//         )}
//       </Box>
//     </Box>
//   );
// }

// export default AddNewVariant;
