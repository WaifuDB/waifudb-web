import { alpha, createTheme } from '@mui/material/styles';

// Material You / Google dark color system
const M3 = {
    // tonal surfaces
    bgDefault:            '#202124',
    bgPaper:              '#292A2D',
    surfaceContainer:     '#35363A',
    surfaceContainerHigh: '#3C4043',
    // text
    onSurface:            '#E8EAED',
    onSurfaceVariant:     '#9AA0A6',
    outline:              'rgba(232, 234, 237, 0.14)',
    // Google Blue (dark mode)
    primary:              '#8AB4F8',
    onPrimary:            '#0A2352',
    // Google Green (dark mode)
    secondary:            '#81C995',
    onSecondary:          '#0A2E17',
    // semantic
    error:                '#F28B82',
    warning:              '#FDD663',
};

export const appTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main:         M3.primary,
            light:        '#A8CFFF',
            dark:         '#5B90E8',
            contrastText: M3.onPrimary,
        },
        secondary: {
            main:         M3.secondary,
            light:        '#AEDCBE',
            dark:         '#56A070',
            contrastText: M3.onSecondary,
        },
        background: {
            default: M3.bgDefault,
            paper:   M3.bgPaper,
        },
        text: {
            primary:   M3.onSurface,
            secondary: M3.onSurfaceVariant,
        },
        divider: M3.outline,
        error:   { main: M3.error },
        warning: { main: M3.warning },
        success: { main: M3.secondary },
    },
    shape: {
        borderRadius: 4,
    },
    typography: {
        fontFamily: ['Roboto', 'Arial', 'sans-serif'].join(','),
        h1: { fontWeight: 400, fontSize: '3.5rem',  letterSpacing: '-0.015625em' },
        h2: { fontWeight: 400, fontSize: '2.75rem', letterSpacing: '-0.0083em' },
        h3: { fontWeight: 400, fontSize: '2.25rem', letterSpacing: 0 },
        h4: { fontWeight: 400, fontSize: '2rem',    letterSpacing: '0.0074em' },
        h5: { fontWeight: 400, fontSize: '1.5rem',  letterSpacing: 0 },
        h6: { fontWeight: 500, fontSize: '1.25rem', letterSpacing: '0.0075em' },
        subtitle1: { fontWeight: 400, letterSpacing: '0.0094em', lineHeight: 1.75 },
        subtitle2: { fontWeight: 500, letterSpacing: '0.007em' },
        body1:     { letterSpacing: '0.03125em', lineHeight: 1.5 },
        body2:     { letterSpacing: '0.01786em', lineHeight: 1.43 },
        button:    { fontWeight: 500, textTransform: 'none', letterSpacing: '0.0892857em', fontSize: '0.875rem' },
        caption:   { letterSpacing: '0.03333em' },
        overline:  { fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.75rem' },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                ':root': { colorScheme: 'dark' },
                body: { margin: 0, backgroundColor: M3.bgDefault },
                '#root': { minHeight: '100vh' },
                a: { color: 'inherit' },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: M3.surfaceContainer,
                    backgroundImage: 'none',
                    boxShadow: '0 1px 0 rgba(232, 234, 237, 0.14)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
                elevation0: { backgroundColor: M3.bgDefault },
                elevation1: {
                    backgroundColor: M3.bgPaper,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
                },
                elevation2: {
                    backgroundColor: M3.surfaceContainer,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: M3.bgPaper,
                    borderRadius: 12,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
                    border: 'none',
                    backgroundImage: 'none',
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    minHeight: 36,
                    paddingLeft: 24,
                    paddingRight: 24,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.0892857em',
                },
                containedPrimary: {
                    backgroundColor: M3.primary,
                    color: M3.onPrimary,
                    '&:hover': { backgroundColor: '#9EC2FF' },
                },
                outlined: {
                    borderColor: alpha(M3.onSurface, 0.24),
                    color: M3.primary,
                    '&:hover': { backgroundColor: alpha(M3.primary, 0.08) },
                },
                text: {
                    color: M3.primary,
                    '&:hover': { backgroundColor: alpha(M3.primary, 0.08) },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root:             { borderRadius: 8 },
                colorPrimary:     { backgroundColor: alpha(M3.primary, 0.15), color: M3.primary },
                outlinedPrimary:  { borderColor: alpha(M3.primary, 0.4), color: M3.primary },
                colorDefault:     { backgroundColor: alpha(M3.onSurface, 0.08) },
                outlinedDefault:  { borderColor: alpha(M3.onSurface, 0.24) },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(M3.onSurface, 0.24) },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(M3.onSurface, 0.44) },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: M3.primary, borderWidth: 2 },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    height: 3,
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                    backgroundColor: M3.primary,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.0178em',
                    minWidth: 90,
                    '&.Mui-selected': { color: M3.primary },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: M3.surfaceContainer,
                    borderRadius: 4,
                    boxShadow: '0 1px 3px 1px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.3)',
                    border: 'none',
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: M3.outline },
            },
        },
    },
});
