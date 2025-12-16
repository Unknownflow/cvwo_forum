import NavBar from "./components/NavBar";
import { UserProvider } from "./context/userContext";
import AppRoutes from "./routes/AppRoutes";
import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue, orange } from "@mui/material/colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const theme = createTheme({
    palette: {
        primary: blue,
        secondary: orange,
    },
});

export const queryClient = new QueryClient();

const App: React.FC = () => {
    return (
        <div className="App">
            <ThemeProvider theme={theme}>
                <BrowserRouter>
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
