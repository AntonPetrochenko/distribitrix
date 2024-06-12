'use client';
import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['cyrillic-ext'],
  display: 'swap',
}); 

const theme = createTheme({
    typography: {
        allVariants: {
            fontFamily: [roboto.style.fontFamily, 'sans-serif'].join(', '),
        }
    },
    palette: {
        primary: {
            main: '#ff9800',
        },
        secondary: {
            main: '#ffff8d',
        },
    },
});

export default theme;