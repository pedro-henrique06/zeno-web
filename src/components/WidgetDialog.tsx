import { useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { useCreateWidgetKey, useRevokeWidgetKey, useWidgetKeyStatus } from '@/hooks/useWidgetKey';
import { buildWidgetScript } from '@/utils/widgetScript';

const SCRIPTABLE_URL = 'https://apps.apple.com/app/scriptable/id1405459188';

function apiBaseUrl(): string {
  const base = (import.meta.env.VITE_API_URL as string | undefined) || '/api';
  return base.startsWith('http') ? base : `${window.location.origin}${base}`;
}

/** Guides the user through the iPhone widget: generate a personal key, copy the Scriptable script. */
export function WidgetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { data: status } = useWidgetKeyStatus(open);
  const createKey = useCreateWidgetKey();
  const revokeKey = useRevokeWidgetKey();
  const [key, setKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const script = useMemo(() => (key ? buildWidgetScript(apiBaseUrl(), key) : ''), [key]);

  const handleGenerate = () => {
    setError(false);
    createKey.mutate(undefined, {
      onSuccess: (created) => {
        setKey(created.key);
        setCopied(false);
      },
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
    } catch {
      setError(true);
    }
  };

  const enabled = !!status?.enabled;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('widget.title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('widget.intro')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('widget.error')}
          </Alert>
        )}

        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>{t('widget.step1Title')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('widget.step1')}{' '}
          <Link href={SCRIPTABLE_URL} target="_blank" rel="noopener noreferrer">
            Scriptable
          </Link>
        </Typography>

        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>{t('widget.step2Title')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {enabled && !key ? t('widget.step2Existing') : t('widget.step2')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Button variant="contained" onClick={handleGenerate} disabled={createKey.isPending}>
            {enabled ? t('widget.regenerate') : t('widget.generate')}
          </Button>
          {enabled && (
            <Button color="error" onClick={handleRevoke} disabled={revokeKey.isPending}>
              {t('widget.revoke')}
            </Button>
          )}
        </Box>

        {key && (
          <>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>{t('widget.step3Title')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('widget.step3')}
            </Typography>
            <Box
              component="textarea"
              readOnly
              value={script}
              onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => e.currentTarget.select()}
              aria-label={t('widget.scriptLabel')}
              sx={{
                width: '100%',
                height: 140,
                resize: 'none',
                p: 1.25,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                color: 'text.primary',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '11px',
                boxSizing: 'border-box',
              }}
            />
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1, mb: 2 }}
              startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={handleCopy}
            >
              {copied ? t('widget.copied') : t('widget.copy')}
            </Button>

            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>{t('widget.step4Title')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('widget.step4')}
            </Typography>
            <Alert severity="info" sx={{ mt: 1 }}>
              {t('widget.secret')}
            </Alert>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('widget.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
