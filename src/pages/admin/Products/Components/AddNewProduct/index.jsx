import {
  Box, Button, Grid, Alert, Paper, Typography, TextField,
  Autocomplete, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Stack, Chip, Divider,
} from '@mui/material';
import useAddNewProduct from './useAddNewProduct';
import ProductImageUpload from './ProductImageUpload';
import {
  BRAND_OPTIONS, MATERIAL_OPTIONS, PATTERN_OPTIONS, CHARACTER_OPTIONS,
  CLASS_OPTIONS, BACKPACK_STYLE_OPTIONS, BAG_CAPACITY_OPTIONS,
  NET_QUANTITY_OPTIONS, RECOMMENDED_AGE_OPTIONS, NET_WEIGHT_OPTIONS,
  COLOR_OPTIONS,
} from './AddNewProductData';

// ── Layout helpers ────────────────────────────────────────────────────────────
const Row = ({ children }) => (
  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>{children}</Box>
);
const F = ({ children, flex = 1 }) => (
  <Box sx={{ flex, minWidth: 160 }}>{children}</Box>
);

function SectionCard({ title, children }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid #e8eaed', borderRadius: '10px', mb: 2.5, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, py: 1.25, bgcolor: '#f8f9fa', borderBottom: '1px solid #e8eaed' }}>
        <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  );
}

