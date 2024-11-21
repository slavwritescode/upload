import { getFileBlob, realtimeDb } from '../../firebase/config';
import SparkMD5 from 'spark-md5';
import axios from 'axios';

import normalizeProvider from '../CommonFunctions/normalizeProvider';
import LogEvent from '../CommonFunctions/LogEvent';

import Constants from '../Constants';

const getFileMd5 = async (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    return new Promise((resolve, reject) => {
        reader.onload = function (e) {
            const spark = new SparkMD5.ArrayBuffer();
            spark.append(e.target.result);
            resolve(spark.end());
        };
    });
}

const processData = async (
    validate,
    dataType,
    messageId,
    message,
    labels,
    participantInfo,
    deliveryTarget,
    providers,
    download,
    userInfo,
    checkIfValid
) => {

    let response = {
        processed: false
    }

    // if (parseInt(messageId) !== 100741) return response;

    try {
        // const message = messages[messageId];
        const participantId = message['participantId'];
        // const participantInfo = participants[participantId] || {};
        const locale = participantInfo['locale'];
        // const labels = labelsDatabase[messageId] || {};
        const assetCategory = Constants['qaToolTypes'][dataType]['assetCategory'];

        const status = message['status'];

        const { actionType,
            eventType,
            providerType,
            providerName,
            originalTimestamp,
            standardizedTimestamp,
            dropOffLocationType,
            pickUpLocation,
            dropOffLocation,
            partySize,
            tripType,
            flightTripType,
            numberOfStops,
            roomType,
            numberOfNights,
            trainSeatType,
            trainTicketType,
            busSeatType,
            showTicketType,
            showType,
            showDuration,
            partyInvitationType,
            partyInvitationFormat,
            partyInvitationTemplate,
            partyInvitationTextOrganization,
            partyInvitationTextOrganization2,
            appointmentVisitType,
            appointmentType,
            state,
            subject,
            sender
        } = labels;

        if (eventType === undefined) throw new Error('Missing event type: ' + messageId);

        if (download && status !== 4) {
            let target = 0;
            let collected = 0;
            let tempLocale = locale;

            if (dataType === 'emails' && ['au', 'ca', 'gb', 'in'].includes(tempLocale) && eventType === 1) {
                tempLocale = 'au_ca_gb_in';
            }

            if (dataType === 'textMessages' && ['au', 'ca', 'gb', 'in'].includes(tempLocale)) {
                tempLocale = 'au_ca_gb_in';
            }

            if (eventType === 8) {
                if (partyInvitationFormat === undefined) throw new Error('Missing party invitation format: ' + messageId);
                target = deliveryTarget[dataType][tempLocale][eventType][0][partyInvitationFormat]['target'];
                const collectedObj = deliveryTarget[dataType][tempLocale][eventType][0][partyInvitationFormat]['collected'];
                collected += collectedObj['s4'];
                collected += collectedObj['s5'];
            } else {
                const commonLimit = Object.keys(deliveryTarget[dataType][tempLocale][eventType]).includes("0");
                if (commonLimit) {
                    target = deliveryTarget[dataType][tempLocale][eventType][0]['target'];
                    const collectedObj = deliveryTarget[dataType][tempLocale][eventType][0]['collected'];
                    collected += collectedObj['s4'];
                    collected += collectedObj['s5'];
                }
                else {
                    if (providerType === undefined) throw new Error('Missing provider type: ' + messageId);
                    target = deliveryTarget[dataType][tempLocale][eventType][providerType]['target'];
                    const collectedObj = deliveryTarget[dataType][tempLocale][eventType][providerType]['collected'];
                    collected += collectedObj['s4'];
                    collected += collectedObj['s5'];
                }
            }
            if (collected >= target) {
                // Marking as backup
                const path = Constants['qaToolTypes'][dataType]['root'] + '/' + messageId + '/status';
                await realtimeDb.ref(path).set(3);

                const action = Constants['qaToolTypes'][dataType]['statusChangeAction'];
                await LogEvent({ participantId, messageId, qaToolType: dataType, action, value: 3, userId: 1, appVersion: userInfo['appVersion'] });
                throw new Error('Bucket limit reached: ' + messageId + ' (' + dataType + '/' + tempLocale + '/' + eventType + '/: ' + target + ')');
            }
        }

        if (download && providerName !== undefined && status !== 4) {
            const normalizedProvider = normalizeProvider(providerName);
            let deliveredFromProvider = 0;

            if (normalizedProvider !== '') {
                const providerStatuses = providers[normalizedProvider] === undefined ? {} :
                    (providers[normalizedProvider][locale] === undefined ? {} :
                        (providers[normalizedProvider][locale]['e' + eventType] || {}));

                deliveredFromProvider = (providerStatuses['s4'] || 0) + (providerStatuses['s5'] || 0);
            }

            const limitForProvider = Constants['eventTypes'][eventType]['providerLimit'];
            if (deliveredFromProvider >= limitForProvider) {
                // Marking as backup
                const path = Constants['qaToolTypes'][dataType]['root'] + '/' + messageId + '/status';
                await realtimeDb.ref(path).set(3);

                const action = Constants['qaToolTypes'][dataType]['statusChangeAction'];
                await LogEvent({ participantId, messageId, qaToolType: dataType, action, value: 3, userId: 1, appVersion: userInfo['appVersion'] });
                throw new Error('Provider limit reached: ' + messageId + ' (' + locale + '/' + providerName + ')');
            }
        }

        const prefix = Constants['qaToolTypes'][dataType]['prefix'];
        const ext = message['ext'];
        const assetExtension = dataType === 'attachments' ?
            (Constants['fileExtensions'][ext] || ext)
            : Constants['qaToolTypes'][dataType]['assetExtension'];
        const assetBaseName = prefix + messageId + '.' + assetExtension;

        let file;
        let text2;

        let json = {
            "contribution_date": parseInt("20" + message['date'].toString().substring(0, 6)),
            assets: [
                {
                    "asset_basename": assetBaseName,
                    "asset_md5": "",
                    "asset_metadata": {
                        "additional": {
                            "message_id": prefix + messageId,
                            "category": assetCategory,
                            "locale": Constants['localesForDelivery'][locale],
                            "provider_name": providerName === undefined ? 'N/A' : providerName.toString().trim(),
                            "event_type": [Constants['eventTypes'][eventType]['external']],
                        }
                    }
                }
            ]
        }
        let additional = json['assets'][0]['asset_metadata']['additional'];

        if (dataType === 'textMessages') {
            let text = labels['text'];
            if (!text) throw new Error('Missing text: ' + messageId);

            const container = document.createElement('div');
            container.innerHTML = text;
            const htmlLabels = container.querySelectorAll('label');
            Array.from(htmlLabels).map(label => {
                const piiTypeId = label.getAttribute('pii-type-id');
                const piiType = Constants['piiLabels'].find(pii => pii['typeId'] === parseInt(piiTypeId))['external'];
                const dateValue = label.getAttribute('date-value');

                const replacementString = dateValue ? '[' + dateValue + ']' : '[' + piiType + ']';
                text = text.replaceAll(label.outerHTML, replacementString);
            });
            text = text.replaceAll(' [url]', '[url]').replaceAll('\n[url]', '[url]').replaceAll('\n', ' ');

            // Turning the html back to text, so for example '&gt;' becomes '>'
            container.innerHTML = text;
            text = container.innerText;
            container.remove();
            json['assets'][0]['asset_metadata']['additional']['text_content'] = text;

            if (download) {
                // Checking if duplicate text
                text2 = text.toLowerCase().replace(/[^A-Za-z0-9]/g, ''); // Removing all non-alphanumeric characters
                const deliveredIds = Object.keys(await realtimeDb.ref("/deliveredText/" + dataType).orderByValue().equalTo(text2).once('value').then((snapshot) => snapshot.val()) || {});
                if (deliveredIds.length > 0) {
                    if (!deliveredIds.includes(messageId.toString())) {
                        throw new Error('Duplicate md5. Processed ID-s: "' + deliveredIds.join(';') + '", not processed: ' + messageId);
                    }
                }
            }

            if (download) {
                file = new File([text], assetBaseName, { type: 'text/txt' });
                const md5 = await getFileMd5(file);
                json['assets'][0]['asset_md5'] = md5;
            } else {
                // Dummy data goes to the md5 field
                json['assets'][0]['asset_md5'] = '098f6bcd4621d373cade4e832627b4f6';
            }

        } else if (dataType === 'emails') {

            if (download) {
                const filePath = '/emails/' + messageId + '/body.html';
                const blob = await getFileBlob(filePath);
                let htmlText = await blob.text();
                if (!htmlText) throw new Error('Missing html text: ' + messageId);
                // if (htmlText.includes('pii-type-id="7"')) throw new Error('Html text includes [ID]: ' + messageId);

                htmlText = '<html><head><meta charset="UTF-8"></head><body>' + htmlText + '</body></html>';

                const tempElement = document.createElement('div');
                tempElement.innerHTML = htmlText;

                const htmlLinks = tempElement.querySelectorAll('a');
                const links = Array.from(htmlLinks).map(link => link.outerHTML);
                for (let l = 0; l < links.length; l++) {
                    const linkHtmlText = links[l];
                    let temp = htmlLinks[l].cloneNode(true);
                    temp['href'] = '[url]';
                    if ((temp['title'] || '').toString().toLowerCase().includes('http') ||
                        ((temp['title'] || '').toString().toLowerCase().includes('mailto:') &&
                            !(temp['title'] || '').toString().toLowerCase().includes('mailto:['))) temp['title'] = '[url]';
                    const newLinkHtmlText = temp.outerHTML;
                    htmlText = htmlText.replaceAll(linkHtmlText, newLinkHtmlText);
                }


                const htmlLabels = tempElement.querySelectorAll('label');
                Array.from(htmlLabels).map(label => {
                    const piiTypeId = label.getAttribute('pii-type-id');
                    const piiType = Constants['piiLabels'].find(pii => pii['typeId'] === parseInt(piiTypeId));
                    if (piiType === undefined) return;
                    const dateValue = label.getAttribute('date-value');

                    const replacementString = dateValue ? '[' + dateValue + ']' : '[' + piiType['external'] + ']';
                    htmlText = htmlText.replaceAll(label.outerHTML, replacementString);
                });

                const blob2 = new Blob([htmlText], { type: 'text/html' });
                file = new File([blob2], assetBaseName, { type: 'text/html' });
                json['assets'][0]['asset_md5'] = await getFileMd5(file);
                tempElement.remove();
            } else {
                // Dummy data goes to the md5 field
                json['assets'][0]['asset_md5'] = '098f6bcd4621d373cade4e832627b4f6';
            }

            if (originalTimestamp !== undefined) additional['original_timestamp'] = originalTimestamp;
            if (subject !== undefined) {
                let textOfSubject = subject.toString().trim();

                const container = document.createElement('div');
                container.innerHTML = subject;
                const htmlLabels = container.querySelectorAll('label');
                Array.from(htmlLabels).map(label => {
                    const piiTypeId = label.getAttribute('pii-type-id');
                    const piiType = Constants['piiLabels'].find(pii => pii['typeId'] === parseInt(piiTypeId))['external'];
                    const dateValue = label.getAttribute('date-value');

                    const replacementString = dateValue ? '[' + dateValue + ']' : '[' + piiType + ']';
                    textOfSubject = textOfSubject.replaceAll(label.outerHTML, replacementString);
                });

                // if (download && dataType === 'emails') {
                // if (download) {
                //     if (textOfSubject.includes('[id]')) throw new Error('Subject includes [ID]: ' + messageId);
                // }

                additional['message_subject'] = textOfSubject;
                container.remove();
            } else additional['message_subject'] = 'N/A';

            if ((sender || '').toString().includes('@') && (sender || '').toString().includes('.')) {
                additional['email_domain'] = '@' + sender.toString().toLowerCase().split('@')[1];
            }
        } else if (dataType === 'attachments') {
            if (download) {
                const fileExtension = Constants['fileExtensions'][message['ext']] || message['ext'];
                //const filePath = '/attachments/' + messageId + '/raw.' + fileExtension;
                const filePath = '/attachments/' + messageId + '/redacted.' + fileExtension;
                const blob = await getFileBlob(filePath);
                const attachment = new File([blob], assetBaseName, { type: 'application/pdf' });

                try {
                    // Baking the attachment
                    const formData = new FormData();
                    formData.append('attachment', attachment);
                    const response = await axios.post("https://bake-attachment-z2yvkgi2ra-uc.a.run.app", formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    const responseData = response['data'];
                    const bakedAttachmentBase64 = responseData['bakedAttachmentBase64'];
                    const bakedAttachmentBlob = await fetch('data:application/pdf;base64,' + bakedAttachmentBase64).then(res => res.blob());
                    file = new File([bakedAttachmentBlob], assetBaseName, { type: 'application/pdf' });
                } catch (e) {
                    console.error(e);
                }

                if (!file) throw new Error('Attachment baking failed: ' + messageId);

                json['assets'][0]['asset_md5'] = await getFileMd5(file);
            } else {
                // Dummy data goes to the md5 field
                json['assets'][0]['asset_md5'] = '098f6bcd4621d373cade4e832627b4f6';
            }

            if (originalTimestamp !== undefined) additional['original_timestamp'] = originalTimestamp;
            if (subject !== undefined) {
                let textOfSubject = subject.toString().trim();

                const container = document.createElement('div');
                container.innerHTML = subject;
                const htmlLabels = container.querySelectorAll('label');
                Array.from(htmlLabels).map(label => {
                    const piiTypeId = label.getAttribute('pii-type-id');
                    const piiType = Constants['piiLabels'].find(pii => pii['typeId'] === parseInt(piiTypeId))['external'];
                    const dateValue = label.getAttribute('date-value');

                    const replacementString = dateValue ? '[' + dateValue + ']' : '[' + piiType + ']';
                    textOfSubject = textOfSubject.replaceAll(label.outerHTML, replacementString);
                });

                additional['message_subject'] = textOfSubject;
                container.remove();
            } else additional['message_subject'] = 'N/A';

            if ((sender || '').toString().includes('@') && (sender || '').toString().includes('.')) {
                additional['email_domain'] = '@' + sender.toString().toLowerCase().split('@')[1];
            }
        }

        if (download) {
            // Checking if duplicate md5
            const md5 = json['assets'][0]['asset_md5'];
            const deliveredIds = Object.keys(await realtimeDb.ref("/deliveredMd5/" + dataType).orderByValue().equalTo(md5).once('value').then((snapshot) => snapshot.val()) || {});
            if (deliveredIds.length > 0) {
                if (!deliveredIds.includes(messageId.toString())) {
                    throw new Error('Duplicate md5. Processed ID-s: "' + deliveredIds.join(';') + '", not processed: ' + messageId);
                }
            }
        }

        if (actionType !== undefined) additional['action_type'] = Constants['actionTypes'][actionType]['external'];
        if (providerType !== undefined) additional['provider_type'] = Constants['providerTypes'][providerType]['external'];

        if (eventType !== 1) {
            // Original and standardized timestamps for all event types except for Appointment
            if (standardizedTimestamp !== undefined) additional['standardized_timestamp'] = parseInt(standardizedTimestamp.toString().replaceAll('-', ''));
        }

        if ([2, 3, 4, 5, 7, 9, 10, 11].includes(eventType)) additional['party_size'] = partySize || 'N/A';

        if (![7, 9].includes(eventType)) {
            // Additional metadata for all event types except for Movie, Restaurant
            const metadataName = Constants['eventTypes'][eventType]['external'] + '_metadata';
            additional[metadataName] = {};
            let additionalMetadata = additional[metadataName];

            if ([2, 3, 4, 11].includes(eventType)) {
                // Trip type for Bus, Rental car, Ferry, Train
                additionalMetadata['trip_type'] = tripType === undefined ? 'N/A' : Constants['tripTypes'][tripType]['external'];
            }

            if (eventType === 1) {
                // Appointment metadata
                if (appointmentVisitType !== undefined) additionalMetadata['visit_type'] = Constants['appointmentVisitTypes'][appointmentVisitType]['external'];
                if (appointmentType !== undefined) additionalMetadata['appointment_type'] = Constants['appointmentTypes'][appointmentType]['external'];
                additionalMetadata['state_region'] = state || 'N/A';
            }

            if (eventType === 2) {
                // Bus metadata
                if (busSeatType !== undefined) additionalMetadata['seat_type'] = Constants['busSeatTypes'][busSeatType]['external'];
            }

            if (eventType === 3) {
                // Car rental metadata
                additionalMetadata['pickup_dropoff'] = dropOffLocationType === undefined ? 'N/A' : Constants['dropOffLocationTypes'][dropOffLocationType]['external'];
                additionalMetadata['pickup_location'] = pickUpLocation || 'N/A';

                if (dropOffLocationType === 2) additionalMetadata['dropoff_location'] = dropOffLocation || 'N/A';
                else additionalMetadata['dropoff_location'] = pickUpLocation || 'N/A';
            }

            if (eventType === 4) {
                // Ferry metadata (nothing extra is required)
            }

            if (eventType === 5 && flightTripType !== undefined) {
                // Flight metadata
                const tripTypeText = flightTripType === undefined ? 'N/A' : Constants['flightTripTypes'][flightTripType]['external'];
                additionalMetadata['trip_type'] = tripTypeText;

                if (tripTypeText === 'multi_stop') additionalMetadata['number_of_stops'] = parseInt(numberOfStops || 1);
            }

            if (eventType === 6) {
                // Hotel metadata
                if (roomType !== undefined) additionalMetadata['room_type'] = Constants['roomTypes'][roomType]['external'];
                if (numberOfNights !== undefined) additionalMetadata['number_of_nights'] = Constants['numberOfNights'][numberOfNights]['external'];
            }

            if (eventType === 8) {
                // Party invitation metadata
                if (partyInvitationType !== undefined) additionalMetadata['invitation_type'] = Constants['partyInvitationTypes'][partyInvitationType]['external'];
                if (partyInvitationFormat !== undefined) additionalMetadata['invitation_format'] = Constants['partyInvitationFormats'][partyInvitationFormat]['external'];
                if (partyInvitationTemplate !== undefined) additionalMetadata['invitation_template'] = Constants['partyInvitationTemplates'][partyInvitationTemplate]['external'];

                if (partyInvitationTemplate === 1) {
                    if (partyInvitationTextOrganization !== undefined) additionalMetadata['text_organization'] = Constants['partyInvitationTextOrganizations'][partyInvitationTextOrganization]['external'];
                } else if (partyInvitationTemplate === 7) {
                    if (partyInvitationTextOrganization2 !== undefined) additionalMetadata['text_organization'] = Constants['partyInvitationTextOrganizations'][partyInvitationTextOrganization2]['external'];
                }
            }

            if (eventType === 10) {
                // Show metadata
                if (showTicketType !== undefined) additionalMetadata['ticket_type'] = Constants['showTicketTypes'][showTicketType]['external'];
                if (showType !== undefined) additionalMetadata['show_type'] = Constants['showTypes'][showType]['external'];
                if (showDuration !== undefined) additionalMetadata['show_duration'] = Constants['showDurations'][showDuration]['external'];
            }

            if (eventType === 11) {
                // Train metadata
                if (trainSeatType !== undefined) additionalMetadata['seat_type'] = Constants['trainSeatTypes'][trainSeatType]['external'];
                if (trainTicketType !== undefined) additionalMetadata['ticket_type'] = Constants['trainTicketTypes'][trainTicketType]['external'];
            }
        }

        if (download) checkIfValid = true;
        const valid = checkIfValid ? validate(json) : true; // Bypassing the validation if we don't care about it

        if (download && valid && providerName !== undefined) {
            const normalizedProvider = normalizeProvider(providerName);
            if (!Object.keys(providers).includes(normalizedProvider)) providers[normalizedProvider] = {};
            if (!Object.keys(providers[normalizedProvider]).includes(locale)) providers[normalizedProvider][locale] = {};
            if (!Object.keys(providers[normalizedProvider][locale]).includes('e' + eventType)) providers[normalizedProvider][locale]['e' + eventType] = {};
            if (!providers[normalizedProvider][locale]['e' + eventType]['s4']) providers[normalizedProvider][locale]['e' + eventType]['s4'] = 0;

            providers[normalizedProvider][locale]['e' + eventType]['s4']++;
        }

        if (download) {
            let tempLocale = locale;

            if (dataType === 'emails' && ['au', 'ca', 'gb', 'in'].includes(tempLocale) && eventType === 1) {
                tempLocale = 'au_ca_gb_in';
            }

            if (dataType === 'textMessages' && ['au', 'ca', 'gb', 'in'].includes(tempLocale)) {
                tempLocale = 'au_ca_gb_in';
            }

            if (eventType === 8) {
                deliveryTarget[dataType][tempLocale][eventType][0][partyInvitationFormat]['collected']['s4']++;
            } else {
                const commonLimit = Object.keys(deliveryTarget[dataType][tempLocale][eventType]).includes("0");
                if (commonLimit) deliveryTarget[dataType][tempLocale][eventType][0]['collected']['s4']++;
                else deliveryTarget[dataType][tempLocale][eventType][providerType]['collected']['s4']++;
            }
        }

        response['valid'] = valid;
        response['prefix'] = prefix;
        response['assetBaseName'] = assetBaseName;
        response['file'] = file;
        response['json'] = json;
        response['text2'] = text2;

        return response;
    } catch (error) {
        console.log(error);
        response['error'] = error;
        return response;
    }
}


export default processData;