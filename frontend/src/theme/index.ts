import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#FFE8D9',
      100: '#FFCCA3',
      200: '#FFB07A',
      300: '#FF9551',
      400: '#FF8029',
      500: '#FF6B00', // Naranja Principal
      600: '#E65F00',
      700: '#CC5400',
      800: '#B34800',
      900: '#993D00',
    },
    primary: {
      50: '#E6EBF5',
      100: '#B3C2E0',
      200: '#8099CC',
      300: '#4D70B8',
      400: '#2647A3',
      500: '#003087', // Azul Profundo
      600: '#002870',
      700: '#002059',
      800: '#001842',
      900: '#00102B',
    },
    gray: {
      50: '#F9F9F9',
      100: '#F5F5F5', // Gris Claro
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#424242',
      800: '#333333', // Gris Oscuro
      900: '#1A1A1A',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
          },
        }),
        outline: (props: any) => ({
          borderColor: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.50' : undefined,
          },
        }),
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
    Badge: {
      baseStyle: {
        textTransform: 'none',
        fontWeight: 'semibold',
      },
    },
  },
});

export default theme;
