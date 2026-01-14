export function capitalizeFirstLetter(str: string): string {
    if (!str) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDateTime(isoString: string): string {
    return new Date(isoString).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function isAlphanumeric(string: string): boolean {
    const hasUppercase = /[A-Z]/.test(string);
    const hasLowercase = /[a-z]/.test(string);
    const hasNumber = /[0-9]/.test(string);

    return hasUppercase && hasLowercase && hasNumber;
}
