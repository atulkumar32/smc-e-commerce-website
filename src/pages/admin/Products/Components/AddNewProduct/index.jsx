import { useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  Divider,
  Grid,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Autocomplete,
  Switch,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';

import ProductImageUpload from './ProductImageUpload';
import useAddNewProduct from './useAddNewProduct';

import {
  BRAND_OPTIONS,
  COLOR_OPTIONS,
  MATERIAL_OPTIONS,
  PATTERN_OPTIONS,
  CHARACTER_OPTIONS,
  CLASS_OPTIONS,
  BACKPACK_STYLE_OPTIONS,
  BAG_CAPACITY_OPTIONS,
  NET_QUANTITY_OPTIONS,
  RECOMMENDED_AGE_OPTIONS,
  NET_WEIGHT_OPTIONS,
} from './AddNewProductData';

import './index.scss';

// Section Header
function Section({ title, children }) {
  return (
    <Box mt={3}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Divider sx={{ mb: 2.5 }} />
      {children}
    </Box>
  );
}

function AddNewProduct({ editingProduct = null, onSuccess, onCancel }) {
  const {
    form,
    errors,
    submitError,
    loading,
    isEditing,
    categories,
    categoriesLoading,
    handleChange,
    handleImagesChange,
    submitProduct,
    setFieldValue,
  } = useAddNewProduct({ editingProduct, onSuccess });

  // Auto-calculate Selling Price
  useEffect(() => {
    const mrp = Number(form.mrpPrice || 0);
    const pct = Number(form.discountPercent || 0);
    if (mrp > 0) {
      setFieldValue('sellingPrice', Number((mrp - mrp * (pct / 100)).toFixed(2)));
    }
  }, [form.mrpPrice, form.discountPercent, setFieldValue]);

  const clampNumber = (field, min = 0) => {
    const n = Number(form[field]);
    if (!Number.isNaN(n) && form[field] !== '') {
      setFieldValue(field, Math.max(min, n));
    }
  };

  // Features
  const features = form.features || [];

  const addFeature = () => {
    if (features.length >= 10) return;
    setFieldValue('features', [...features, { title: '', description: '' }]);
  };

  const removeFeature = (i) => {
    const next = [...features];
    next.splice(i, 1);
    setFieldValue('features', next);
  };

  const updateFeature = (i, key, val) => {
    const next = features.map((f, idx) =>
      idx === i ? { ...f, [key]: val } : f
    );
    setFieldValue('features', next);
  };

  const sel = (field) => ({
    value: form[field] || '',
    onChange: handleChange(field),
  });

  return (
    <Box className="add-new-product">
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 1. Product Images */}
        <Grid item xs={12}>
          <Section title="Product Images">
            <ProductImageUpload
              images={form.images}
              onChange={handleImagesChange}
              error={errors.images}
            />
          </Section>
        </Grid>

        {/* 2. Basic Information */}
        <Grid item xs={12}>
          <Section title="Basic Information">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Product Name *"
                  fullWidth
                  value={form.productName}
                  onChange={handleChange('productName')}
                  error={Boolean(errors.productName)}
                  helperText={errors.productName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Generic Name"
                  fullWidth
                  value={form.genericName || ''}
                  onChange={handleChange('genericName')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={BRAND_OPTIONS}
                  value={form.brand || ''}
                  onChange={(_, v) => setFieldValue('brand', v || '')}
                  onInputChange={(_, v) => setFieldValue('brand', v)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Brand *"
                      error={Boolean(errors.brand)}
                      helperText={errors.brand}
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={categories}
                  loading={categoriesLoading}
                  getOptionLabel={(opt) => opt.label || ''}
                  isOptionEqualToValue={(opt, val) =>
                    String(opt.value) === String(val?.value)
                  }
                  value={
                    categories.find(
                      (c) => String(c.value) === String(form.categoryId)
                    ) || null
                  }
                  onChange={(_, v) => {
                    setFieldValue('categoryId', v?.value ?? '');
                    setFieldValue('categoryName', v?.label ?? '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category *"
                      error={Boolean(errors.categoryId)}
                      helperText={errors.categoryId}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* 3. Product Attributes */}
        <Grid item xs={12}>
          <Section title="Product Attributes">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={COLOR_OPTIONS}
                  value={form.selectedColors || []}
                  onChange={(_, v) =>
                    setFieldValue(
                      'selectedColors',
                      v.map((item) =>
                        typeof item === 'string'
                          ? { label: item, hex: '#000000' }
                          : item
                      )
                    )
                  }
                  renderTags={(val, getTagProps) =>
                    val.map((opt, i) => (
                      <Chip
                        key={i}
                        label={opt.label}
                        {...getTagProps({ index: i })}
                        sx={{
                          bgcolor: opt.hex || '#eee',
                          color: '#111',
                          fontWeight: 600,
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Colors *"
                      error={Boolean(errors.selectedColors)}
                      helperText={errors.selectedColors}
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={MATERIAL_OPTIONS}
                  value={form.material || ''}
                  onChange={(_, v) => setFieldValue('material', v || '')}
                  onInputChange={(_, v) => setFieldValue('material', v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Material" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={PATTERN_OPTIONS}
                  value={form.pattern || ''}
                  onChange={(_, v) => setFieldValue('pattern', v || '')}
                  onInputChange={(_, v) => setFieldValue('pattern', v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Pattern" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={CHARACTER_OPTIONS}
                  value={form.character || ''}
                  onChange={(_, v) => setFieldValue('character', v || '')}
                  onInputChange={(_, v) => setFieldValue('character', v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Character Name" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* 4. Product Details */}
        <Grid item xs={12}>
          <Section title="Product Details">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select label="Gender" {...sel('gender')}>
                    {['Boys', 'Girls', 'Unisex', 'Male', 'Female'].map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={CLASS_OPTIONS}
                  value={form.productClass || ''}
                  onChange={(_, v) => setFieldValue('productClass', v || '')}
                  onInputChange={(_, v) => setFieldValue('productClass', v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Class Type" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={BACKPACK_STYLE_OPTIONS}
                  value={form.backpackStyle || ''}
                  onChange={(_, v) => setFieldValue('backpackStyle', v || '')}
                  onInputChange={(_, v) => setFieldValue('backpackStyle', v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Backpack Style" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={BAG_CAPACITY_OPTIONS}
                  value={form.bagCapacity || ''}
                  onChange={(_, v) => setFieldValue('bagCapacity', v || '')}
                  onInputChange={(_, v) => setFieldValue('bagCapacity', v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Bag Capacity" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={NET_QUANTITY_OPTIONS}
                  value={form.netQuantity || ''}
                  onChange={(_, v) => setFieldValue('netQuantity', v || '')}
                  onInputChange={(_, v) => setFieldValue('netQuantity', v)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Net Quantity"
                      error={Boolean(errors.netQuantity)}
                      helperText={errors.netQuantity}
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={RECOMMENDED_AGE_OPTIONS}
                  value={form.recommendedAge || ''}
                  onChange={(_, v) => setFieldValue('recommendedAge', v || '')}
                  onInputChange={(_, v) => setFieldValue('recommendedAge', v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Recommended Age" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Size</InputLabel>
                  <Select label="Size" {...sel('size')}>
                    {['Small', 'Medium', 'Large', 'Extra Large', 'Free Size'].map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Country of Origin</InputLabel>
                  <Select label="Country of Origin" {...sel('countryOfOrigin')}>
                    {['India', 'China', 'Bangladesh', 'Vietnam', 'Indonesia'].map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={NET_WEIGHT_OPTIONS}
                  value={form.netWeight || ''}
                  onChange={(_, v) => setFieldValue('netWeight', v || '')}
                  onInputChange={(_, v) => setFieldValue('netWeight', v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Net Weight" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* 5. Pricing */}
        <Grid item xs={12}>
          <Section title="Pricing">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cost Price (₹)"
                  type="number"
                  fullWidth
                  value={form.actualCostPrice || ''}
                  onChange={handleChange('actualCostPrice')}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="MRP (₹) *"
                  type="number"
                  fullWidth
                  value={form.mrpPrice || ''}
                  onChange={handleChange('mrpPrice')}
                  onBlur={() => clampNumber('mrpPrice', 1)}
                  error={Boolean(errors.mrpPrice)}
                  helperText={errors.mrpPrice}
                  inputProps={{ min: 1, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Discount (%)"
                  type="number"
                  fullWidth
                  value={form.discountPercent || ''}
                  onChange={handleChange('discountPercent')}
                  onBlur={() => clampNumber('discountPercent', 0)}
                  error={Boolean(errors.discountPercent)}
                  helperText={errors.discountPercent}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Selling Price (₹)"
                  type="number"
                  fullWidth
                  value={form.sellingPrice || ''}
                  InputProps={{ readOnly: true }}
                  helperText="Auto-calculated from MRP & Discount"
                />
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* 6. Inventory */}
        <Grid item xs={12}>
          <Section title="Inventory">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Stock Quantity *"
                  type="number"
                  fullWidth
                  value={form.stock || ''}
                  onChange={handleChange('stock')}
                  onBlur={() => clampNumber('stock', 1)}
                  error={Boolean(errors.stock)}
                  helperText={errors.stock}
                  inputProps={{ min: 1, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Stock Status</InputLabel>
                  <Select label="Stock Status" {...sel('stockStatus')}>
                    <MenuItem value="in_stock">In Stock</MenuItem>
                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* 7. Features */}
        <Grid item xs={12}>
          <Section title={`Product Features (${features.length}/10)`}>
            <Stack spacing={2}>
              {features.map((feat, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        label="Feature Title"
                        fullWidth
                        size="small"
                        value={feat.title || ''}
                        onChange={(e) => updateFeature(i, 'title', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Description"
                        fullWidth
                        size="small"
                        value={feat.description || ''}
                        onChange={(e) => updateFeature(i, 'description', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => removeFeature(i)}
                        size="small"
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={addFeature}
                disabled={features.length >= 10}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Feature
              </Button>
            </Stack>
          </Section>
        </Grid>

        {/* 8. Description */}
        <Grid item xs={12}>
          <Section title="Description">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Short Description"
                  fullWidth
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 250 }}
                  value={form.shortDescription || ''}
                  onChange={handleChange('shortDescription')}
                  helperText={`${(form.shortDescription || '').length}/250 characters`}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Full Description *"
                  fullWidth
                  multiline
                  rows={8}
                  value={form.fullDescription || ''}
                  onChange={handleChange('fullDescription')}
                  error={Boolean(errors.fullDescription)}
                  helperText={errors.fullDescription || 'Plain text. Use line breaks for paragraphs.'}
                />
              </Grid>
            </Grid>
          </Section>
        </Grid>

        {/* 9. Visibility & Display Settings */}
        <Grid item xs={12}>
          <Section title="Visibility & Display Settings">
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Live on Website</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Show this product on the public store
                      </Typography>
                    </Box>
                    <Switch
                      checked={Boolean(form.isLive)}
                      onChange={(e) => setFieldValue('isLive', e.target.checked)}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>New Arrival</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Show in New Arrivals section
                      </Typography>
                    </Box>
                    <Switch
                      checked={Boolean(form.isNewArrival)}
                      onChange={(e) => setFieldValue('isNewArrival', e.target.checked)}
                      color="success"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Card Slider</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Include in homepage slider
                      </Typography>
                    </Box>
                    <Switch
                      checked={Boolean(form.showInCardSlider)}
                      onChange={(e) => setFieldValue('showInCardSlider', e.target.checked)}
                      color="warning"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Homepage Banner</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Feature on homepage hero banner
                      </Typography>
                    </Box>
                    <Switch
                      checked={Boolean(form.homepageBannerEnabled)}
                      onChange={(e) => setFieldValue('homepageBannerEnabled', e.target.checked)}
                      color="secondary"
                    />
                  </Box>
                </Grid>
              </Grid>

              {form.homepageBannerEnabled && (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Banner Title"
                        fullWidth
                        value={form.heroBannerTitle || ''}
                        onChange={handleChange('heroBannerTitle')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Banner Subtitle"
                        fullWidth
                        value={form.heroBannerSubtitle || ''}
                        onChange={handleChange('heroBannerSubtitle')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="CTA Button Text"
                        fullWidth
                        value={form.heroBannerCTA || ''}
                        onChange={handleChange('heroBannerCTA')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="CTA Link URL"
                        fullWidth
                        value={form.heroBannerUrl || ''}
                        onChange={handleChange('heroBannerUrl')}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Section>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box
        sx={{
          mt: 5,
          pt: 3,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <Button onClick={onCancel} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => submitProduct('draft')}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={() => submitProduct('published')}
        >
          {loading
            ? isEditing
              ? 'Updating…'
              : 'Publishing…'
            : isEditing
            ? 'Update Product'
            : 'Publish Product'}
        </Button>
      </Box>
    </Box>
  );
}

export default AddNewProduct;