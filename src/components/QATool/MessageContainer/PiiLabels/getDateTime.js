
import Swal from 'sweetalert2';
import { format } from 'date-fns';

const getDateTime = async (originalInput, weeksToAdd) => {

    originalInput = originalInput.trim();
    let input = originalInput;

    const cleanNumber = (input) => {
        const numberRegex = /\d+(?:st|nd|rd|th)/g;
        const match = numberRegex.exec(input);
        if (match) {
            const number = match[0].replace(/\D/g, '');
            return number;
        } else {
            //console.log('No match found for number');
            return input;
        }
    }

    const monthDictionary = {
        january: '1',
        february: '2',
        march: '3',
        april: '4',
        may: '5',
        june: '6',
        july: '7',
        august: '8',
        september: '9',
        october: '10',
        november: '11',
        december: '12'
    };

    const dayDictionary = {
        monday: '1',
        tuesday: '2',
        wednesday: '3',
        thursday: '4',
        friday: '5',
        saturday: '6',
        sunday: '7'
    };

    // Cleaning the input
    input = input.replaceAll(' ', ' ').toLowerCase();

    let temp = {};
    let yearIndex, monthIndex, dayIndex, trimmedMonth, dayWithLeadingZeros;

    input.split(' ').map((word, index) => {
        word = word.replaceAll(',', '').replaceAll('.', '');
        //if (Object.keys(monthDictionary).includes(word.substring(0, 3))) temp.month = monthDictionary[word.substring(0, 3)];
        if (Object.keys(monthDictionary).map(x => x.substring(0, word.length)).includes(word) && word.length >= 3) {
            const monthKey = Object.keys(monthDictionary).find(x => x.substring(0, word.length) === word);
            temp['month'] = monthDictionary[monthKey];
            monthIndex = index;
            if (monthKey !== word.toString().toLowerCase().trim()) trimmedMonth = true;
        } else if (Object.keys(dayDictionary).map(x => x.substring(0, word.length)).includes(word) && word.length >= 3) {
            temp['weekday'] = dayDictionary[Object.keys(dayDictionary).find(x => x.substring(0, word.length) === word)];
        } else if (word.match(/^\d{4}$/mg)) {
            temp['year'] = word;
            yearIndex = index;
        } else if (word.match(/^\d{1,2}(st|nd|rd|th)?$/mg)) {
            const day = cleanNumber(word)
            temp['day'] = day;
            dayIndex = index;

            dayWithLeadingZeros = (day || '').toString().length === 2 && (day || '').toString().substring(0, 1) === '0';
        }
    })

    if (temp['year'] === undefined && temp['weekday'] !== undefined) {
        ['2025', '2024', '2023', '2022', '2021', '2020'].map(year => {
            if (temp['year'] !== undefined) return;
            try {
                const dateString = year + '-' + temp['month'].padStart(2, '0') + '-' + temp['day'].padStart(2, '0');
                let tempDate = new Date(dateString);
                tempDate.setHours(tempDate.getHours() + 12);
                const tempWeekday = tempDate.getDay().toString();
                if (tempWeekday === temp['weekday']) temp['year'] = year;
            } catch (error) {
                return;
            }
        })
    }

    if (temp['year'] === undefined && temp['month'] !== undefined && temp['day'] !== undefined) {
        const yearQuestion = await Swal.fire({
            title: 'Year',
            input: 'select',
            inputOptions: {
                '2020': '2020',
                '2021': '2021',
                '2022': '2022',
                '2023': '2023',
                '2024': '2024',
                '2025': '2025'
            },
            inputPlaceholder: 'Select a year',
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: (year) => {
                return year;
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (yearQuestion.isConfirmed && yearQuestion.value) temp['year'] = yearQuestion.value;
    }

    if (temp['year'] === undefined) return;

    try {
        const dateString = temp['year'] + '-' + temp['month'].padStart(2, '0') + '-' + temp['day'].padStart(2, '0');

        // // Get a random number between -50 + 50 (can't be 0)
        // let n = 0;
        // while (n === 0) {
        //     n = Math.floor(Math.random() * 100) - 50;
        // }


        let tempDate = new Date(dateString);
        tempDate.setHours(tempDate.getHours() + 12);
        // console.log('Original date: ' + tempDate);
        tempDate.setDate(tempDate.getDate() + (7 * weeksToAdd));
        // console.log('New date: ' + tempDate);

        let tempDateString = [];

        originalInput.split(' ').map((word, index) => {
            if (index === monthIndex) {
                let wordLength = word.length;
                const lastLetter = word.toString().split('').pop();

                if (trimmedMonth) {
                    const lastLetterIsMarker = lastLetter === ',' || lastLetter === '.';
                    if (lastLetterIsMarker) wordLength = wordLength - 1;

                    tempDateString.push(format(tempDate, 'MMMM').substring(0, wordLength) + (lastLetterIsMarker ? lastLetter : ''));
                }
                else tempDateString.push(format(tempDate, 'MMMM'));

            } else if (index === dayIndex) {
                tempDateString.push(format(tempDate, dayWithLeadingZeros ? 'dd' : 'd'));
            } else if (index === yearIndex) {
                tempDateString.push(format(tempDate, 'yyyy'));
            } else tempDateString.push(word);

            // //if (Object.keys(monthDictionary).includes(word.substring(0, 3))) temp.month = monthDictionary[word.substring(0, 3)];
            // if (Object.keys(monthDictionary).map(x => x.substring(0, word.length)).includes(word) && word.length >= 3) {
            //     temp['month'] = monthDictionary[Object.keys(monthDictionary).find(x => x.substring(0, word.length) === word)];
            //     // monthStartPosition = input.indexOf(word);
            //     monthIndex = index;
            // }
            // else if (word.match(/^\d{4}$/mg)) temp['year'] = word;
            // else if (word.match(/^\d{1,2}(st|nd|rd|th)?$/mg)) {
            //     temp['day'] = cleanNumber(word);
            //     dayIndex = index;
            // }
        })

        tempDateString = tempDateString.join(' ');
        return tempDateString;
    } catch (error) {
        return;
    }
}

export default getDateTime;