import { useEffect } from 'react';
import {
  Box, Button, Chip, Stack, Typography, Grid, Alert,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Paper, IconButton, Autocomplete, Switch,
} from '@mui/material';
import AddCircleOutlineIcon    from '@mui/icons-material/AddCircleOutlineOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import ProductImageUpload from './ProductImageUpload';
import useAddNewProduct   from './useAddNewProduct';
import {
  BRAND_OPTIONS, COLOR_OPTIONS, MATERIAL_OPTIONS, PATTERN_OPTIONS,
  CHARACTER_OPTIONS, CLASS_OPTIONS, BACKPACK_STYLE_OPTIONS,
  BAG_CAPACITY_OPTIONS, NET_QUANTITY_OPTIONS, RECOMMENDED_AGE_OPTIONS,
  NET_WEIGHT_OPTIONS,
} from './AddNewProductData';
import './index.scss';

// ── Wrapper for a 2-column row of fields ──────────────────────────────────────
const Row  = ({ children, cols }) =>
  <div className={`add-new-product__row${cols === 4 ? ' add-new-product__row--4' : cols === 1 ? ' add-new-product__row--full' : ''}`}
    style={{ marginBottom: '16px' }}>{children}</div>;

const F    = ({ children }) => <div className="add-new-product__field">{children}</div>;

// ── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid #e8eaed', borderRadius: '10px',
      overflow: 'hidden', mb: 2.5 }}>
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8f9fa', borderBottom: '1px solid #e8eaed' }}>
        <Typography variant="subtitle2"
          sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.09em',
            textTransform: 'uppercase', color: '#5f6368' }}>
          {title}
        </Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, caption, checked, onChange, color = 'primary' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      py: 1.25, borderBottom: '1px solid #f1f3f4', '&:last-child': { border: 'none' } }}>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{label}</Typography>
        <Typography variant="caption" color="text.secondary">{caption}</Typography>
      </Box>
      <Switch checked={checked} onChange={onChange} color={color} size="small" />
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function AddNewProduct({ editingProduct = null, onSuccess, onCancel }) {
  const {
    form, errors, submitError, loading, isEditing,
    categories, categoriesLoading,
    handleChange, handleImagesChange, submitProduct, setFieldValue,
  } = useAddNewProduct({ editingProduct, onSuccess });

  // Auto-calc selling price — deps: only the two price fields, NOT setFieldValue
  useEffect(() => {
    const mrp = Number(form.mrpPrice || 0);
    const pct = Number(form.discountPercent || 0);
    if (mrp > 0) {
      const selling = +(mrp - mrp * (pct / 100)).toFixed(2);
      // Only call setFieldValue if value actually changed (avoids re-render loop)
      setFieldValue('sellingPrice', selling);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.mrpPrice, form.discountPercent]); // intentionally omit setFieldValue

  const clamp = (field, min = 0) => {
    const n = Number(form[field]);
    if (!Number.isNaN(n) && form[field] !== '') setFieldValue(field, Math.max(min, n));
  };

  const sel = (field) => ({ value: form[field] || '', onChange: handleChange(field) });

  const features = form.features || [];
  const addFeature    = () => features.length < 10 &&
    setFieldValue('features', [...features, { title: '', description: '' }]);
  const removeFeature = (i) =>
    setFieldValue('features', features.filter((_, idx) => idx !== i));
  const updateFeature = (i, key, val) =>
    setFieldValue('features', features.map((f, idx) => idx === i ? { ...f, [key]: val } : f));

  return (
    <Box className="add-new-product">
      {submitError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px' }}>{submitError}</Alert>
      )}

      <Grid container spacing={2.5} alignItems="flex-start">

        {/* ── LEFT: form ── */}
        <Grid item xs={12} lg={8}>

          {/* 1. Basic Information */}
          <SectionCard title="Basic Information">
            <Row>
              <F><TextField label="Product Name *" fullWidth size="small"
                value={form.productName} onChange={handleChange('productName')}
                error={Boolean(errors.productName)} helperText={errors.productName} /></F>
              <F><TextField label="Generic Name" fullWidth size="small"
                value={form.genericName || ''} onChange={handleChange('genericName')} /></F>
            </Row>
            <Row>
              <F><Autocomplete freeSolo size="small" options={BRAND_OPTIONS}
                value={form.brand || ''}
                onChange={(_, v) => setFieldValue('brand', v || '')}
                onInputChange={(_, v) => setFieldValue('brand', v)}
                renderInput={(p) => <TextField {...p} label="Brand *" fullWidth
                  error={Boolean(errors.brand)} helperText={errors.brand} />}
              /></F>
              <F><Autocomplete size="small" options={categories} loading={categoriesLoading}
                getOptionLabel={(o) => o.label || ''}
                isOptionEqualToValue={(o, v) => String(o.value) === String(v?.value)}
                value={categories.find((c) => String(c.value) === String(form.categoryId)) || null}
                onChange={(_, v) => { setFieldValue('categoryId', v?.value ?? ''); setFieldValue('categoryName', v?.label ?? ''); }}
                renderInput={(p) => <TextField {...p} label="Category *" fullWidth
                  error={Boolean(errors.categoryId)} helperText={errors.categoryId} />}
              /></F>
            </Row>
          </SectionCard>

          {/* 2. Attributes */}
          <SectionCard title="Product Attributes">
            <Row>
              <F><Autocomplete multiple freeSolo size="small" options={COLOR_OPTIONS}
                getOptionLabel={(o) => typeof o === 'string' ? o : o.label}
                value={form.selectedColors || []}
                onChange={(_, v) => setFieldValue('selectedColors',
                  v.map((i) => typeof i === 'string' ? { label: i, hex: '#000000' } : i))}
                renderTags={(val, gtp) => val.map((opt, i) => (
                  <Chip key={i} label={opt.label} size="small" {...gtp({ index: i })}
                    sx={{ bgcolor: opt.hex || '#eee', color: '#111', fontWeight: 600, fontSize: '0.7rem' }} />
                ))}
                renderInput={(p) => <TextField {...p} label="Colors *" fullWidth
                  error={Boolean(errors.selectedColors)} helperText={errors.selectedColors} />}
              /></F>
              <F><Autocomplete freeSolo size="small" options={MATERIAL_OPTIONS}
                value={form.material || ''}
                onChange={(_, v) => setFieldValue('material', v || '')}
                onInputChange={(_, v) => setFieldValue('material', v)}
                renderInput={(p) => <TextField {...p} label="Material" fullWidth />}
              /></F>
            </Row>
            <Row>
              <F><Autocomplete freeSolo size="small" options={PATTERN_OPTIONS}
                value={form.pattern || ''}
                onChange={(_, v) => setFieldValue('pattern', v || '')}
                onInputChange={(_, v) => setFieldValue('pattern', v)}
                renderInput={(p) => <TextField {...p} label="Pattern" fullWidth />}
              /></F>
              <F><Autocomplete freeSolo size="small" options={CHARACTER_OPTIONS}
                value={form.character || ''}
                onChange={(_, v) => setFieldValue('character', v || '')}
                onInputChange={(_, v) => setFieldValue('character', v)}
                renderInput={(p) => <TextField {...p} label="Character Name" fullWidth />}
              /></F>
            </Row>
          </SectionCard>

          {/* 3. Product Details */}
          <SectionCard title="Product Details">
            <Row>
              <F><FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" {...sel('gender')}>
                  {['Boys','Girls','Unisex','Male','Female'].map((v) =>
                    <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl></F>
              <F><Autocomplete freeSolo size="small" options={CLASS_OPTIONS}
                value={form.productClass || ''}
                onChange={(_, v) => setFieldValue('productClass', v || '')}
                onInputChange={(_, v) => setFieldValue('productClass', v)}
                renderInput={(p) => <TextField {...p} label="Class Type" fullWidth />}
              /></F>
            </Row>
            <Row>
              <F><Autocomplete freeSolo size="small" options={BACKPACK_STYLE_OPTIONS}
                value={form.backpackStyle || ''}
                onChange={(_, v) => setFieldValue('backpackStyle', v || '')}
                onInputChange={(_, v) => setFieldValue('backpackStyle', v)}
                renderInput={(p) => <TextField {...p} label="Backpack Style" fullWidth />}
              /></F>
              <F><Autocomplete freeSolo size="small" options={BAG_CAPACITY_OPTIONS}
                value={form.bagCapacity || ''}
                onChange={(_, v) => setFieldValue('bagCapacity', v || '')}
                onInputChange={(_, v) => setFieldValue('bagCapacity', v)}
                renderInput={(p) => <TextField {...p} label="Bag Capacity" fullWidth />}
              /></F>
            </Row>
            <Row>
              <F><Autocomplete freeSolo size="small" options={NET_QUANTITY_OPTIONS}
                value={form.netQuantity || ''}
                onChange={(_, v) => setFieldValue('netQuantity', v || '')}
                onInputChange={(_, v) => setFieldValue('netQuantity', v)}
                renderInput={(p) => <TextField {...p} label="Net Quantity" fullWidth
                  error={Boolean(errors.netQuantity)} helperText={errors.netQuantity} />}
              /></F>
              <F><Autocomplete freeSolo size="small" options={RECOMMENDED_AGE_OPTIONS}
                value={form.recommendedAge || ''}
                onChange={(_, v) => setFieldValue('recommendedAge', v || '')}
                onInputChange={(_, v) => setFieldValue('recommendedAge', v)}
                renderInput={(p) => <TextField {...p} label="Recommended Age" fullWidth />}
              /></F>
            </Row>
            <Row>
              <F><FormControl fullWidth size="small">
                <InputLabel>Size</InputLabel>
                <Select label="Size" {...sel('size')}>
                  {['Small','Medium','Large','Extra Large','Free Size'].map((v) =>
                    <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl></F>
              <F><FormControl fullWidth size="small">
                <InputLabel>Country of Origin</InputLabel>
                <Select label="Country of Origin" {...sel('countryOfOrigin')}>
                  {['India','China','Bangladesh','Vietnam','Indonesia'].map((v) =>
                    <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl></F>
            </Row>
            <Row>
              <F><Autocomplete freeSolo size="small" options={NET_WEIGHT_OPTIONS}
                value={form.netWeight || ''}
                onChange={(_, v) => setFieldValue('netWeight', v || '')}
                onInputChange={(_, v) => setFieldValue('netWeight', v)}
                renderInput={(p) => <TextField {...p} label="Net Weight" fullWidth />}
              /></F>
              <F>{/* spacer */}</F>
            </Row>
          </SectionCard>

          {/* 4. Pricing */}
          <SectionCard title="Pricing" subtitle="Selling price is auto-calculated">
            <Row>
              <F><TextField label="Cost Price (₹)" type="number" fullWidth size="small"
                value={form.actualCostPrice || ''} onChange={handleChange('actualCostPrice')}
                inputProps={{ min: 0, step: 0.01 }} /></F>
              <F><TextField label="MRP (₹) *" type="number" fullWidth size="small"
                value={form.mrpPrice || ''} onChange={handleChange('mrpPrice')}
                onBlur={() => clamp('mrpPrice', 1)}
                error={Boolean(errors.mrpPrice)} helperText={errors.mrpPrice}
                inputProps={{ min: 1, step: 0.01 }} /></F>
            </Row>
            <Row>
              <F><TextField label="Discount (%)" type="number" fullWidth size="small"
                value={form.discountPercent || ''} onChange={handleChange('discountPercent')}
                onBlur={() => clamp('discountPercent', 0)}
                error={Boolean(errors.discountPercent)} helperText={errors.discountPercent}
                inputProps={{ min: 0, max: 100, step: 1 }} /></F>
              <F><TextField label="Selling Price (₹)" type="number" fullWidth size="small"
                value={form.sellingPrice || ''} InputProps={{ readOnly: true }}
                helperText="Auto-calculated"
                sx={{ '& .MuiInputBase-root': { bgcolor: '#f8f9fa' } }} /></F>
            </Row>
            <Box sx={{ mt: 1, px: 1.5, py: 0.875, bgcolor: '#f0f7ff', borderRadius: '6px',
              display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
              {[['Cost', form.actualCostPrice || 0], ['MRP', form.mrpPrice || 0],
                ['Disc', `${form.discountPercent || 0}%`], ['Selling', form.sellingPrice || 0],
              ].map(([l, v]) => (
                <Typography key={l} variant="caption" sx={{ color: '#1565c0' }}>
                  <strong>{l}:</strong> {typeof v === 'number' ? `₹${v}` : v}
                </Typography>
              ))}
            </Box>
          </SectionCard>

          {/* 5. Inventory */}
          <SectionCard title="Inventory">
            <Row>
              <F><TextField label="Stock Quantity *" type="number" fullWidth size="small"
                value={form.stock || ''} onChange={handleChange('stock')}
                onBlur={() => clamp('stock', 1)}
                error={Boolean(errors.stock)} helperText={errors.stock}
                inputProps={{ min: 1, step: 1 }} /></F>
              <F><FormControl fullWidth size="small">
                <InputLabel>Stock Status</InputLabel>
                <Select label="Stock Status" {...sel('stockStatus')}>
                  <MenuItem value="in_stock">✅ In Stock</MenuItem>
                  <MenuItem value="out_of_stock">❌ Out of Stock</MenuItem>
                </Select>
              </FormControl></F>
            </Row>
          </SectionCard>

          {/* 6. Features */}
          <SectionCard title={`Product Features (${features.length} / 10)`}>
            <Stack spacing={1.5}>
              {features.map((feat, i) => (
                <Paper key={i} variant="outlined"
                  sx={{ p: 1.5, display: 'flex', gap: 1.5, alignItems: 'center', borderRadius: '8px' }}>
                  <TextField label="Title" size="small" sx={{ flex: '0 0 44%' }}
                    value={feat.title || ''} onChange={(e) => updateFeature(i, 'title', e.target.value)} />
                  <TextField label="Description" size="small" sx={{ flex: 1 }}
                    value={feat.description || ''} onChange={(e) => updateFeature(i, 'description', e.target.value)} />
                  <IconButton size="small" color="error" onClick={() => removeFeature(i)}>
                    <RemoveCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
              <Button size="small" variant="outlined" startIcon={<AddCircleOutlineIcon />}
                onClick={addFeature} disabled={features.length >= 10}
                sx={{ alignSelf: 'flex-start', borderRadius: '6px' }}>
                Add Feature
              </Button>
            </Stack>
          </SectionCard>

          {/* 7. Description */}
          <SectionCard title="Description">
            <Row cols={1}>
              <F><TextField label="Short Description" fullWidth multiline rows={3}
                inputProps={{ maxLength: 250 }}
                value={form.shortDescription || ''} onChange={handleChange('shortDescription')}
                helperText={`${(form.shortDescription || '').length} / 250`} /></F>
            </Row>
            <Row cols={1}>
              <F><TextField label="Full Description *" fullWidth multiline rows={7}
                value={form.fullDescription || ''} onChange={handleChange('fullDescription')}
                error={Boolean(errors.fullDescription)}
                helperText={errors.fullDescription || 'Plain text — use line breaks for paragraphs.'} /></F>
            </Row>
          </SectionCard>

          {/* 8. Visibility */}
          <SectionCard title="Visibility & Display">
            <Grid container spacing={0}>
              {[
                ['isLive',               'Live on Website',  'Visible on public store',          'primary'],
                ['isNewArrival',         'New Arrival',      'Show in New Arrivals section',     'success'],
                ['showInCardSlider',     'Card Slider',      'Include in homepage slider',       'warning'],
                ['homepageBannerEnabled','Homepage Banner',  'Feature on homepage hero banner',  'secondary'],
              ].map(([field, label, caption, color]) => (
                <Grid key={field} item xs={12} sm={6}>
                  <Box sx={{ pr: { sm: 2 } }}>
                    <ToggleRow label={label} caption={caption} color={color}
                      checked={Boolean(form[field])}
                      onChange={(e) => setFieldValue(field, e.target.checked)} />
                  </Box>
                </Grid>
              ))}
            </Grid>

            {form.homepageBannerEnabled && (
              <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid #e8eaed' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#5f6368', display: 'block', mb: 1.5 }}>
                  Banner Content
                </Typography>
                <Row>
                  <F><TextField label="Banner Title" fullWidth size="small"
                    placeholder="e.g. New Arrivals"
                    value={form.heroBannerTitle || ''} onChange={handleChange('heroBannerTitle')} /></F>
                  <F><TextField label="Banner Subtitle" fullWidth size="small"
                    placeholder="e.g. Shop the latest bags"
                    value={form.heroBannerSubtitle || ''} onChange={handleChange('heroBannerSubtitle')} /></F>
                </Row>
                <Row>
                  <F><TextField label="CTA Button Text" fullWidth size="small"
                    placeholder="e.g. Shop Now"
                    value={form.heroBannerCTA || ''} onChange={handleChange('heroBannerCTA')} /></F>
                  <F><TextField label="CTA Link URL" fullWidth size="small"
                    placeholder="/products/school-bags"
                    value={form.heroBannerUrl || ''} onChange={handleChange('heroBannerUrl')} /></F>
                </Row>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* ── RIGHT: sticky image + summary ── */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: '80px' }}>
            <Paper elevation={0} sx={{ border: '1px solid #e8eaed', borderRadius: '10px',
              overflow: 'hidden' }}>
              <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8f9fa', borderBottom: '1px solid #e8eaed' }}>
                <Typography variant="subtitle2"
                  sx={{ fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.09em',
                    textTransform: 'uppercase', color: '#5f6368' }}>
                  Product Images
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1–5 images · JPG, PNG · max 5 MB
                </Typography>
              </Box>
              <Box sx={{ p: 2.5 }}>
                <ProductImageUpload
                  images={form.images}
                  onChange={handleImagesChange}
                  error={errors.images}
                  selectedColors={form.selectedColors || []}
                />
              </Box>
            </Paper>

            {(form.productName || form.mrpPrice) && (
              <Paper elevation={0} sx={{ border: '1px solid #e8eaed', borderRadius: '10px',
                overflow: 'hidden', mt: 2 }}>
                <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8f9fa', borderBottom: '1px solid #e8eaed' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.72rem',
                    letterSpacing: '0.09em', textTransform: 'uppercase', color: '#5f6368' }}>
                    Summary
                  </Typography>
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Stack spacing={1.25}>
                    {[
                      ['Name',     form.productName || '—'],
                      ['Category', form.categoryName || '—'],
                      ['MRP',      form.mrpPrice     ? `₹${form.mrpPrice}`     : '—'],
                      ['Selling',  form.sellingPrice ? `₹${form.sellingPrice}` : '—'],
                      ['Stock',    form.stock || '—'],
                      ['Status',   form.stockStatus === 'in_stock' ? '✅ In Stock' : '❌ Out of Stock'],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', borderBottom: '1px solid #f1f3f4', pb: 1,
                        '&:last-child': { border: 'none', pb: 0 } }}>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                        <Typography variant="caption" fontWeight={600}
                          sx={{ maxWidth: '62%', textAlign: 'right', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* ── Sticky actions ── */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e8eaed',
        display: 'flex', gap: 1.5, justifyContent: 'flex-end', flexWrap: 'wrap',
        position: 'sticky', bottom: 0, bgcolor: '#fff', zIndex: 10, pb: 0.5 }}>
        <Button onClick={onCancel} disabled={loading} color="inherit"
          sx={{ borderRadius: '8px' }}>Cancel</Button>
        <Button variant="outlined" disabled={loading}
          onClick={() => submitProduct('draft')}
          sx={{ borderRadius: '8px', minWidth: 130 }}>Save as Draft</Button>
        <Button variant="contained" disabled={loading}
          onClick={() => submitProduct('published')}
          sx={{ borderRadius: '8px', minWidth: 150 }}>
          {loading
            ? (isEditing ? 'Updating…' : 'Publishing…')
            : (isEditing ? 'Update Product' : 'Publish Product')}
        </Button>
      </Box>
    </Box>
  );
}

export default AddNewProduct;
