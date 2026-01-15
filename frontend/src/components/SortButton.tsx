import SortOrder, { SortOptions } from "../types/SortOrder";
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React from "react";

type Props = {
    order: SortOrder;
    setOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
    sortOptions: SortOptions[];
};

const SortButton: React.FC<Props> = ({ order, setOrder, sortOptions }) => {
    const handleOrderChange = (event: SelectChangeEvent) => {
        setOrder(event.target.value as SortOrder);
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", gap: 1 }}>
            Sort by:
            <FormControl variant="filled" sx={{ background: "#e6f7ff" }}>
                <InputLabel>order</InputLabel>
                <Select value={order} label="Sort by" onChange={handleOrderChange}>
                    {sortOptions.map((x: SortOptions) => (
                        <MenuItem key={x.label} value={x.value}>
                            {x.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default SortButton;
