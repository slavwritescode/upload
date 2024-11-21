function formatDateTime(input) {
    // Parse the input string
    let value = input.toString();
    const year = value.substring(0, 4);
    const month = parseInt(value.substring(4, 6), 10) - 1; // Months are 0-indexed
    const day = parseInt(value.substring(6, 8), 10);

    // Get the month name
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[month];

    // Determine the correct ordinal suffix for the day
    const ordinalSuffix = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const formattedDay = ordinalSuffix(day);

    // Return the formatted string
    return `${formattedDay} of ${monthName}, ${year}`;
}

export { formatDateTime };
