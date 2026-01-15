import NavBar from "./components/NavBar";
import { UserProvider } from "./context/userContext";
import AppRoutes from "./routes/AppRoutes";
import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#7f7fd5",
            light: "#7faad5",
            dark: "#7f7fd5",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#531dab",
            light: "#722ed1",
            dark: "#391085",
            contrastText: "#ffffff",
        },
        action: {
            hover: "rgba(0, 0, 0, 0.04)",
        },
        background: {
            default: "#e6f7ff",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#0000000",
            secondary: "#1A1A1B",
        },
        success: {
            main: "#389e0d",
            light: "#237804",
            dark: "#52c41a",
        },
        warning: {
            main: "#d48806",
            light: "#ad6800",
            dark: "#faad14",
        },
        error: {
            main: "#f5222d",
            light: "#cf1322",
            dark: "#ff4d4f",
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: "#74ebd5",
                    backgroundImage: "linear-gradient(to right, #acb6e5, #74ebd5)",
                },
            },
        },
    },
});

export const queryClient = new QueryClient();

const App: React.FC = () => {
    return (
        <div className="App">
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <QueryClientProvider client={queryClient}>
                        <UserProvider>
                            <NavBar />
                            <AppRoutes />
                        </UserProvider>
                    </QueryClientProvider>
                </BrowserRouter>
            </ThemeProvider>
        </div>
    );
};

export default App;
