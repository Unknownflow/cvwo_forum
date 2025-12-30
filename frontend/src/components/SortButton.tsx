import SortOrder from "../types/SortOrder";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
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
        <FormControl>
            <InputLabel>Sort by</InputLabel>
            <Select value={order} label="Sort by" onChange={handleOrderChange}>
                <MenuItem value="desc">New</MenuItem>
                <MenuItem value="asc">Old</MenuItem>
            </Select>
        </FormControl>
    );
};

export default SortButton;
