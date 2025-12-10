import BasicThreadList from "../components/BasicThreadList";
import { Typography } from "@mui/material";
import React from "react";

const Home: React.FC = () => {
    return (
        <>
            <Typography variant="h5">Web Forum</Typography>
            <BasicThreadList />
        </>
    );
};

export default Home;
