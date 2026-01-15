import { Stack, TextField } from "@mui/material";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";

type Props = {
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    type: string;
};

const SearchBox: React.FC<Props> = ({ searchTerm, setSearchTerm, type }) => {
    const ariaLabel = "search " + type;
    return (
        <TextField
            value={searchTerm}
            variant="filled"
            label={
                <Stack direction="row">
                    <SearchIcon /> Search {type}
                </Stack>
            }
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label={ariaLabel}
            sx={{ background: "#e6f7ff" }}
        />
    );
};

export default SearchBox;
