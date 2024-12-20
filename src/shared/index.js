import { format } from 'date-fns';

function formatDateTimeToHumanReadableString(input) {

    const timestamp = parseInt(input, 10);
    const date = new Date(timestamp);

    return format(date, "do 'of' MMMM, yyyy");
}


export { formatDateTimeToHumanReadableString };
