import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1DB954",       // Spotify green
      contrastText: "#000",
    },
    secondary: {
      main: "#E91429",       // Spotify red
    },
    background: {
      default: "#121212",    // Spotify dark bg
      paper: "#181818",      // Slightly lighter card bg
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B3B3B3",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    subtitle1: { letterSpacing: "0.02em" },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          textTransform: "none",
          fontWeight: 700,
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.04)",
          },
        },
        containedPrimary: {
          color: "#000",
          "&:hover": {
            backgroundColor: "#1ed760",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "#282828",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1DB954",
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 4, backgroundColor: "#404040" },
        bar: { backgroundColor: "#1DB954" },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: { bottom: 24 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.15s ease",
          "&:hover": {
            color: "#1DB954",
            transform: "scale(1.15)",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          "&.Mui-checked": { color: "#1DB954" },
        },
      },
    },
  },
});

export default theme;
