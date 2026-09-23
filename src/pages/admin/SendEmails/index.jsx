/**
 * SendEmails/index.jsx — Admin Email Campaigns Page
 * Premium card layout matching API response shape
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Chip,
  CircularProgress, Alert, Stack, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField, InputAdornment, Divider,
} from '@mui/material';
import AddIcon             from '@mui/icons-material/Add';
import CloseIcon           from '@mui/icons-material/Close';
import MailOutlinedIcon    from '@mui/icons-material/MailOutlined';
import ImageOutlinedIcon   from '@mui/icons-material/ImageOutlined';
import DeleteOutlinedIcon  from '@mui/icons-material/DeleteOutlined';
import PeopleOutlinedIcon  from '@mui/icons-material/PeopleOutlined';
import SendOutlinedIcon    from '@mui/icons-material/SendOutlined';
import DraftsOutlinedIcon  from '@mui/icons-material/DraftsOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import RefreshIcon         from '@mui/icons-material/Refresh';
import EventOutlinedIcon   from '@mui/icons-material/EventOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { useMailHistory, useMailForm, RECIPIENT_GROUPS } from './SendEmailsData';
import { MEDIA_BASE, CAT_IMG_BASE } from '../../../Config/UrlsConfig';
import './index.scss';

const MAX_BANNER_MB = 2;

// ── Status chip ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Completed', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
    sending:   { label: 'Sending',   bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
    draft:     { label: 'Draft',     bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' },
    failed:    { label: 'Failed',    bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' },
  };
  const s = map[status?.toLowerCase()] || map.draft;
  return (
    <Chip label={s.label} size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: '0.7rem',
        border: `1px solid ${s.border}` }} />
  );
}

// ── Rich Text Editor ──────────────────────────────────────────
function RichEditor({ value, onChange, error }) {
  const ref = useRef(null);

  // Initialise content ONCE on mount — never touch innerHTML after that
  // (touching it resets cursor position, causing the "reverse typing" bug)
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = useCallback((cmd, val = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const COLORS = ['#000','#1565c0','#dc2626','#16a34a','#d97706','#7c3aed','#db2777'];

  return (
    <Box className={`rte${error ? ' rte--error' : ''}`}>
      <div className="rte__toolbar">
        {/* Font size */}
        <select className="rte__select" title="Font Size" defaultValue=""
          onChange={e => exec('fontSize', e.target.value)}>
          <option value="" disabled>Size</option>
          {['12px','14px','16px','18px','20px','24px','28px','32px'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="rte__divider"/>
        <Tooltip title="Bold"><button type="button" className="rte__btn" onClick={() => exec('bold')}><b>B</b></button></Tooltip>
        <Tooltip title="Italic"><button type="button" className="rte__btn" onClick={() => exec('italic')}><i>I</i></button></Tooltip>
        <Tooltip title="Underline"><button type="button" className="rte__btn" onClick={() => exec('underline')}><u>U</u></button></Tooltip>
        <Tooltip title="Strikethrough"><button type="button" className="rte__btn" onClick={() => exec('strikeThrough')}><s>S</s></button></Tooltip>
        <div className="rte__divider"/>
        <Tooltip title="Align Left"><button type="button" className="rte__btn" onClick={() => exec('justifyLeft')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </button></Tooltip>
        <Tooltip title="Center"><button type="button" className="rte__btn" onClick={() => exec('justifyCenter')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="5" y1="18" x2="19" y2="18"/></svg>
        </button></Tooltip>
        <Tooltip title="Align Right"><button type="button" className="rte__btn" onClick={() => exec('justifyRight')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </button></Tooltip>
        <div className="rte__divider"/>
        <Tooltip title="Bullet list"><button type="button" className="rte__btn" onClick={() => exec('insertUnorderedList')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
        </button></Tooltip>
        <Tooltip title="Numbered list"><button type="button" className="rte__btn" onClick={() => exec('insertOrderedList')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/></svg>
        </button></Tooltip>
        <div className="rte__divider"/>
        <Tooltip title="Insert link"><button type="button" className="rte__btn" onClick={() => { const u = prompt('URL:'); if (u) exec('createLink', u); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </button></Tooltip>
        <Tooltip title="Clear formatting"><button type="button" className="rte__btn" onClick={() => exec('removeFormat')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h13M5 7h13M11 3v13M7 17l5 5 1-5"/></svg>
        </button></Tooltip>
        <div className="rte__divider"/>
        <div className="rte__colours">
          {COLORS.map(c => (
            <button key={c} type="button" className="rte__colour"
              style={{ background: c }} title={c}
              onClick={() => exec('foreColor', c)} />
          ))}
        </div>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        className="rte__body"
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        data-placeholder="Write your email body here…"
      />
      {error && <p className="rte__error">{error}</p>}
    </Box>
  );
}

// ── Banner uploader ───────────────────────────────────────────
function BannerUpload({ file, preview, onFile, error }) {
  const inputRef = useRef(null);
  return (
    <Box>
      <Typography variant="caption" fontWeight={700} color="#374151"
        sx={{ display: 'block', mb: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
        Banner Image
        <Typography component="span" variant="caption" color="text.secondary" ml={1}>
          (optional, max {MAX_BANNER_MB}MB — JPG/PNG/WebP)
        </Typography>
      </Typography>

      {preview ? (
        <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          <img src={preview} alt="Banner"
            style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 10,
              border: '1px solid #e4e7ec', display: 'block' }} />
          <IconButton size="small" onClick={() => onFile(null)}
            sx={{ position: 'absolute', top: 6, right: 6,
              bgcolor: 'rgba(0,0,0,0.65)', color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' } }}>
            <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ) : (
        <Box onClick={() => inputRef.current?.click()} sx={{
          border: `2px dashed ${error ? '#dc2626' : '#d1d5db'}`,
          borderRadius: '12px', p: 3,
          textAlign: 'center', cursor: 'pointer', bgcolor: '#fafafa',
          transition: 'all 0.15s',
          '&:hover': { borderColor: '#1565c0', bgcolor: '#f0f7ff' },
        }}>
          <ImageOutlinedIcon sx={{ fontSize: 36, color: '#9ca3af', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Click to upload banner
          </Typography>
          <Typography variant="caption" color="text.secondary">
            JPG, PNG, WebP — max {MAX_BANNER_MB}MB
          </Typography>
        </Box>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden
        onChange={e => onFile(e.target.files?.[0] || null)} />
      {error && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{error}</Typography>}
    </Box>
  );
}

// ── Send Mail Modal ───────────────────────────────────────────
function SendMailModal({ open, onClose, onSent }) {
  const { form, set, setBanner, errors, sending, handleSend, reset } =
    useMailForm({ onSuccess: () => { onSent(); onClose(); } });

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden', maxHeight: '95vh' } }}>

      {/* Gradient header */}
      <Box sx={{
        background: 'linear-gradient(135deg,#1a2236 0%,#1565c0 100%)',
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MailOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#fff">New Email Campaign</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Compose and send to customers
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose}
          sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5, bgcolor: '#f8fafc' }}>
        <Stack spacing={2.25}>

          {/* Banner */}
          <BannerUpload file={form.banner} preview={form.bannerPreview}
            onFile={setBanner} error={errors.banner} />

          {/* Subject */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="#374151"
              sx={{ display: 'block', mb: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              Subject <span style={{ color: '#dc2626' }}>*</span>
            </Typography>
            <TextField size="small" fullWidth
              placeholder="e.g. Exclusive offer just for you!"
              value={form.subject}
              onChange={e => set('subject')(e.target.value)}
              error={!!errors.subject}
              helperText={errors.subject}
              sx={{ bgcolor: '#fff', '& .MuiInputBase-root': { borderRadius: '10px' } }}
            />
          </Box>

          {/* Recipient type */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="#374151"
              sx={{ display: 'block', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              Recipients <span style={{ color: '#dc2626' }}>*</span>
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 1 }}>
              {RECIPIENT_GROUPS.map(g => {
                const selected = form.recipient_type === g.value;
                return (
                  <Box key={g.value} component="label" sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    p: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    border: `1.5px solid ${selected ? '#1565c0' : '#e5e7eb'}`,
                    bgcolor: selected ? '#eff6ff' : '#fff',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: '#1565c0' },
                  }}>
                    <input type="radio" name="recipient_type"
                      checked={selected}
                      onChange={() => set('recipient_type')(g.value)}
                      style={{ accentColor: '#1565c0', width: 15, height: 15, flexShrink: 0 }} />
                    <Typography variant="body2" fontWeight={selected ? 700 : 500}
                      color={selected ? '#1565c0' : '#374151'} sx={{ fontSize: '0.82rem' }}>
                      {g.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Custom emails */}
          {form.recipient_type === 'custom' && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="#374151"
                sx={{ display: 'block', mb: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
                Custom Emails <span style={{ color: '#dc2626' }}>*</span>
              </Typography>
              <TextField size="small" fullWidth multiline rows={3}
                placeholder="Comma or newline separated emails"
                value={form.custom_emails}
                onChange={e => set('custom_emails')(e.target.value)}
                sx={{ bgcolor: '#fff', '& .MuiInputBase-root': { borderRadius: '10px' } }}
              />
            </Box>
          )}

          {/* Body — rich editor */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="#374151"
              sx={{ display: 'block', mb: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              Email Body <span style={{ color: '#dc2626' }}>*</span>
            </Typography>
            <RichEditor
              value={form.email_body}
              onChange={val => set('email_body')(val)}
              error={errors.body}
            />
          </Box>

          {/* Footer */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="#374151"
              sx={{ display: 'block', mb: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
              Email Footer
            </Typography>
            <TextField size="small" fullWidth
              value={form.email_footer}
              onChange={e => set('email_footer')(e.target.value)}
              sx={{ bgcolor: '#fff', '& .MuiInputBase-root': { borderRadius: '10px' } }}
            />
          </Box>

        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e4e7ec', bgcolor: '#fff', gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="small"
          sx={{ borderColor: '#d0d5dd', color: '#344054', borderRadius: '10px',
            fontWeight: 600, textTransform: 'none', px: 2.5 }}>
          Cancel
        </Button>
        <Button variant="contained" size="small"
          onClick={handleSend} disabled={sending}
          startIcon={sending ? <CircularProgress size={14} color="inherit" /> : <SendOutlinedIcon />}
          sx={{
            background: 'linear-gradient(135deg,#1a2236,#1565c0)',
            borderRadius: '10px', fontWeight: 700, textTransform: 'none',
            boxShadow: '0 4px 14px rgba(21,101,192,.3)', px: 2.5,
            '&:hover': { background: 'linear-gradient(135deg,#111827,#0d47a1)' },
          }}>
          {sending ? 'Sending…' : 'Send Campaign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Campaign Detail Modal ─────────────────────────────────────
function CampaignDetailModal({ campaign, onClose }) {
  if (!campaign) return null;
  const fmtDate = (d) => d
    ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
  const recipientLabel = RECIPIENT_GROUPS.find(g => g.value === campaign.recipient_type)?.label || campaign.recipient_type;
  // API returns "uploads/email_banners/..." → base is smc/admin/api/
  const bannerUrl = campaign.banner_image
    ? (campaign.banner_image.startsWith('http') ? campaign.banner_image : `${CAT_IMG_BASE}${campaign.banner_image}`)
    : null;

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>

      {/* Gradient header */}
      <Box sx={{
        background: 'linear-gradient(135deg,#1a2236 0%,#1565c0 100%)',
        px: 3, py: 2.5,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2,
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <StatusBadge status={campaign.status} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
              Campaign #{campaign.id}
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={800} color="#fff" sx={{ lineHeight: 1.3 }}>
            {campaign.subject}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 0, py: 0 }}>
        {/* Banner */}
        {bannerUrl && (
          <Box sx={{ width: '100%', maxHeight: 220, overflow: 'hidden', bgcolor: '#f3f4f6' }}>
            <img src={bannerUrl} alt="Campaign banner"
              style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
          </Box>
        )}

        <Box sx={{ px: 3, py: 3 }}>
          {/* Stats */}
          <Box sx={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, mb: 3,
          }}>
            {[
              { label: 'Recipients', value: campaign.total_recipients ?? 0, color: '#1565c0', bg: '#eff6ff' },
              { label: 'Sent',       value: campaign.total_sent       ?? 0, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Failed',     value: campaign.total_failed     ?? 0, color: campaign.total_failed > 0 ? '#dc2626' : '#9ca3af', bg: campaign.total_failed > 0 ? '#fef2f2' : '#f9fafb' },
              { label: 'Type',       value: recipientLabel,                  color: '#7c3aed', bg: '#fdf4ff', small: true },
            ].map(s => (
              <Box key={s.label} sx={{ p: 1.5, borderRadius: '12px', bgcolor: s.bg, textAlign: 'center' }}>
                <Typography sx={{ fontSize: s.small ? '0.78rem' : '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1.2 }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Meta */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2.5 }}>
            {[
              { label: 'Created At', value: fmtDate(campaign.created_at) },
              { label: 'Sent At',    value: fmtDate(campaign.sent_at) },
              { label: 'Created By', value: campaign.created_by_email },
              { label: 'Footer',     value: campaign.email_footer },
            ].map(m => (
              <Box key={m.label}>
                <Typography variant="caption" fontWeight={700} color="#9ca3af"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.3 }}>
                  {m.label}
                </Typography>
                <Typography variant="body2" color="#374151" fontWeight={500}>{m.value || '—'}</Typography>
              </Box>
            ))}
          </Box>

          {/* Custom emails */}
          {Array.isArray(campaign.custom_emails) && campaign.custom_emails.length > 0 && (
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" fontWeight={700} color="#9ca3af"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.75 }}>
                Custom Email Recipients ({campaign.custom_emails.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {campaign.custom_emails.map((e, i) => (
                  <Chip key={i} label={e} size="small"
                    sx={{ bgcolor: '#f3f4f6', color: '#374151', fontSize: '0.72rem' }} />
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 2.5 }} />

          {/* Email body preview */}
          <Box>
            <Typography variant="caption" fontWeight={700} color="#9ca3af"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
              Email Body Preview
            </Typography>
            <Box sx={{
              border: '1px solid #e5e7eb', borderRadius: '10px',
              p: 2.5, bgcolor: '#fafafa', maxHeight: 280, overflowY: 'auto',
              fontSize: '14px', lineHeight: 1.7, color: '#374151',
            }}
              dangerouslySetInnerHTML={{ __html: campaign.email_body || '<em>No body content</em>' }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e4e7ec', bgcolor: '#fafafa' }}>
        <Button onClick={onClose} variant="outlined" size="small"
          sx={{ borderColor: '#d0d5dd', color: '#344054', borderRadius: '10px',
            fontWeight: 600, textTransform: 'none', px: 2.5 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Campaign Card ─────────────────────────────────────────────
function CampaignCard({ campaign, onView }) {
  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  const recipientLabel = RECIPIENT_GROUPS.find(g => g.value === campaign.recipient_type)?.label
    || campaign.recipient_type || '—';

  // API returns "uploads/email_banners/..." → base is smc/admin/api/
  const bannerUrl = campaign.banner_image
    ? (campaign.banner_image.startsWith('http') ? campaign.banner_image : `${CAT_IMG_BASE}${campaign.banner_image}`)
    : null;

  return (
    <div className="se__card">
      {/* Banner */}
      {bannerUrl && (
        <div className="se__card-banner">
          <img src={bannerUrl} alt="Campaign banner"
            onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
        </div>
      )}

      {/* Card body */}
      <div className="se__card-body">
        <div className="se__card-top">
          <StatusBadge status={campaign.status} />
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
            #{campaign.id}
          </Typography>
        </div>

        <Typography variant="subtitle2" fontWeight={700} color="#111827"
          sx={{ mt: 0.75, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {campaign.subject}
        </Typography>

        <Typography variant="caption" color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <PeopleOutlinedIcon sx={{ fontSize: 13 }} /> {recipientLabel}
        </Typography>

        {/* Stats row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, mb: 1.25,
          py: 1.25, borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}>
          {[
            { label: 'Recipients', value: campaign.total_recipients ?? 0, color: '#1565c0' },
            { label: 'Sent',       value: campaign.total_sent       ?? 0, color: '#16a34a' },
            { label: 'Failed',     value: campaign.total_failed     ?? 0, color: campaign.total_failed > 0 ? '#dc2626' : '#9ca3af' },
          ].map(s => (
            <Box key={s.label} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {s.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Footer — dates + view button */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          mt: 1.25, pt: 1.25, borderTop: '1px solid #f3f4f6' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
            <Typography variant="caption" color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.7rem' }}>
              <EventOutlinedIcon sx={{ fontSize: 11 }} />
              {fmtDate(campaign.created_at)}
            </Typography>
            {campaign.sent_at && (
              <Typography variant="caption" color="#16a34a"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.7rem' }}>
                <SendOutlinedIcon sx={{ fontSize: 11 }} />
                Sent {fmtDate(campaign.sent_at)}
              </Typography>
            )}
          </Box>
          <Tooltip title="View details">
            <IconButton size="small" onClick={() => onView(campaign)}
              sx={{ bgcolor: '#eff6ff', color: '#1565c0', borderRadius: '8px',
                '&:hover': { bgcolor: '#dbeafe' } }}>
              <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function SendEmailsPage() {
  const [modalOpen,     setModalOpen]     = useState(false);
  const [viewCampaign,  setViewCampaign]  = useState(null);
  const {
    campaigns, summary, loading, error,
    startDate, setStartDate,
    endDate, setEndDate,
    refetch,
  } = useMailHistory();

  const stats = [
    { label: 'Total Campaigns',  value: summary?.total_campaigns  ?? 0, color: '#1565c0', bg: '#eff6ff', border: '#bfdbfe', icon: <MailOutlinedIcon /> },
    { label: 'Completed',        value: summary?.completed        ?? 0, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: <CheckCircleOutlinedIcon /> },
    { label: 'Sending',          value: summary?.sending          ?? 0, color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc', icon: <SendOutlinedIcon /> },
    { label: 'Drafts',           value: summary?.draft            ?? 0, color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb', icon: <DraftsOutlinedIcon /> },
    { label: 'Total Emails Sent',value: summary?.total_emails_sent ?? 0, color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff', icon: <PeopleOutlinedIcon /> },
  ];

  return (
    <Box className="se">

      {/* Header */}
      <Box className="se__header">
        <Box>
          <Typography variant="h5" fontWeight={800} color="#101828">Email Campaigns</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.4}>
            Create and send promotional email campaigns to customers.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{
            background: 'linear-gradient(135deg,#1a2236,#1565c0)',
            borderRadius: '10px', fontWeight: 700, textTransform: 'none',
            px: 2.5, boxShadow: '0 4px 14px rgba(21,101,192,.3)',
            '&:hover': { background: 'linear-gradient(135deg,#111827,#0d47a1)' },
          }}>
          Send New Mail
        </Button>
      </Box>

      {/* Stats */}
      <Box className="se__stats">
        {stats.map(s => (
          <Paper key={s.label} elevation={0} className="se__stat"
            sx={{ bgcolor: s.bg, border: `1px solid ${s.border}` }}>
            <Box className="se__stat-icon" sx={{ bgcolor: `${s.color}18`, color: s.color }}>
              {s.icon}
            </Box>
            <Box>
              <div className="se__stat-val" style={{ color: s.color }}>{s.value}</div>
              <div className="se__stat-lbl">{s.label}</div>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Date filters */}
      <Box className="se__filters">
        <TextField size="small" type="date" label="From"
          value={startDate} onChange={e => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150, '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#fff' } }} />
        <TextField size="small" type="date" label="To"
          value={endDate} onChange={e => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150, '& .MuiInputBase-root': { borderRadius: '10px', bgcolor: '#fff' } }} />
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={() => refetch()} disabled={loading}
            sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {!loading && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}

      {/* Campaign cards */}
      {loading ? (
        <Box className="se__grid">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="se__skeleton" />)}
        </Box>
      ) : campaigns.length === 0 ? (
        <Box className="se__empty">
          <MailOutlinedIcon sx={{ fontSize: 52, color: '#d1d5db', mb: 1.5 }} />
          <Typography variant="h6" fontWeight={700} color="#374151" mb={0.5}>No campaigns yet</Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            Send your first email campaign to engage customers.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}
            sx={{ background: 'linear-gradient(135deg,#1a2236,#1565c0)', borderRadius: '10px',
              fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}>
            Send New Mail
          </Button>
        </Box>
      ) : (
        <Box className="se__grid">
          {campaigns.map((c, i) => <CampaignCard key={c.id ?? i} campaign={c} onView={setViewCampaign} />)}
        </Box>
      )}

      <SendMailModal open={modalOpen} onClose={() => setModalOpen(false)} onSent={refetch} />

      {viewCampaign && (
        <CampaignDetailModal campaign={viewCampaign} onClose={() => setViewCampaign(null)} />
      )}
    </Box>
  );
}
