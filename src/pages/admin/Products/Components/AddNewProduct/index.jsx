import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Button,
  Alert,
  CircularProgress,
  FormHelperText,
  Box,
} from '@mui/material';
import {
  MATERIAL_OPTIONS,
  GENDER_OPTIONS,
  BACKPACK_STYLE_OPTIONS,
  BAG_CAPACITY_OPTIONS,
  NET_QUANTITY_OPTIONS,
  NET_WEIGHT_OPTIONS,
  COLOR_OPTIONS,
  DEFAULT_COUNTRY_OF_ORIGIN,
  DEFAULT_SIZE,
  BRAND_OPTIONS,
  PATTERN_OPTIONS,
  CHARACTER_OPTIONS,
  CLASS_OPTIONS,
  RECOMMENDED_AGE_OPTIONS,
  DISCOUNT_MIN,
  DISCOUNT_MAX,
} from './AddNewProductData';
import ProductImageUpload from './ProductImageUpload';
import useAddNewProduct from './useAddNewProduct';
import './index.scss';

function AddNewProduct({ editingProduct = null, onSuccess, onCancel }) {
  const {
    form,
    errors,
    submitError,
    loading,
    isEditing,
    categories,
    categoriesLoading,
    categoriesError,
    handleChange,
    handleCategoryChange,
    handleImagesChange,
    handleColorSelect,
    submitProduct,
  } = useAddNewProduct({ editingProduct, onSuccess });

  return (
    <Box className="add-new-product">
      {submitError && (
        <Alert severity="error" className="add-new-product__error-banner">
          {submitError}
        </Alert>
      )}

      <Typography className="add-new-product__section-title">
        Product Images
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <ProductImageUpload
        images={form.images}
        onChange={handleImagesChange}
        error={errors.images}
      />

      <Typography className="add-new-product__section-title">
        Basic Information
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Product Name"
            fullWidth
            required
            value={form.productName}
            onChange={handleChange('productName')}
            error={Boolean(errors.productName)}
            helperText={errors.productName}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Generic Name"
            fullWidth
            required
            value={form.genericName}
            onChange={handleChange('genericName')}
            error={Boolean(errors.genericName)}
            helperText={errors.genericName}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(errors.brand)}>
            <InputLabel>Brand</InputLabel>
            <Select
              label="Brand"
              value={form.brand}
              onChange={handleChange('brand')}
            >
              {BRAND_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {errors.brand && <FormHelperText>{errors.brand}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            required
            error={Boolean(errors.categoryId)}
            disabled={categoriesLoading}
          >
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={form.categoryId}
              onChange={handleCategoryChange}
            >
              {categoriesLoading && (
                <MenuItem disabled value="">
                  Loading categories…
                </MenuItem>
              )}
              {!categoriesLoading && categories.length === 0 && (
                <MenuItem disabled value="">
                  No categories — add one in Categories page
                </MenuItem>
              )}
              {categories.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {(errors.categoryId || categoriesError) && (
              <FormHelperText error>
                {errors.categoryId || categoriesError}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Price (₹)"
            type="number"
            fullWidth
            required
            inputProps={{ min: 0.01, step: 0.01 }}
            value={form.price}
            onChange={handleChange('price')}
            error={Boolean(errors.price)}
            helperText={errors.price || 'Selling price shown on the store'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Stock Quantity"
            type="number"
            fullWidth
            inputProps={{ min: 0, step: 1 }}
            value={form.stock}
            onChange={handleChange('stock')}
            error={Boolean(errors.stock)}
            helperText={errors.stock || 'Available units in inventory'}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" fontWeight={500} gutterBottom>
            Color *
          </Typography>
          <div className="add-new-product__color-picker">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.hex}
                type="button"
                className={`add-new-product__color-swatch${
                  form.colorHex === opt.hex
                    ? ' add-new-product__color-swatch--selected'
                    : ''
                }${
                  opt.hex === '#ffffff'
                    ? ' add-new-product__color-swatch--white'
                    : ''
                }`}
                style={{ backgroundColor: opt.hex }}
                title={opt.label}
                onClick={() => handleColorSelect(opt)}
                aria-label={opt.label}
              />
            ))}
          </div>
          {form.color && (
            <Typography className="add-new-product__color-label">
              Selected: {form.color}
            </Typography>
          )}
          {errors.color && (
            <FormHelperText error>{errors.color}</FormHelperText>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(errors.material)}>
            <InputLabel>Material</InputLabel>
            <Select
              label="Material"
              value={form.material}
              onChange={handleChange('material')}
            >
              {MATERIAL_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {errors.material && (
              <FormHelperText>{errors.material}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Pattern</InputLabel>
            <Select
              label="Pattern"
              value={form.pattern}
              onChange={handleChange('pattern')}
            >
              {PATTERN_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Character</InputLabel>
            <Select
              label="Character"
              value={form.character}
              onChange={handleChange('character')}
            >
              {CHARACTER_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(errors.gender)}>
            <InputLabel>Gender</InputLabel>
            <Select
              label="Gender"
              value={form.gender}
              onChange={handleChange('gender')}
            >
              {GENDER_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {errors.gender && (
              <FormHelperText>{errors.gender}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      <Typography className="add-new-product__section-title">
        Offers & Discounts
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.isOnOffer)}
                onChange={handleChange('isOnOffer')}
                color="primary"
              />
            }
            label="Offer"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(form.isDiscounted)}
                onChange={handleChange('isDiscounted')}
                color="primary"
              />
            }
            label="Discount"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {form.isDiscounted && (
            <TextField
              label={`Discount % (${DISCOUNT_MIN} - ${DISCOUNT_MAX})`}
              type="number"
              inputProps={{ min: DISCOUNT_MIN, max: DISCOUNT_MAX, step: 1 }}
              value={form.discountPercent}
              onChange={handleChange('discountPercent')}
              helperText={`Enter discount between ${DISCOUNT_MIN}% and ${DISCOUNT_MAX}%`}
              fullWidth
            />
          )}
        </Grid>
      </Grid>

      <Typography className="add-new-product__section-title">
        Bag Specifications
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select
              label="Class"
              value={form.productClass}
              onChange={handleChange('productClass')}
            >
              {CLASS_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(errors.backpackStyle)}>
            <InputLabel>Backpack Style</InputLabel>
            <Select
              label="Backpack Style"
              value={form.backpackStyle}
              onChange={handleChange('backpackStyle')}
            >
              {BACKPACK_STYLE_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {errors.backpackStyle && (
              <FormHelperText>{errors.backpackStyle}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(errors.bagCapacity)}>
            <InputLabel>Bag Capacity</InputLabel>
            <Select
              label="Bag Capacity"
              value={form.bagCapacity}
              onChange={handleChange('bagCapacity')}
            >
              {BAG_CAPACITY_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {errors.bagCapacity && (
              <FormHelperText>{errors.bagCapacity}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(errors.netQuantity)}>
            <InputLabel>Net Quantity</InputLabel>
            <Select
              label="Net Quantity"
              value={form.netQuantity}
              onChange={handleChange('netQuantity')}
            >
              {NET_QUANTITY_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {errors.netQuantity && (
              <FormHelperText>{errors.netQuantity}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(errors.recommendedAge)}>
            <InputLabel>Recommended Age</InputLabel>
            <Select
              label="Recommended Age"
              value={form.recommendedAge}
              onChange={handleChange('recommendedAge')}
            >
              {RECOMMENDED_AGE_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {errors.recommendedAge && (
              <FormHelperText>{errors.recommendedAge}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Size"
            fullWidth
            value={form.size}
            onChange={handleChange('size')}
            placeholder={DEFAULT_SIZE}
            helperText="Default: Free Size"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Country of Origin"
            fullWidth
            value={form.countryOfOrigin}
            onChange={handleChange('countryOfOrigin')}
            InputProps={{ readOnly: true }}
            helperText={`Default: ${DEFAULT_COUNTRY_OF_ORIGIN}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth required error={Boolean(errors.netWeight)}>
            <InputLabel>Net Weight</InputLabel>
            <Select
              label="Net Weight"
              value={form.netWeight}
              onChange={handleChange('netWeight')}
            >
              {NET_WEIGHT_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
            {errors.netWeight && (
              <FormHelperText>{errors.netWeight}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>

      <Box className="add-new-product__publish-row">
        <Box>
          <Typography fontWeight={600}>Go live / No live</Typography>
          <Typography variant="caption" color="text.secondary">
            Toggle "Go live" to mark product as visible on the website (optional)
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(form.isLive)}
              onChange={handleChange('isLive')}
              color="primary"
            />
          }
          label={form.isLive ? 'Go live' : 'No live'}
        />
      </Box>

      <Box className="add-new-product__actions">
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => submitProduct('draft')}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={() => submitProduct('published')}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          {isEditing ? 'Update Product' : 'Publish Product'}
        </Button>
      </Box>
    </Box>
  );
}

export default AddNewProduct;
