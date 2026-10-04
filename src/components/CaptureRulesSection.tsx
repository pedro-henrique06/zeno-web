import { useState } from 'react';
import { Alert, Box, Button, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useTranslation } from 'react-i18next';
import { useAddCaptureRule, useCaptureRules, useDeleteCaptureRule } from '@/hooks/useCaptureKey';
import { useTags } from '@/hooks/useTags';

/** Rules that tag captured spending: "if the merchant or category contains X, use tag Y". */
export function CaptureRulesSection({ enabled }: { enabled: boolean }) {
  const { t } = useTranslation();
  const { data: rules = [] } = useCaptureRules(enabled);
  const { data: tags = [] } = useTags();
  const addRule = useAddCaptureRule();
  const deleteRule = useDeleteCaptureRule();
  const [match, setMatch] = useState('');
  const [tagId, setTagId] = useState('');
  const [error, setError] = useState(false);

  const tagName = (id: string) => tags.find((tag) => tag.id === id)?.name ?? '—';
  const canAdd = match.trim().length > 0 && tagId !== '' && !addRule.isPending;

  const handleAdd = () => {
    setError(false);
    addRule.mutate(
      { match: match.trim(), tagId },
      {
        onSuccess: () => {
          setMatch('');
          setTagId('');
        },
        onError: () => setError(true),
      },
    );
  };

  return (
    <>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mt: 2, mb: 0.5 }}>{t('capture.rulesTitle')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {t('capture.rulesIntro')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {t('capture.error')}
        </Alert>
      )}

      {rules.length > 0 && (
        <Box sx={{ mb: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {rules.map((rule) => (
            <Box
              key={rule.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                pl: 1.5,
                pr: 0.5,
                py: 0.5,
                '& + &': { borderTop: '1px solid', borderColor: 'divider' },
              }}
            >
              <Typography sx={{ flex: 1, minWidth: 0, fontSize: '0.875rem' }} noWrap>
                “{rule.match}” → <b>{tagName(rule.tagId)}</b>
              </Typography>
              <IconButton
                size="small"
                aria-label={t('capture.ruleDelete')}
                disabled={deleteRule.isPending}
                onClick={() => deleteRule.mutate(rule.id)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      {tags.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('capture.rulesNoTags')}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            label={t('capture.ruleMatch')}
            placeholder={t('capture.ruleMatchPlaceholder')}
            value={match}
            onChange={(e) => setMatch(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 60 } }}
            fullWidth
          />
          <TextField
            select
            size="small"
            label={t('capture.ruleTag')}
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            fullWidth
          >
            {tags.map((tag) => (
              <MenuItem key={tag.id} value={tag.id}>
                {tag.name}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" disabled={!canAdd} onClick={handleAdd}>
            {t('capture.ruleAdd')}
          </Button>
        </Box>
      )}
    </>
  );
}
