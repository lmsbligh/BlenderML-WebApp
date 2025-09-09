
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
    outlineSelected: "#48a15b",
    outlinePrimary: "#000000",
    outlineSecondary: "#353434",
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
    outlineSelected: "#48a15b",
    outlinePrimary: "#ffffff",
    outlineSecondary: "#b0b0b0",
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
        paper: colors.outlinePrimary,
        input: colors.outlineSecondary
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: { fontSize: "2rem", fontWeight: 600 },
      h2: { fontSize: "1.5rem", fontWeight: 500 },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "0.875rem" },
    },
    spacing: 2,
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
            size: "large",
            borderRadius: 4,
            textTransform: "none",
          },
        },
      },
      MuiIconButton: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          root: {
            padding: 1,
          },
        },
      },

      MuiFormControl: {
        defaultProps: {
          size: "small",
          padding: 3,
          gap: 3,
          fullWidth: true,  // cleaner than width: 100% in sx
        }
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
            border: `1px solid ${colors.outlineSecondary}`,
            padding: 6,
            gap: 3
          },
        },
      },
      MuiImageList: {
        styleOverrides: {
          root: {
            padding: 6,
            gap: 3,
            margin: 0
          }
        }
      },

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
          width: "100%"
        },
        styleOverrides: {
          root: {
            width: "100%"
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: `${colors.outlineSecondary}`,
          },
          root: {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: `${colors.primary}`,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: `${colors.primary}`,
            },
            backgroundColor: colors.backgroundPaper,
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: "small",
          backgroundColor: colors.backgroundPaper,
        }
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            size: "small",
            backgroundColor: colors.backgroundPaper,
            boxShadow: "none",
            border: `1px solid ${colors.textSecondary}`,
            borderRadius: '4px',
            '&:not(:last-child)': { marginBottom: 0 }, // = theme.spacing(4) * 1
            // prevent extra margin when expanded
            '&.Mui-expanded': { margin: 0 },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: 3,                // align with TextField size="small" (≈40px)
            '&.Mui-expanded': { minHeight: 40 },
            '& .MuiAccordionSummary-content': {
              margin: 0,
              alignItems: 'center',
              gap: 3,
              padding: 3
            },
          },
          expandIconWrapper: {
            color: 'text.secondary',
            '&.Mui-expanded': { transform: 'rotate(180deg)' },
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            padding: 3,
            borderColor: 'divider',
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
          }
        }
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            /* Firefox */
            scrollbarWidth: "thin",
            scrollbarColor: `${colors.textSecondary} ${colors.backgroundDefault}`,
          },
          /* Chrome, Edge, Safari */
          "*::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "*::-webkit-scrollbar-track": {
            background: `${colors.backgroundDefault}`,
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: `${colors.textSecondary}`,
            borderRadius: "3px",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: `${colors.textSecondary}`,
          },
        },
      }
    }
  });
};

export default getTheme;
