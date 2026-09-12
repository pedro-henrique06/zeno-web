import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
  Tab,
  Tabs,
  Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import RepeatIcon from '@mui/icons-material/Repeat';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useHouses, useCreateHouse, useUpdateHouse, useDeleteHouse, useHouseEntries, useAddHouseMember, useRemoveHouseMember } from '@/hooks/useHouses';
import { useProfile } from '@/hooks/useUser';
import { useAuth } from '@/contexts/AuthContext';
import { useEntryKindLabels } from '@/utils/entryKind';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES } from '@/utils/currency';
import type { House } from '@/types';

const AVATAR_COLORS = ['#4A9FE0', '#2DC579', '#F0A030', '#8B5CF6', '#5ECCC8', '#E86B52'];

function HouseDetailDialog({ house, open, onClose }: { house: House; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const kindLabels = useEntryKindLabels();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const { data: entries, isLoading: loadingEntries } = useHouseEntries(open ? house.id : null);
  const addMemberMutation = useAddHouseMember(house.id);
  const removeMemberMutation = useRemoveHouseMember(house.id);

  const [tab, setTab] = useState(0);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const currencySymbol = CURRENCY_SYMBOLS[profile?.currency ?? 'BRL'];
  const locale = LANGUAGE_LOCALES[profile?.language ?? 'PtBR'];
  const isOwner = house.userId === user?.id;

  const formatValue = (value: number) =>
    `${currencySymbol} ${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteError('');
    addMemberMutation.mutate(inviteEmail.trim(), {
      onSuccess: () => setInviteEmail(''),
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0];
        setInviteError(msg ?? t('houses.inviteError'));
      },
    });
  };

  const handleClose = () => {
    setTab(0);
    setInviteEmail('');
    setInviteError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HomeWorkIcon fontSize="small" />
        {house.name}
      </DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={t('houses.entriesTab')} />
        <Tab label={t('houses.membersTab')} icon={<GroupIcon fontSize="small" />} iconPosition="end" />
      </Tabs>

      <DialogContent sx={{ px: 0, minHeight: 200 }}>
        {tab === 0 && (
          loadingEntries ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : !entries || entries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary', px: 3 }}>
              <RepeatIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
              <Typography variant="body1">{t('houses.noEntries')}</Typography>
              <Typography variant="body2">{t('houses.noEntriesHint')}</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {entries.map((entry, i) => (
                <Box key={entry.id}>
                  {i > 0 && <Divider />}
                  <ListItem sx={{ px: 3 }}>
                    <ListItemText
                      primary={entry.title}
                      secondary={kindLabels[entry.kind]}
                    />
                    <Chip
                      label={formatValue(entry.value)}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          )
        )}

        {tab === 1 && (
          <Box sx={{ px: 3, pt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('houses.owner')}
            </Typography>
            <List disablePadding sx={{ mb: 2 }}>
              <ListItem disablePadding>
                <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#4A9FE0', fontSize: 14 }}>
                  {house.name.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={isOwner ? (user?.name ?? '') : ''}
                  secondary={isOwner ? user?.email : ''}
                  slotProps={{
                    primary: { style: { fontSize: '0.875rem', fontWeight: 600 } },
                    secondary: { style: { fontSize: '0.75rem' } },
                  }}
                />
                <Chip label={t('houses.owner')} size="small" color="primary" variant="outlined" />
              </ListItem>
            </List>

            {(house.members ?? []).length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {t('houses.members')}
                </Typography>
                <List disablePadding sx={{ mb: 2 }}>
                  {(house.members ?? []).map((member) => (
                    <ListItem key={member.userId} disablePadding sx={{ py: 0.5 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1.5, fontSize: 14 }}>
                        {member.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={member.name}
                        secondary={member.email}
                        slotProps={{
                          primary: { style: { fontSize: '0.875rem' } },
                          secondary: { style: { fontSize: '0.75rem' } },
                        }}
                      />
                      {isOwner && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeMemberMutation.mutate(member.userId)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <PersonRemoveIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {(house.members ?? []).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                <GroupIcon sx={{ fontSize: 40, opacity: 0.3, mb: 0.5 }} />
                <Typography variant="body2">{t('houses.noMembers')}</Typography>
                <Typography variant="caption">{t('houses.noMembersHint')}</Typography>
              </Box>
            )}

            {isOwner && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {t('houses.addMember')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label={t('houses.memberEmail')}
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                    error={!!inviteError}
                    helperText={inviteError}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim() || addMemberMutation.isPending}
                    sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {t('houses.invite')}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function HousesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: houses, isLoading, isError } = useHouses();
  const createMutation = useCreateHouse();
  const updateMutation = useUpdateHouse();
  const deleteMutation = useDeleteHouse();

  const [formOpen, setFormOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [detailHouse, setDetailHouse] = useState<House | null>(null);

  const openCreate = () => {
    setEditingHouse(null);
    setName('');
    setDescription('');
    setFormOpen(true);
  };

  const openEdit = (e: React.MouseEvent, house: House) => {
    e.stopPropagation();
    setEditingHouse(house);
    setName(house.name);
    setDescription(house.description ?? '');
    setFormOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingHouse) {
      updateMutation.mutate(
        { id: editingHouse.id, name, description: description || undefined },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createMutation.mutate(
        { name, description: description || undefined },
        { onSuccess: () => setFormOpen(false) },
      );
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#4A9FE0' }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{t('houses.loadError')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <IconButton onClick={() => navigate('/menu')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: '2rem',
            color: 'rgba(0,0,0,0.15)',
            lineHeight: 1,
            letterSpacing: '-1px',
          }}>
            {t('houses.title')}
          </Typography>
          {(houses ?? []).length > 0 && (
            <Typography sx={{ fontSize: '12px', color: 'text.disabled', mt: 0.25 }}>
              {(houses ?? []).length} {(houses ?? []).length === 1 ? t('houses.activeGroup') : t('houses.activeGroups')}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={openCreate}
          sx={{
            bgcolor: '#4A9FE0',
            color: '#fff',
            width: 36,
            height: 36,
            borderRadius: '50%',
            '&:hover': { bgcolor: '#2D85CC' },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      {(houses ?? []).length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {(houses ?? []).map((house, houseIdx) => {
            const members = house.members ?? [];
            return (
              <Paper
                key={house.id}
                sx={{
                  borderRadius: 3,
                  boxShadow: 'none',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  bgcolor: '#1B2D48',
                  border: 'none',
                }}
                onClick={() => setDetailHouse(house)}
              >
                {/* Card top */}
                <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.25 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#FFFFFF', flex: 1, minWidth: 0 }} noWrap>
                      {house.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.25, ml: 1 }}>
                      <IconButton size="small" onClick={(e) => openEdit(e, house)} sx={{ color: 'rgba(255,255,255,0.55)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => handleDelete(e, house.id)} sx={{ color: 'rgba(255,255,255,0.55)', '&:hover': { color: '#E86B52', bgcolor: 'rgba(232,107,82,0.15)' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Flat colored avatar circles */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {members.slice(0, 5).map((m, idx) => (
                      <Box
                        key={m.userId}
                        sx={{
                          width: 30, height: 30, borderRadius: '50%',
                          bgcolor: AVATAR_COLORS[(houseIdx + idx) % AVATAR_COLORS.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700, color: '#fff',
                          border: '1.5px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </Box>
                    ))}
                    {members.length === 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GroupIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                        <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{t('houses.noMembers')}</Typography>
                      </Box>
                    )}
                    {members.length > 0 && (
                      <Typography sx={{ ml: 0.25, fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        {members.length} {members.length === 1 ? 'membro' : 'membros'}
                      </Typography>
                    )}
                  </Box>

                  {house.description && (
                    <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', mt: 1 }}>
                      {house.description}
                    </Typography>
                  )}
                </Box>

                {/* Card footer */}
                <Box sx={{
                  px: 2.5, py: 1.25,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    {t('houses.entriesTab')}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    →
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <HomeWorkIcon sx={{ fontSize: 56, mb: 1.5, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ mb: 0.5 }}>{t('houses.emptyTitle')}</Typography>
          <Typography variant="body2">{t('houses.emptySubtitle')}</Typography>
        </Box>
      )}

      {/* Dialog: formulário de criação/edição */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingHouse ? t('houses.editTitle') : t('houses.newTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('houses.name')}
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            fullWidth
            label={t('houses.description')}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
            sx={{ bgcolor: '#4A9FE0', '&:hover': { bgcolor: '#2D85CC' } }}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: detalhe da casa (lançamentos + membros) */}
      {detailHouse && (
        <HouseDetailDialog
          house={detailHouse}
          open={!!detailHouse}
          onClose={() => setDetailHouse(null)}
        />
      )}
    </Box>
  );
}
