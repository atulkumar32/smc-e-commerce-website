import { Grid, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, InputAdornment } from '@mui/material';
import { SIZE_OPTIONS, STATUS_OPTIONS } from '../../AddNewVarientsData';

export default function LeftsideSections({ productId, form, onChange }) {
  const set = (e) => onChange(e.target.name, e.target.value);

  const handleMrpChange = (e) => {
    const mrp = e.target.value;
    onChange('mrp', mrp);
    const disc = Number(form.discount_percent || 0);
    onChange('selling_price', (Number(mrp || 0) * (1 - disc / 100)).toFixed(2));
  };

  const handleDiscountChange = (e) => {
    let pct = Math.max(0, Math.min(100, Number(e.target.value)));
    onChange('discount_percent', pct);
    onChange('selling_price', (Number(form.mrp || 0) * (1 - pct / 100)).toFixed(2));
  };

  return (
    <Grid item xs={12} md={5}>
      <Typography className="apv__head">Common Details</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField fullWidth size="small" label="Product ID" value={productId || ''} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Size</InputLabel>
            <Select name="size" value={form.size || 'Free Size'} onChange={set} label="Size">
              <MenuItem value="Free Size">Free Size</MenuItem>
              {SIZE_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="MRP *" type="number" name="mrp" value={form.mrp || ''} onChange={handleMrpChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Discount %" type="number" name="discount_percent" value={form.discount_percent || ''} onChange={handleDiscountChange} helperText="0-100%" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Selling Price" type="number" value={form.selling_price || ''} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, readOnly: true }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Stock *" type="number" name="stock" value={form.stock || ''} onChange={set} InputProps={{ endAdornment: <InputAdornment position="end">pcs</InputAdornment> }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={form.status || 'active'} onChange={set} label="Status">
              {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel control={<Switch checked={Boolean(form.is_default)} onChange={(e) => onChange('is_default', e.target.checked)} />} label="Default Variant" />
        </Grid>
      </Grid>
    </Grid>
  );
}