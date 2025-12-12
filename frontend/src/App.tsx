import Home from "./pages/Home";
import Register from "./pages/Register";
import Topics from "./pages/Topics";
import TopicPosts from "./pages/TopicPosts";
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
                            <Route path="/" element={<Home />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/topics" element={<Topics />} />
                            <Route path="/topics/:id/posts" element={<TopicPosts />} />
                        </Routes>
                    </QueryClientProvider>
                </BrowserRouter>
            </ThemeProvider>
        </div>
    );
};

export default App;
