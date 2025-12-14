import { useState } from "react";

const useSnackBar = () => {
    const [snackBar, setSnackBar] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

    const handleSnackBarClose = () => setSnackBar({ open: false, message: "" });
    const showSnackBar = (message: string) => {
        setSnackBar({ open: true, message });
    };

    return { snackBar, showSnackBar, handleSnackBarClose };
};

export default useSnackBar;
