import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { useCaptureKeyStatus, useCreateCaptureKey, useRevokeCaptureKey } from '@/hooks/useCaptureKey';
import { CaptureRulesSection } from '@/components/CaptureRulesSection';

function apiBaseUrl(): string {
  const base = (import.meta.env.VITE_API_URL as string | undefined) || '/api';
  return base.startsWith('http') ? base : `${window.location.origin}${base}`;
}

/** A read-only value with a copy button, used for the fields the user types into Shortcuts. */
function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be unavailable (insecure context); the value is still selectable.
    }
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          pl: 1.25,
          pr: 0.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        <Typography
          sx={{ flex: 1, minWidth: 0, py: 0.75, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '12px', wordBreak: 'break-all', userSelect: 'all' }}
        >
          {value}
        </Typography>
        <IconButton size="small" onClick={copy} aria-label={`${label}: copy`}>
          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );
}

function StepTitle({ children }: { children: string }) {
  return <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mt: 2, mb: 0.5 }}>{children}</Typography>;
}

/** Guides the user through the Apple Pay automation in the iOS Shortcuts app. */
export function CaptureDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { data: status } = useCaptureKeyStatus(open);
  const createKey = useCreateCaptureKey();
  const revokeKey = useRevokeCaptureKey();
  const [key, setKey] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const enabled = !!status?.enabled;
  const url = `${apiBaseUrl()}/capture/entry`;

  const handleGenerate = () => {
    setError(false);
    createKey.mutate(undefined, {
      onSuccess: (created) => setKey(created.key),
      onError: () => setError(true),
    });
  };

  const handleRevoke = () => {
    setError(false);
    revokeKey.mutate(undefined, {
      onSuccess: () => setKey(null),
      onError: () => setError(true),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('capture.title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {t('capture.intro')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {t('capture.error')}
          </Alert>
        )}

        <StepTitle>{t('capture.step1Title')}</StepTitle>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {enabled && !key ? t('capture.step1Existing') : t('capture.step1')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={handleGenerate} disabled={createKey.isPending}>
            {enabled ? t('capture.regenerate') : t('capture.generate')}
          </Button>
          {enabled && (
            <Button color="error" onClick={handleRevoke} disabled={revokeKey.isPending}>
              {t('capture.revoke')}
            </Button>
          )}
        </Box>

        {key && (
          <>
            <StepTitle>{t('capture.step2Title')}</StepTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('capture.step2')}
            </Typography>

            <StepTitle>{t('capture.step3Title')}</StepTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('capture.step3')}
            </Typography>
            <CopyField label={t('capture.fieldUrl')} value={url} />
            <CopyField label={t('capture.fieldHeaderName')} value="X-Capture-Key" />
            <CopyField label={t('capture.fieldHeaderValue')} value={key} />
            <CopyField label={t('capture.fieldBodyTitle')} value="title" />
            <CopyField label={t('capture.fieldBodyAmount')} value="amount" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
              {t('capture.step3Vars')}
            </Typography>
            <CopyField label={t('capture.fieldBodyCard')} value="card" />
            <CopyField label={t('capture.fieldBodyCategory')} value="category" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('capture.step3Extra')}
            </Typography>

            <Alert severity="info" sx={{ mt: 2 }}>
              {t('capture.secret')}
            </Alert>
          </>
        )}

        <CaptureRulesSection enabled={open} />

        <StepTitle>{t('capture.limitsTitle')}</StepTitle>
        <Typography variant="body2" color="text.secondary">
          {t('capture.limits')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('capture.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
