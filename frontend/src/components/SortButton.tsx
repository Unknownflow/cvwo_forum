import SortOrder from "../types/SortOrder";
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React from "react";

type Props = {
    order: SortOrder;
    setOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
};

const SortButton: React.FC<Props> = ({ order, setOrder }) => {
    const handleOrderChange = (event: SelectChangeEvent) => {
        setOrder(event.target.value as SortOrder);
    };

    return (
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "left", gap: 1 }}>
            Sort by:
            <FormControl>
                <InputLabel>order</InputLabel>
                <Select value={order} label="Sort by" onChange={handleOrderChange}>
                    <MenuItem value="desc">newest first</MenuItem>
                    <MenuItem value="asc">oldest first</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default SortButton;
