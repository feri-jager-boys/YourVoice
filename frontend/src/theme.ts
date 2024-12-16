import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system', // 'light', 'dark', 'system'
  useSystemColorMode: true,
};

const fonts = {
  heading: "'Inconsolata', sans-serif",
  body: "'Poppins', sans-serif",
};

const styles = {
  global: {
    '*': {
      boxSizing: 'border-box',
    },
    html: {
      fontSize: '16px',
      lineHeight: '1.5',
    },
    body: {
      margin: 0,
      fontFamily: 'body',
      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale',
    },
  },
};

const theme = extendTheme({ config, fonts, styles });

export default theme;
