export const colorTokens = {
    grey: {
        0: "#FFFFFF",
        10: "#F6F6F6",
        50: "#F0F0F0",
        100: "#E0E0E0",
        200: "#C2C2C2",
        300: "#A3A3A3",
        400: "#858585",
        500: "#666666",
        600: "#4D4D4D",
        700: "#333333",
        800: "#1A1A1A",
        900: "#0A0A0A",
        1000: "#000000",
    },
};

export const themeSettings = (mode) => {
    return {
        palette: {
            primary: {
                main: "#1976d2", // Nice blue
                contrastText: "#ffffff",
            },
            neutral: {
                dark: colorTokens.grey[700],
                main: colorTokens.grey[500],
                mediumMain: colorTokens.grey[400],
                medium: colorTokens.grey[200],
                light: colorTokens.grey[50],
            },
            background: {
                default: colorTokens.grey[10],
                alt: colorTokens.grey[0],
            },
        },
        typography: {
            fontSize: 12,
            h1: {
                fontSize: 40,
            },
            h2: {
                fontSize: 32,
            },
            h3: {
                fontSize: 24,
            },
            h4: {
                fontSize: 20,
            },
            h5: {
                fontSize: 16,
            },
            h6: {
                fontSize: 14,
            },
        },
        components: {
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& label.Mui-focused': {
                        color: '#1976d2', // Blue label when focused
                    },
                        '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                        borderColor: '#1976d2', // Blue border when focused
                    },
                },
            },
        },
        },
    },
    };
};