function ToggleRow({ label, field, form, setFieldValue }) {
  return (
    <FormControlLabel
      control={
        <Switch
          size="small"
          checked={Boolean(form[field])}
          onChange={(e) => setFieldValue(field, e.target.checked)}
        />
      }
      label={<Typography variant="body2">{label}</Typography>}
      sx={{ mr: 3, mb: 0.5 }}
    />
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function AddNewProduct({ editingProduct = null, onSuccess, onCancel }) {
  const {
    form, errors, submitError, loading, isEditing,
    categories, categoriesLoading,
    handleChange, handleImagesChange, setFieldValue, submitProduct,
  } = useAddNewProduct({ editingProduct, onSuccess });

  // Features array helper
  const toggleFeature = (feat) => {
    const cur = Array.isArray(form.features) ? form.features : [];
    const next = cur.includes(feat) ? cur.filter((f) => f !== feat) : [...cur, feat];
    setFieldValue('features', next);
  };
  const FEATURE_OPTIONS = [
    'Water Resistant', 'Padded Shoulder Straps', 'Multiple Compartments',
    'Reflective Strip', 'USB Charging Port', 'Trolley Sleeve',
    'Anti-Theft', 'Laptop Compartment', 'Ergonomic Back',
  ];

  return (
    <Box>
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <Grid container spacing={2.5}>
        {/* ── LEFT — form fields ── */}
        <Grid item xs={12} lg={8}>

          {/* Basic Information */}
          <SectionCard title="Basic Information">
            <Row>
              <F>
                <TextField label="Product Name *" fullWidth size="small"
                  value={form.productName || ''} onChange={handleChange('productName')}
                  error={!!errors.productName} helperText={errors.productName} />
              </F>
              <F>
                <TextField label="Generic Name" fullWidth size="small"
                  value={form.genericName || ''} onChange={handleChange('genericName')} />
              </F>
            </Row>
            <Row>
              <F>
                <Autocomplete freeSolo options={BRAND_OPTIONS}
                  value={form.brand || ''}
                  onChange={(_, v) => setFieldValue('brand', v || '')}
                  onInputChange={(_, v) => setFieldValue('brand', v)}
                  renderInput={(p) => <TextField {...p} label="Brand *" size="small"
                    error={!!errors.brand} helperText={errors.brand} />} />
              </F>
              <F>
                <Autocomplete
                  options={categories}
                  loading={categoriesLoading}
                  value={categories.find((c) => c.value === form.categoryId) || null}
                  onChange={(_, v) => setFieldValue('categoryId', v?.value || '')}
                  getOptionLabel={(opt) => opt.label || ''}
                  isOptionEqualToValue={(opt, val) => opt.value === val.value}
                  renderInput={(p) => <TextField {...p} label="Category *" size="small"
                    error={!!errors.categoryId} helperText={errors.categoryId} />} />
              </F>
            </Row>
            <Row>
              <F>
                <TextField label="GST %" fullWidth size="small" type="number"
                  value={form.gst || ''} onChange={handleChange('gst')}
                  placeholder="e.g. 18" />
              </F>
              <F>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select value={form.gender || ''} onChange={handleChange('gender')} label="Gender">
                    {['Unisex', 'Boys', 'Girls', 'Kids Unisex'].map((v) => (
                      <MenuItem key={v} value={v}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </F>
            </Row>
          </SectionCard>

          {/* Product Attributes */}
          <SectionCard title="Product Attributes">
            <Row>
              <F><Autocomplete freeSolo options={MATERIAL_OPTIONS}
                value={form.material || ''}
                onChange={(_, v) => setFieldValue('material', v || '')}
                onInputChange={(_, v) => setFieldValue('material', v)}
                renderInput={(p) => <TextField {...p} label="Material" size="small" />} /></F>
              <F><Autocomplete freeSolo options={PATTERN_OPTIONS}
                value={form.pattern || ''}
                onChange={(_, v) => setFieldValue('pattern', v || '')}
                onInputChange={(_, v) => setFieldValue('pattern', v)}
                renderInput={(p) => <TextField {...p} label="Pattern" size="small" />} /></F>
            </Row>
            <Row>
              <F><Autocomplete freeSolo options={CHARACTER_OPTIONS}
                value={form.character || ''}
                onChange={(_, v) => setFieldValue('character', v || '')}
                onInputChange={(_, v) => setFieldValue('character', v)}
                renderInput={(p) => <TextField {...p} label="Character" size="small" />} /></F>
              <F><Autocomplete freeSolo options={CLASS_OPTIONS}
                value={form.productClass || ''}
                onChange={(_, v) => setFieldValue('productClass', v || '')}
                onInputChange={(_, v) => setFieldValue('productClass', v)}
                renderInput={(p) => <TextField {...p} label="Class / Grade" size="small" />} /></F>
            </Row>
            <Row>
              <F><Autocomplete freeSolo options={BACKPACK_STYLE_OPTIONS}
                value={form.backpackStyle || ''}
                onChange={(_, v) => setFieldValue('backpackStyle', v || '')}
                onInputChange={(_, v) => setFieldValue('backpackStyle', v)}
                renderInput={(p) => <TextField {...p} label="Backpack Style" size="small" />} /></F>
              <F><Autocomplete freeSolo options={BAG_CAPACITY_OPTIONS}
                value={form.bagCapacity || ''}
                onChange={(_, v) => setFieldValue('bagCapacity', v || '')}
                onInputChange={(_, v) => setFieldValue('bagCapacity', v)}
                renderInput={(p) => <TextField {...p} label="Bag Capacity" size="small" />} /></F>
            </Row>
            <Row>
              <F><Autocomplete freeSolo options={NET_QUANTITY_OPTIONS}
                value={form.netQuantity || ''}
                onChange={(_, v) => setFieldValue('netQuantity', v || '')}
                onInputChange={(_, v) => setFieldValue('netQuantity', v)}
                renderInput={(p) => <TextField {...p} label="Net Quantity" size="small" />} /></F>
              <F><Autocomplete freeSolo options={NET_WEIGHT_OPTIONS}
                value={form.netWeight || ''}
                onChange={(_, v) => setFieldValue('netWeight', v || '')}
                onInputChange={(_, v) => setFieldValue('netWeight', v)}
                renderInput={(p) => <TextField {...p} label="Net Weight" size="small" />} /></F>
            </Row>
            <Row>
              <F><Autocomplete freeSolo options={RECOMMENDED_AGE_OPTIONS}
                value={form.recommendedAge || ''}
                onChange={(_, v) => setFieldValue('recommendedAge', v || '')}
                onInputChange={(_, v) => setFieldValue('recommendedAge', v)}
                renderInput={(p) => <TextField {...p} label="Recommended Age" size="small" />} /></F>
              <F>
                <TextField label="Country of Origin" fullWidth size="small"
                  value={form.countryOfOrigin || 'India'} onChange={handleChange('countryOfOrigin')} />
              </F>
            </Row>

            {/* Features */}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {FEATURE_OPTIONS.map((f) => {
                  const sel = Array.isArray(form.features) && form.features.includes(f);
                  return (
                    <Chip key={f} label={f} size="small" clickable
                      color={sel ? 'primary' : 'default'}
                      variant={sel ? 'filled' : 'outlined'}
                      onClick={() => toggleFeature(f)} />
                  );
                })}
              </Box>
            </Box>
          </SectionCard>

          {/* Descriptions */}
          <SectionCard title="Description">
            <TextField label="Short Description" fullWidth multiline rows={2} size="small"
              value={form.shortDescription || ''} onChange={handleChange('shortDescription')} sx={{ mb: 2 }} />
            <TextField label="Full Description" fullWidth multiline rows={5} size="small"
              value={form.fullDescription || ''} onChange={handleChange('fullDescription')}
              error={!!errors.fullDescription} helperText={errors.fullDescription} />
          </SectionCard>

          {/* Visibility toggles */}
          <SectionCard title="Visibility & Status">
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <ToggleRow label="Is Live"               field="isLive"              form={form} setFieldValue={setFieldValue} />
              <ToggleRow label="New Arrival"            field="isNewArrival"        form={form} setFieldValue={setFieldValue} />
              <ToggleRow label="Show in Card Slider"    field="showInCardSlider"    form={form} setFieldValue={setFieldValue} />
              <ToggleRow label="Published"              field="isPublished"         form={form} setFieldValue={setFieldValue} />
              <ToggleRow label="Visible on Website"     field="isVisibleOnWebsite"  form={form} setFieldValue={setFieldValue} />
              <ToggleRow label="Homepage Banner"        field="homepageBannerEnabled" form={form} setFieldValue={setFieldValue} />
            </Box>
          </SectionCard>
        </Grid>

        {/* ── RIGHT — images ── */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, border: '1px solid #e8eaed', borderRadius: '10px',
            position: { lg: 'sticky' }, top: { lg: 80 } }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Product Images
            </Typography>
            <ProductImageUpload
              images={form.images || []}
              onChange={handleImagesChange}
              error={errors.images}
              selectedColors={
                COLOR_OPTIONS.filter((c) =>
                  (form.images || []).some((img) => img.colorLabel === c.label)
                )
              }
            />
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Action buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="outlined" disabled={loading}
          onClick={() => submitProduct('draft')}>
          Save Draft
        </Button>
        <Button variant="contained" disabled={loading}
          onClick={() => submitProduct('published')}>
          {isEditing ? 'Update Product' : 'Create Master Product'}
        </Button>
      </Stack>
    </Box>
  );
}

export default AddNewProduct;
