export default (participantInfo) => {
    const dateOfRegistrationInput = participantInfo['date'].toString();
    const dateOfRegistrationInput2 = '20' + dateOfRegistrationInput.substring(0, 2) + '-' + dateOfRegistrationInput.substring(2, 4) + '-' + dateOfRegistrationInput.substring(4, 6) + 'T' + dateOfRegistrationInput.substring(6, 8) + ':' + dateOfRegistrationInput.substring(8, 10);

    let dateOfRegistrationInput3 = new Date(dateOfRegistrationInput2);
    dateOfRegistrationInput3.setHours(dateOfRegistrationInput3.getHours() + 2);

    return dateOfRegistrationInput3;
}