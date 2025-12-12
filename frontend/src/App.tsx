import Home from "./pages/Home";
import BasicThreadView from "./pages/BasicThreadView";
import StyledThreadView from "./pages/StyledThreadView";
import Register from "./pages/Register";
import Topics from "./pages/Topics";
import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
                        <Routes>
                            <Route path="/thread/1" element={<BasicThreadView />} />
                            <Route path="/thread/1/styled" element={<StyledThreadView />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/topics" element={<Topics />} />
                        </Routes>
                    </QueryClientProvider>
                </BrowserRouter>
            </ThemeProvider>
        </div>
    );
};

export default App;
