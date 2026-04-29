import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useLanguage } from '@/i18n/LanguageContext';
import { CategoryLabels } from '@/types';

export default function CategoriesPage() {
  const { t } = useLanguage();

  const categories = Object.entries(CategoryLabels).filter(([key]) => key !== '0');

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t.common.categories}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {categories.map(([value, label]) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={value}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}