/**
 * SendEmailsData.jsx — data layer for the Email Campaigns admin page.
 *
 * API: CreateEmailCampaign.php  (multipart/form-data POST)
 *      GetEmailCampaigns.php    (GET ?start_date=&end_date=)
 *
 * Request fields (multipart):
 *   subject, email_body, recipient_type, email_footer,
 *   created_by_user_id, created_by_email, banner_image (file)
 *
 * Response (GET):
 *   { success, summary:{total_campaigns,completed,sending,draft,total_emails_sent},
 *     current_page, per_page, total_records, total_pages,
 *     data:[{ id, subject, email_body, banner_image, recipient_type, custom_emails,
 *             email_footer, total_recipients, total_sent, total_failed, status,
 *             created_by_user_id, created_by_email, created_at, sent_at }] }
 */

import { useState, useEffect, useCallback } from 'react';
import { toast }                             from 'react-toastify';
import { URL_SEND_MAIL, URL_MAIL_LIST }      from '../../../Config/UrlsConfig';
import { validateMailForm }                  from '../../../utils/adminValidation';

export const RECIPIENT_GROUPS = [
  { value: 'all_users',      label: 'All Registered Users' },
  { value: 'all_customers',  label: 'Customers with Orders' },
  { value: 'inactive_users', label: 'Inactive Users (30+ days)' },
  { value: 'custom',         label: 'Custom Email List' },
];

export const EMPTY_MAIL = {
  subject:       '',
  email_body:    '',
  recipient_type:'all_users',
  custom_emails: '',   // comma/newline separated raw string
  email_footer:  'Shree Mahaveer Collections | Unsubscribe',
  banner:        null,  // File object
  bannerPreview: null,
};

const MAX_BANNER_MB = 2;

// ── Hook: campaign history ────────────────────────────────────
export function useMailHistory() {
  const [campaigns,  setCampaigns]  = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');

  const load = useCallback(async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      const sd = opts.startDate ?? startDate;
      const ed = opts.endDate   ?? endDate;
      if (sd) params.set('start_date', sd);
      if (ed) params.set('end_date',   ed);

      const url = `${URL_MAIL_LIST}${params.toString() ? '?' + params : ''}`;
      const res  = await fetch(url);
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }

      setCampaigns(Array.isArray(data.data) ? data.data : []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  return { campaigns, summary, loading, error, startDate, setStartDate, endDate, setEndDate, refetch: load };
}

// ── Hook: mail form ───────────────────────────────────────────
export function useMailForm({ onSuccess } = {}) {
  const [form,    setForm]    = useState({ ...EMPTY_MAIL });
  const [errors,  setErrors]  = useState({});
  const [sending, setSending] = useState(false);

  const set = (field) => (value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const setBanner = (file) => {
    if (!file) {
      setForm(p => ({ ...p, banner: null, bannerPreview: null }));
      return;
    }
    if (file.size > MAX_BANNER_MB * 1024 * 1024) {
      toast.error(`Banner must be under ${MAX_BANNER_MB}MB`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files allowed (JPG, PNG, WebP)');
      return;
    }
    setForm(p => ({ ...p, banner: file, bannerPreview: URL.createObjectURL(file) }));
    setErrors(p => { const n = { ...p }; delete n.banner; return n; });
  };

  const reset = () => {
    if (form.bannerPreview) URL.revokeObjectURL(form.bannerPreview);
    setForm({ ...EMPTY_MAIL });
    setErrors({});
  };

  const handleSend = async () => {
    // Validate
    const e = validateMailForm({ ...form, body: form.email_body, recipients: [form.recipient_type] });
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSending(true);
    try {
      // Build multipart/form-data exactly as the API expects
      const fd = new FormData();
      fd.append('subject',             form.subject.trim());
      fd.append('email_body',          form.email_body);
      fd.append('recipient_type',      form.recipient_type);
      fd.append('email_footer',        form.email_footer.trim());
      fd.append('created_by_user_id',  '1');
      fd.append('created_by_email',    'admin@shreemahaveer.in');
      if (form.custom_emails.trim()) {
        fd.append('custom_emails', form.custom_emails.trim());
      }
      if (form.banner) {
        fd.append('banner_image', form.banner, form.banner.name);
      }

      const res  = await fetch(URL_SEND_MAIL, { method: 'POST', body: fd });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }

      if (!res.ok || data.success === false || data.status === false)
        throw new Error(data.message || data.msg || `HTTP ${res.status}`);

      toast.success('✅ Campaign created successfully!', { autoClose: 3000 });
      reset();
      onSuccess?.();
    } catch (err) {
      toast.error(`❌ ${err.message || 'Failed to send campaign'}`);
    } finally {
      setSending(false);
    }
  };

  return { form, set, setBanner, errors, sending, handleSend, reset, MAX_BANNER_MB };
}
