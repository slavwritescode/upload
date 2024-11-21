const isBackup = (dataType, locale, eventType, providerType, bookingVariant, deliveryTarget) => {
    let backup = false;

    // Hardcoded rules here
    if (dataType === 'attachments' && [1, 8, 9].includes(eventType)) return true;
    if (dataType === 'textMessages' && [8].includes(eventType)) return true;
    // End of hardcoded rules

    if (!locale || eventType === undefined || Object.keys(deliveryTarget || {}).length === 0) return false;
    if (eventType === 8 && bookingVariant === undefined) return false;

    let target = 0;
    let collected = 0;

    if (dataType === 'emails' && ['au', 'ca', 'gb', 'in'].includes(locale) && eventType === 1) {
        locale = 'au_ca_gb_in';
    }

    if (dataType === 'textMessages' && ['au', 'ca', 'gb', 'in'].includes(locale)) {
        locale = 'au_ca_gb_in';
    }

    if (eventType === 8) {
        target = deliveryTarget[dataType][locale][eventType][0][bookingVariant]['target'];
        const collectedObj = deliveryTarget[dataType][locale][eventType][0][bookingVariant]['collected'];
        collected += collectedObj['s1'];
        collected += collectedObj['s4'];
        collected += collectedObj['s5'];
    } else {
        const commonLimit = Object.keys(deliveryTarget[dataType][locale][eventType]).includes("0");
        if (commonLimit) {
            target = deliveryTarget[dataType][locale][eventType][0]['target'];
            const collectedObj = deliveryTarget[dataType][locale][eventType][0]['collected'];
            collected += collectedObj['s1'];
            collected += collectedObj['s4'];
            collected += collectedObj['s5'];
        }
        else {
            if (providerType === undefined) return false;
            target = deliveryTarget[dataType][locale][eventType][providerType]['target'];
            const collectedObj = deliveryTarget[dataType][locale][eventType][providerType]['collected'];
            collected += collectedObj['s1'];
            collected += collectedObj['s4'];
            collected += collectedObj['s5'];
        }
    }

    if (collected > target) backup = true;

    return backup;
}

export default isBackup;