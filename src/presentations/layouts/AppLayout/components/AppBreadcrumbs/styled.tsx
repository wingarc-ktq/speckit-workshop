import Breadcrumbs from '@mui/material/Breadcrumbs';
import { styled } from '@mui/material/styles';

export const NavigationBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}));
