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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", gap: 1 }}>
            Sort by:
            <FormControl>
                <InputLabel>order</InputLabel>
                <Select value={order} label="Sort by" onChange={handleOrderChange}>
                    <MenuItem value="likes_count, desc">Top</MenuItem>
                    <MenuItem value="created_at, desc">Newest</MenuItem>
                    <MenuItem value="created_at, asc">Oldest</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default SortButton;
