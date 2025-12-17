export function capitalizeFirstLetter(str: string): string {
    if (!str) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDateTime(isoString: string): string {
    console.log("isostring", isoString);
    console.log("currenttime", new Date(isoString));
    return new Date(isoString).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
