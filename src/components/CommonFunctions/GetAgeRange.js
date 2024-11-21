
export default (participant) => {

    const dateOfBirth = participant['dateOfBirth'].toString();
    const dateOfBirth2 = dateOfBirth.substring(0, 4) + '-' + dateOfBirth.substring(4, 6) + '-' + dateOfBirth.substring(6, 8);
    const today = new Date();
    const birthDate = new Date(dateOfBirth2);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    let ageRange = '';
    if (age < 18) {
        ageRange = "<18";
    } else if (age >= 18 && age <= 35) {
        ageRange = "18-35";
    } else if (age >= 36 && age <= 49) {
        ageRange = "36-49";
    } else {
        ageRange = "50+";
    }

    return { age: age, ageRange: ageRange };
}