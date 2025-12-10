import CommentList from "../components/CommentList";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";

import React from "react";

const BasicThreadView: React.FC = () => {
    return (
        <div style={{ width: "25vw", margin: "auto", textAlign: "center" }}>
            <h3>{"Inspirational Quotes"}</h3>
            <h4>{"Thread started by Aiken"}</h4>
            <CommentList />
            <Link to="/">{`<- Back to threads`}</Link>

            <Button variant="contained" color="primary" component={Link} to="/thread/1/styled">
                {"Yes"}
            </Button>
        </div>
    );
};

export default BasicThreadView;
