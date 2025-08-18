
import { createTheme } from "@mui/material/styles";

const paletteTokens = {
  light: {
    primary: "#48a15b",
    secondary: "#9c27b0",
    error: "#d32f2f",
    backgroundDefault: "#F7FFF7",
    backgroundPaper: "#d6d6d6e0",
    textPrimary: "#000000",
    textSecondary: "#353434",
    outline: "#48a15b",
    menuEven: "#f5f5f5",
    menuOdd: "#e0e0e0",
    menuHover: "#d6d6d6",
  },
  dark: {
    primary: "#48a15b",
    secondary: "#9c27b0",
    error: "#d32f2f",
    backgroundDefault: "#121212",
    backgroundPaper: "#1e1e1e",
    textPrimary: "#ffffff",
    textSecondary: "#b0b0b0",
    outline: "#48a15b",
    menuEven: "#1e1e1e",
    menuOdd: "#121212",
    menuHover: "#3a8049",
  },
};

const getTheme = (mode = "light") => {
  const colors = paletteTokens[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: colors.primary },
      secondary: { main: colors.secondary },
      error: { main: colors.error },
      background: {
        default: colors.backgroundDefault,
        paper: colors.backgroundPaper,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
      outline: {
        paper: colors.outline,
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: { fontSize: "2rem", fontWeight: 600 },
      h2: { fontSize: "1.5rem", fontWeight: 500 },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "0.875rem" },
    },
    components: {
      MuiMenuItem: {
        styleOverrides: {
          root: {
            backgroundColor: colors.menuEven,
            "&:nth-of-type(odd)": {
              backgroundColor: colors.menuOdd,
            },
            "&.Mui-selected": {
              backgroundColor: colors.primary,
              color: "#fff",
            },
            "&.Mui-selected:hover": {
              backgroundColor: colors.menuHover,
            },
            "&:hover": {
              backgroundColor: colors.menuHover,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            textTransform: "none",
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 48,
            backgroundColor: colors.backgroundPaper,
          },
          indicator: {
            backgroundColor: colors.primary,
            height: 3,
            borderRadius: 2,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 48,
            color: colors.textPrimary,
            "&.Mui-selected": {
              color: colors.primary,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${colors.textSecondary}`,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: colors.backgroundPaper,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            border: `1px solid ${colors.textSecondary}`,
          },
        },
      },
    },
  });
};

export default getTheme;
