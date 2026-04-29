import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import {
  useHome,
  useHomeMembers,
  useAddMember,
  useRemoveMember,
  useHomeWallets,
  useLinkWallet,
  useUnlinkWallet,
  useExpenses,
  useCreateExpense,
  useDeleteExpense,
  useSplit,
  useBudgetAlert,
} from '@/hooks/useHomes';
import { useWallets } from '@/hooks/useWallets';
import type { HomeRole } from '@/types';
import { Category, CategoryLabels } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

export default function HomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const { t } = useLanguage();

  const HomeRoleLabels: Record<HomeRole, string> = {
    [0]: t.home.admin,
    [1]: t.home.member,
  };

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: home, isLoading } = useHome(id ?? '');
  const { data: members } = useHomeMembers(id ?? '');
  const { data: homeWallets } = useHomeWallets(id ?? '');
  const { data: expenses } = useExpenses(id ?? '', month, year);
  const { data: split } = useSplit(id ?? '', month, year);
  const { data: budgetAlert } = useBudgetAlert(id ?? '', month, year);
  const { data: myWallets } = useWallets();

  const addMemberMutation = useAddMember(id ?? '');
  const removeMemberMutation = useRemoveMember(id ?? '');
  const linkWalletMutation = useLinkWallet(id ?? '');
  const unlinkWalletMutation = useUnlinkWallet(id ?? '');
  const createExpenseMutation = useCreateExpense();
  const deleteExpenseMutation = useDeleteExpense(id ?? '');

  const [memberEmail, setMemberEmail] = useState('');
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [deleteExpenseConfirm, setDeleteExpenseConfirm] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    value: 0,
    category: 0 as Category,
  });

  const linkedWalletIds = new Set(homeWallets?.map((hw) => hw.walletId) ?? []);
  const unlinkedWallets = myWallets?.filter(
    (w) => !linkedWalletIds.has(w.id),
  ) ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/homes')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {home?.name}
          </Typography>
          {home?.description && (
            <Typography variant="body2" color="text.secondary">
              {home.description}
            </Typography>
          )}
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 0 }}>
        <Tab label={t.home.tabMembers} />
        <Tab label={t.home.tabExpenses} />
        <Tab label={t.home.tabSplit} />
        <Tab label={t.home.tabBudget} />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t.home.members}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  size="small"
                  label={t.home.inviteMember}
                  placeholder={t.home.inviteMemberHint}
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  sx={{ flexGrow: 1 }}
                  type="email"
                />
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  disabled={!memberEmail || addMemberMutation.isPending}
                  onClick={() =>
                    addMemberMutation.mutate(memberEmail, {
                      onSuccess: () => setMemberEmail(''),
                    })
                  }
                >
                  {t.home.add}
                </Button>
              </Box>
              {members && members.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t.home.user}</TableCell>
                        <TableCell>{t.home.role}</TableCell>
                        <TableCell align="right">{t.common.actions}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.userId}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {member.userName ?? t.common.unknownUser}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.userEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                           <Chip
                             label={HomeRoleLabels[member.role]}
                             color={
                               member.role === 0 ? 'primary' : 'default'
                             }
                             size="small"
                           />
                          </TableCell>
                          <TableCell align="right">
                            {member.role === 0 && (
                              <IconButton
                                size="small"
                                color="error"
                                disabled={removeMemberMutation.isPending}
                                onClick={() =>
                                  removeMemberMutation.mutate(member.userId)
                                }
                              >
                                <PersonRemoveIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t.home.noMembersYet}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.home.noMembersHint}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t.home.linkedWallets}
              </Typography>
              {unlinkedWallets.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {t.home.noWalletsLinkedHint}
                  </Typography>
                  {unlinkedWallets.map((w) => (
                    <Box
                      key={w.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">{w.name}</Typography>
                        <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        disabled={linkWalletMutation.isPending}
                        onClick={() => linkWalletMutation.mutate(w.id)}
                      >
                        {t.home.link}
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
              {homeWallets && homeWallets.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t.common.wallet}</TableCell>
                        <TableCell align="right">{t.common.actions}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {homeWallets.map((hw) => {
                        const wallet = myWallets?.find(
                          (w) => w.id === hw.walletId,
                        );
                        return (
                          <TableRow key={hw.walletId}>
                            <TableCell>
                              <Typography variant="body2">
                                {wallet?.name ?? hw.walletId}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatCurrency(wallet?.balance ?? 0, wallet?.currency)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                disabled={unlinkWalletMutation.isPending}
                                onClick={() =>
                                  unlinkWalletMutation.mutate(hw.walletId)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t.home.noWalletsLinked}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t.home.tabExpenses} - {monthName}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t.home.totalExpenses}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }} color="error.main">
                {formatCurrency(
                  expenses?.reduce((sum, e) => sum + e.value, 0) ?? 0,
                )}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setExpenseDialogOpen(true)}
            >
              {t.home.newExpense}
            </Button>
          </Box>
        </Box>

        {expenses && expenses.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t.common.title}</TableCell>
                  <TableCell>{t.common.category}</TableCell>
                  <TableCell align="right">{t.common.value}</TableCell>
                  <TableCell align="right">{t.common.actions}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.title}</TableCell>
                    <TableCell>
                      <Chip label={CategoryLabels[exp.category]} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="error.main" sx={{ fontWeight: 600 }}>
                        {formatCurrency(exp.value)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteExpenseConfirm(exp.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t.home.noExpensesYet}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t.home.noExpensesHint}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setExpenseDialogOpen(true)}
            >
              {t.home.addExpense}
            </Button>
          </Box>
        )}

        <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t.home.newExpense}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label={t.common.title}
              margin="normal"
              value={expenseForm.title}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, title: e.target.value })
              }
            />
            <TextField
              fullWidth
              label={t.common.value}
              type="number"
              margin="normal"
              value={expenseForm.value || ''}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  value: Number(e.target.value),
                })
              }
            />
            <TextField
              fullWidth
              select
              label={t.common.category}
              margin="normal"
              value={expenseForm.category}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  category: Number(e.target.value) as Category,
                })
              }
            >
              <MenuItem value={Category.None}>{t.category.selectCategory}</MenuItem>
              {Object.entries(CategoryLabels)
                .filter(([key]) => key !== '0')
                .map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
                    {label}
                  </MenuItem>
                ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExpenseDialogOpen(false)}>{t.common.cancel}</Button>
            <Button
              onClick={() => {
                createExpenseMutation.mutate(
                  {
                    homeId: id ?? '',
                    title: expenseForm.title,
                    value: expenseForm.value,
                    category: expenseForm.category,
                    month,
                    year,
                  },
                  { onSuccess: () => {
                    setExpenseDialogOpen(false);
                    setExpenseForm({ title: '', value: 0, category: 0 });
                  }},
                );
              }}
              variant="contained"
              disabled={
                !expenseForm.title || !expenseForm.value || createExpenseMutation.isPending
              }
            >
              {t.common.create}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!deleteExpenseConfirm}
          onClose={() => setDeleteExpenseConfirm(null)}
        >
          <DialogTitle>{t.home.deleteExpense}</DialogTitle>
          <DialogContent>
            <Typography>{t.home.deleteExpenseMsg}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteExpenseConfirm(null)}>
              {t.common.cancel}
            </Button>
            <Button
              onClick={() =>
                deleteExpenseConfirm &&
                deleteExpenseMutation.mutate(deleteExpenseConfirm, {
                  onSuccess: () => setDeleteExpenseConfirm(null),
                })
              }
              color="error"
              variant="contained"
              disabled={deleteExpenseMutation.isPending}
            >
              {t.common.delete}
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Typography variant="h6" gutterBottom>
          {t.home.expenseSplit} - {monthName}
        </Typography>
        {split && split.length > 0 ? (
          <Grid container spacing={2}>
            {split.map((s) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={s.walletId}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      {s.userName}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {s.walletName}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t.home.splitPercent}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {s.percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t.home.splitAmountToPay}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }} color="error.main">
                          {formatCurrency(s.amountToPay)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t.home.noSplitData}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t.home.noSplitDataHint}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTab(1)}
            >
              {t.home.addExpense}
            </Button>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Typography variant="h6" gutterBottom>
          {t.home.budgetTitle}
        </Typography>
        {budgetAlert ? (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {t.home.totalIncome}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatCurrency(budgetAlert.totalIncome)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {t.home.totalExpenses}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700 }}
                      color={budgetAlert.isOverBudget ? 'error.main' : 'success.main'}
                    >
                      {formatCurrency(budgetAlert.totalExpenses)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {t.home.needsUsage}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {budgetAlert.needsUsagePercentage.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(budgetAlert.needsUsagePercentage, 100)}
                      color={budgetAlert.isOverBudget ? 'error' : 'success'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {budgetAlert.isOverBudget ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {budgetAlert.alertMessage}
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                {t.home.withinBudget}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t.home.needs}
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(budgetAlert.maxNeedsLimit)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t.home.wants}
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(budgetAlert.wantsLimit)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t.home.savings}
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(budgetAlert.savingsLimit)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t.home.budgetAlert}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t.home.budgetHint}
            </Typography>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
}
