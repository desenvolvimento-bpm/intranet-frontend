import { createTheme } from '@mui/material/styles';

const materialUITheme = createTheme({
  palette: {
    mode: 'light', // Ou 'dark', dependendo da sua necessidade
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f4f6f8', // Cor de fundo padrão
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default materialUITheme;
