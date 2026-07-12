export const SIZE_OPTIONS = [
  'XS', 'S', 'Small', 'M', 'Medium', 'L', 'Large', 'XL', 'XXL',
  '10 Inch', '12 Inch', '14 Inch', '16 Inch', '18 Inch', '20 Inch',
  'Free Size',
];

export const MATERIAL_OPTIONS = [
  'Polyester', 'Nylon', 'Canvas', 'Leather', 'PU Leather',
  'Cotton Blend', 'Recycled Fabric',
];

export const COLOR_OPTIONS = [
  { label: 'Black',      hex: '#000000' },
  { label: 'Navy Blue',  hex: '#1a237e' },
  { label: 'Royal Blue', hex: '#1565c0' },
  { label: 'Red',        hex: '#c62828' },
  { label: 'Pink',       hex: '#ec407a' },
  { label: 'Purple',     hex: '#7b1fa2' },
  { label: 'Green',      hex: '#2e7d32' },
  { label: 'Yellow',     hex: '#f9a825' },
  { label: 'Orange',     hex: '#ef6c00' },
  { label: 'Grey',       hex: '#757575' },
  { label: 'White',      hex: '#ffffff' },
  { label: 'Brown',      hex: '#5d4037' },
  { label: 'Blue',       hex: '#1976d2' },
];

export const STATUS_OPTIONS = ['active', 'inactive', 'draft'];

export const VARIANT_IMAGE_MAX = 5;
export const VARIANT_IMAGE_ACCEPT = '.jpg,.jpeg,.png,image/jpeg,image/png';

/**
 * Empty form — no sku (backend generates), no barcode/weight (optional).
 * discount_percent triggers auto-calculation of selling_price.
 */
export const emptyVariantForm = {
  color_name:       '',
  color_hex:        '#1976d2',
  size:             '',
  mrp:              '',
  discount_percent: '',
  selling_price:    '',
  stock:            '',
  status:           'active',
  is_default:       false,
  images:           [],
};

/**
 * Validate variant form fields.
 * Returns { fieldName: errorMsg } object. Empty = valid.
 */
export function validateVariantForm(form) {
  const errors = {};

  if (!form.color_name?.trim())
    errors.color_name = 'Please select a color';

  if (!form.size?.trim())
    errors.size = 'Please select a size';

  const mrp = Number(form.mrp);
  if (!form.mrp || isNaN(mrp) || mrp <= 0)
    errors.mrp = 'MRP must be greater than 0';

  const sp = Number(form.selling_price);
  if (!form.selling_price || isNaN(sp) || sp <= 0)
    errors.selling_price = 'Selling price must be greater than 0';
  else if (sp > mrp)
    errors.selling_price = 'Selling price cannot exceed MRP';

  const stock = Number(form.stock);
  if (form.stock === '' || isNaN(stock) || stock < 0)
    errors.stock = 'Stock must be 0 or more';

  return errors;
}
