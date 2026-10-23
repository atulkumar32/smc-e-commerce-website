import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Alert,
  Stack,
  Chip,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
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
    ...staged.map((v) => ({ ...v, _source: 'staged' })),
    ...savedVariants.map((v) => ({ ...v, _source: 'saved' })),
  ];

  const Dot = ({ hex }) => (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: hex || '#ccc',
        border: '1px solid #ddd',
      }}
    />
  );

  return (
    <Box className="apv__list" sx={{ mt: 5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography className="apv__list-head">
          Variant List ({allRows.length})
        </Typography>
      </Stack>

      <Box className="apv__list-table">
        <Table size="small">
          <TableHead>
            <TableRow>
              {['#', 'Color', 'Size', 'MRP', 'Discount%', 'Selling', 'Stock', 'Default', 'Status', 'Actions'].map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {allRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4, color: '#64748b' }}>
                  No variants added yet. Configure color and pricing above, then click &quot;Add Variants to List&quot;.
                </TableCell>
              </TableRow>
            ) : (
              allRows.map((v, i) => {
                const isStaged = v._source === 'staged';
                const mrp = Number(v.mrp || 0);
                const selling = Number(v.selling_price || 0);
                const disc =
                  v.discount_percent != null && v.discount_percent !== ''
                    ? v.discount_percent
                    : mrp > 0 && selling > 0
                    ? Math.round((1 - selling / mrp) * 100)
                    : 0;

                return (
                  <TableRow key={v._localId || v.variant_id || v.id || i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Dot hex={v.color_hex} /> {v.color_name}
                      </Stack>
                    </TableCell>
                    <TableCell>{v.size || 'Free Size'}</TableCell>
                    <TableCell>₹{mrp.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{disc}%</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1565c0' }}>
                      ₹{selling.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>{v.stock ?? 0}</TableCell>
                    <TableCell>
                      {v.is_default ? <CheckCircleIcon color="primary" fontSize="small" /> : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isStaged ? 'Pending Save' : 'Saved'}
                        size="small"
                        color={isStaged ? 'warning' : 'success'}
                        variant={isStaged ? 'outlined' : 'filled'}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      {isStaged ? (
                        <Tooltip title="Remove staged variant">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onRemoveStaged(v._localId)}
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Saved
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

function AddNewVariant({ productId, editingVariant = null, onSuccess, onCancel }) {
  const [form, setForm] = useState(() => {
    if (editingVariant) {
      return {
        ...emptyVariantForm,
        color_name: editingVariant.color_name || '',
        color_hex: editingVariant.color_hex || '#1976d2',
        size: editingVariant.size || 'Free Size',
        mrp: editingVariant.mrp || '',
        selling_price: editingVariant.selling_price || '',
        discount_percent: editingVariant.discount_percent || '',
        stock: editingVariant.stock || '',
        status: editingVariant.status || 'active',
        is_default: Boolean(editingVariant.is_default),
        selectedColors: editingVariant.color_name
          ? [{
              id: editingVariant.color_id || 'edit-c',
              label: editingVariant.color_name,
              hex: editingVariant.color_hex || '#1976d2',
              images: Array.isArray(editingVariant.images) ? editingVariant.images : [],
            }]
          : [],
      };
    }
    return emptyVariantForm;
  });

  const [staged, setStaged] = useState([]);
  const [savedVariants, setSavedVariants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const formTopRef = useRef(null);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    fetchVariantsAction(productId).then((res) => {
      if (!cancelled) setSavedVariants(Array.isArray(res) ? res : []);
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleFieldChange = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleColorsChange = (newColors) => {
    setForm((p) => ({ ...p, selectedColors: newColors }));
  };

  const handleAddToList = () => {
    const colors = form.selectedColors || [];
    if (colors.length === 0) {
      alert('Please add at least one color with images before adding to the list.');
      return;
    }

    const mrp = Number(form.mrp || 0);
    if (!mrp || mrp <= 0) {
      alert('Please enter a valid MRP greater than 0.');
      return;
    }

    const newVariants = colors.map((colorItem) => {
      const sellingPrice = Number(form.selling_price || mrp);
      return {
        color_name: colorItem.label,
        color_hex: colorItem.hex,
        size: form.size || 'Free Size',
        mrp,
        discount_percent: Math.max(0, Math.min(100, Number(form.discount_percent || 0))),
        selling_price: sellingPrice,
        discount_price: sellingPrice,
        stock: Number(form.stock || 0),
        status: form.status || 'active',
        is_default: Boolean(form.is_default),
        images: Array.isArray(colorItem.images) ? colorItem.images : [],
        _localId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        _source: 'staged',
      };
    });

    setStaged((prev) => [...prev, ...newVariants]);
    setForm(emptyVariantForm);
  };

  const handleSaveAll = async () => {
    if (!Array.isArray(staged) || staged.length === 0) {
      setSubmitError('No variants to save. Add at least one variant to the list first.');
      return;
    }

    setSaving(true);
    setSubmitError('');

    try {
      const result = await createVariantsBulkAction(productId, staged);
      console.log('✅ [Variants] Bulk save success:', result);
      setStaged([]);

      // Refresh saved variants
      const fresh = await fetchVariantsAction(productId);
      setSavedVariants(Array.isArray(fresh) ? fresh : []);

      onSuccess?.(result);
    } catch (err) {
      console.error('❌ [Variants] Bulk save failed:', err.message);
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

        <Grid xs={12} md={7}>
          <ColorsImagesSection
            selectedColors={form.selectedColors || []}
            onColorsChange={handleColorsChange}
          />
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'right', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddCircleOutlinedIcon />}
          onClick={handleAddToList}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            py: 1,
          }}
        >
          Add Variants to List
        </Button>
      </Box>

      <StagedTable
        staged={staged}
        savedVariants={savedVariants}
        onRemoveStaged={(id) => setStaged((p) => p.filter((v) => v._localId !== id))}
      />

      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        alignItems="center"
        sx={{ mt: 4 }}
      >
        {onCancel && (
          <Button
            variant="outlined"
            size="large"
            onClick={onCancel}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancel
          </Button>
        )}

        {staged.length > 0 && (
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleSaveAll}
            disabled={saving}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3.5,
              py: 1,
            }}
          >
            {saving ? 'Saving Variants…' : `Save ${staged.length} Variant(s) to Server`}
          </Button>
        )}
      </Stack>

      {submitError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
          {submitError}
        </Alert>
      )}
    </Box>
  );
}

export default AddNewVariant;
