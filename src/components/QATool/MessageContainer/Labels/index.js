import React, { useEffect, useState } from 'react';
import { realtimeDb, deleteFile, getFileUrl } from '../../../../firebase/config';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

import './index.css';
import Constants from '../../../Constants';
import LogEvent from '../../../CommonFunctions/LogEvent';
import processData from '../../../CommonFunctions/processData';
import Swal from 'sweetalert2';

const Labels = ({ messageId, message, locked, setShowLog, unlocked, setUnlocked, messageLabels, qaToolType, validate, shouldBeBackup, locale }) => {
    const userInfo = useSelector((state) => state.userInfo.value || {});
    const userId = userInfo['userId'];

    const [qaers, setQaers] = useState({});
    const participantId = message?.participantId;

    const root = Constants['qaToolTypes'][qaToolType]['root'];
    const root2 = Constants['qaToolTypes'][qaToolType]['rootLabels'];

    useEffect(() => {
        const listener1 = realtimeDb.ref('/users').orderByChild('qaer').equalTo(true).on('value', res => {
            let temp = res.val() || {};
            temp[0] = '';
            setQaers(temp);
        });

        return () => realtimeDb.ref('/users').off('value', listener1);
    }, [participantId]);

    const saveQaDate = async () => {
        const currentDate = message['qaDate'];
        const qaerId = message['qaer'];
        if (currentDate !== undefined || userId !== qaerId) return;

        const date = new Date();
        const dateString = format(date, 'yyyyMMdd').substring(2);
        const dateInt = parseInt(dateString);
        await realtimeDb.ref(root + '/' + messageId + "/qaDate").set(dateInt);
    }

    const validateMessage = async () => {
        // Processing the data as we would do when delivering it, and returning the errors if any
        const dataType = qaToolType;
        const labels = messageLabels;
        const participantId = message['participantId'];
        const participantInfo = await realtimeDb.ref('/participants/' + participantId).once('value').then(res => res.val() || {});
        const processedData = await processData(
            validate,
            dataType,
            messageId,
            message,
            labels,
            participantInfo,
            {},
            {},
            false,
            userInfo,
            true
        );

        let errors = [];
        if (dataType === 'emails') {
            // Check if the email is on storage
            const emailPath = '/emails/' + messageId + '/body.html';
            const emailExists = await getFileUrl(emailPath).then(() => true).catch(() => false);
            if (!emailExists) errors.unshift({ instancePath: 'email body', message: ' not found' });
        }


        errors = errors.concat((!processedData.valid && !validate.errors && errors.length === 0) ? [{ instancePath: 'Unknown', message: 'Unknown error' }] : (validate.errors || []));

        // Resetting before returning...
        validate.errors = null;
        return errors;
    }

    const addFailReason = async (reasonId) => {
        let currentReasons = message['failReasons'] || [];
        if (currentReasons.includes(reasonId)) {
            currentReasons = currentReasons.filter((reason) => reason !== reasonId);
            if (currentReasons.length === 0) {
                realtimeDb.ref(root + '/' + messageId + '/failReasons').remove();
            } else {
                realtimeDb.ref(root + '/' + messageId + '/failReasons').set(currentReasons);
            }
        } else {
            currentReasons.push(reasonId);
            realtimeDb.ref(root + '/' + messageId + '/failReasons').set(currentReasons);
        }
    }

    const formatDate = (input) => {
        input = input.toString();
        const dateString = '20' + input.substring(0, 2) + '-' + input.substring(2, 4) + '-' + input.substring(4, 6);
        return dateString;
    }

    return <div id="labels">
        <div className="subcontainer">
            {messageId > 100000 && <div className="message-parameter">
                <span className={"message-parameter-key" + (unlocked ? ' unlocked-editor' : '')} onClick={() => {
                    if (userId !== 1) return;
                    setUnlocked(!unlocked);
                }}>
                    Info
                </span>
                <div className="message-parameter-container">
                    <div className='info'>
                        <span className='header'>ID</span>
                        <span className='header'>{messageId}</span>
                    </div>

                    {locale && <div className='info'>
                        <span className='header'>Locale</span>
                        <span className='header'>{Constants['locales'][locale]}</span>
                    </div>}

                    {userInfo['role'] === 'admin' && <>
                        {message['date'] && <div className='info'>
                            <span className='header'>Upload date</span>
                            <span className='header'>{formatDate(message['date'])}</span>
                        </div>}

                        {message['qaDate'] && <div className='info'>
                            <span className='header'>QA date</span>
                            <span className='header'>{formatDate(message['qaDate'])}</span>
                        </div>}

                        {message['redactedDate'] && <div className='info'>
                            <span className='header'>Redacted date</span>
                            <span className='header'>{formatDate(message['redactedDate'])}</span>
                        </div>}
                    </>}

                    {userInfo['role'] === 'admin' && <>
                        <select
                            disabled={locked}
                            onKeyDown={(e) => e.preventDefault()}
                            onChange={(e) => {
                                const qaerId = e.target.value;
                                realtimeDb.ref(root + '/' + messageId).update({ qaer: parseInt(qaerId) });

                                const action = Constants['qaToolTypes'][qaToolType]['qaerAssignedAction'];
                                LogEvent({ participantId, messageId, qaToolType, action, value: parseInt(qaerId), userId: userId, appVersion: userInfo['appVersion'] });
                            }}
                        >
                            {Object.keys(qaers).sort((a, b) => {
                                let aName = qaers[a]['name'] || '';
                                let bName = qaers[b]['name'] || '';
                                return aName < bName ? -1 : 1;
                            }).map(qaerId => {
                                const qaer = qaers[qaerId] || {};
                                const userId = qaer['userId'] || 0;
                                const qaerName = qaer['name'] || '';
                                return <option
                                    key={'message-qaer-' + messageId + '-' + qaerId + '-' + userId}
                                    value={userId}
                                    selected={userId === (message['qaer'] || 0)}
                                >
                                    {qaerName || ''}
                                </option>
                            })}
                        </select>

                        <button
                            id="openLogButton"
                            onClick={() => setShowLog({ qaToolType: qaToolType, messageId: messageId })}
                        >
                            Open log
                        </button>
                    </>}
                </div>
            </div>}

            <div className="message-parameter">
                <span className="message-parameter-key">Status</span>
                <div className="message-parameter-container">
                    {Object.keys(Constants['qaToolTypes'][qaToolType]['statuses']).sort((a, b) => Constants['qaToolTypes'][qaToolType]['statuses'][a].localeCompare(Constants['qaToolTypes'][qaToolType]['statuses'][b])).map(statusId => {
                        statusId = parseInt(statusId);
                        if ([0].includes(statusId)) return null;
                        if ([0, 1, 2, 3].includes(message['status'] || 0) && statusId > 3) return null;
                        if (statusId === 3) {
                            if (message['status'] !== 3 && !shouldBeBackup) return null;
                        }
                        if ([4, 5, 6].includes(message['status']) && statusId !== message['status']) return null;
                        const status = Constants['qaToolTypes'][qaToolType]['statuses'][statusId];
                        const disabled = locked;
                        return <button
                            className={"status-button " + (statusId === message['status'] ? "status-button-" + status.toLowerCase().replaceAll(' ', '-') : "")}
                            key={'message-status-' + messageId + '-' + status}
                            disabled={disabled}
                            onClick={async () => {
                                const action = Constants['qaToolTypes'][qaToolType]['statusChangeAction'];
                                if (message['status'] === statusId) {
                                    realtimeDb.ref(root + '/' + messageId + "/status").remove();
                                    LogEvent({ participantId, messageId, qaToolType, action, value: 0, userId: userId, appVersion: userInfo['appVersion'] });

                                    // Removing fail reasons
                                    if (message['failReasons'] !== undefined) realtimeDb.ref(root + '/' + messageId + '/failReasons').remove();
                                } else {
                                    if (statusId === 1) {
                                        const errors = await validateMessage();

                                        if (errors.length > 0) {
                                            const errorMessages = errors.map((error, index) => {
                                                let { instancePath, message } = error;
                                                instancePath = (instancePath || '').toString().replace('/assets/0/asset_metadata/additional/', '').replace('/assets/0/asset_metadata/additional', 'asset_metadata').replace('_metadata', '');
                                                message = (message || '').toString().replace('must have required property', '');
                                                if (message === 'must match "then" schema') return null;
                                                return '<b>' + instancePath + '</b>:' + message;
                                            }).filter(msg => msg);

                                            Swal.fire({
                                                title: 'Error',
                                                html: errorMessages.join('<br/>'),
                                                icon: 'error',
                                                confirmButtonText: 'Ok'
                                            });

                                            return;
                                        }
                                    }
                                    realtimeDb.ref(root + '/' + messageId + "/status").set(statusId);

                                    LogEvent({ participantId, messageId, qaToolType, action, value: statusId, userId: userId, appVersion: userInfo['appVersion'] });

                                    saveQaDate();

                                    // Removing fail reasons
                                    if (statusId !== 2) {
                                        if (message['failReasons'] !== undefined) realtimeDb.ref(root + '/' + messageId + '/failReasons').remove();
                                    }

                                    // Removing other parameters that are not needed when rejected
                                    if (statusId === 2) {
                                        realtimeDb.ref(root2 + '/' + messageId).remove();
                                        if (qaToolType === 'emails') deleteFile('/emails/' + messageId + '/body.html').catch(error => console.log(error));
                                    }
                                }
                            }}
                        >
                            {status}
                        </button>
                    })}
                </div>
            </div>

            {shouldBeBackup && [0, 1].includes(message['status'] || 0) && <div id="backupNotification">Mark as backup!</div>}

            {message['status'] == 2 && <div className="message-parameter fail-reason-container">
                <span className="message-parameter-key">Fail reason</span>

                <div className="message-parameter-container">
                    {Object.keys(Constants['qaToolTypes'][qaToolType]['failReasons']).sort((a, b) => {
                        const reasonA = Constants['qaToolTypes'][qaToolType]['failReasons'][a];
                        const reasonB = Constants['qaToolTypes'][qaToolType]['failReasons'][b];
                        if (reasonA === 'Other') return 1;
                        return reasonA.localeCompare(reasonB);
                    }).map((reasonId) => {
                        reasonId = parseInt(reasonId);
                        const reason = Constants['qaToolTypes'][qaToolType]['failReasons'][reasonId];
                        return <button
                            key={"fail-reason-" + messageId + "-" + reasonId}
                            className={'fail-reason ' + ((message['failReasons'] || []).includes(reasonId) ? ' selected' : '')}
                            onClick={() => addFailReason(reasonId)}
                            disabled={locked}
                        >
                            {reason}
                        </button>
                    })}
                </div>
            </div>}
        </div>

        {message['status'] !== 2 && <>
            <div className="subcontainer">
                <div className="message-parameter">
                    <span className="message-parameter-key">Action type</span>
                    <div className="message-parameter-container">
                        {Object.keys(Constants['actionTypes']).map(actionTypeId => {
                            actionTypeId = parseInt(actionTypeId);
                            const actionType = Constants['actionTypes'][actionTypeId]['internal'];
                            return <button
                                className={messageLabels['actionType'] === actionTypeId ? ' selected' : ''}
                                key={"action-type-" + messageId + "-" + actionTypeId}
                                disabled={locked}
                                onClick={() => {
                                    const currentActionType = messageLabels['actionType'] || 0;
                                    if (currentActionType === actionTypeId) {
                                        realtimeDb.ref(root2 + '/' + messageId + "/actionType").remove();
                                    } else {
                                        realtimeDb.ref(root2 + '/' + messageId + "/actionType").set(actionTypeId);
                                    }
                                }}
                            >
                                {actionType}
                            </button>

                        })}
                    </div>
                </div>

                <div className="message-parameter">
                    <span className="message-parameter-key">Provider</span>
                    <div className="message-parameter-container">
                        {Object.keys(Constants['providerTypes']).map(providerTypeId => {
                            providerTypeId = parseInt(providerTypeId);
                            const providerType = Constants['providerTypes'][providerTypeId]['internal'];
                            return <button
                                className={messageLabels['providerType'] === providerTypeId ? ' selected' : ''}
                                key={"provider-name-" + messageId + "-" + providerTypeId}
                                disabled={locked}
                                onClick={() => {
                                    const currentproviderType = messageLabels['providerType'] || 0;
                                    if (currentproviderType === providerTypeId) {
                                        realtimeDb.ref(root2 + '/' + messageId + "/providerType").remove();
                                    } else {
                                        realtimeDb.ref(root2 + '/' + messageId + "/providerType").set(providerTypeId);
                                    }
                                }}
                            >
                                {providerType}
                            </button>
                        })}
                    </div>
                </div>

                <div className="message-parameter">
                    <span className="message-parameter-key">Event type</span>
                    <div className="message-parameter-container">
                        {Object.keys(Constants['eventTypes']).sort((a, b) => Constants['eventTypes'][a]['internal'].localeCompare(Constants['eventTypes'][b]['internal'])).map(eventTypeId => {
                            eventTypeId = parseInt(eventTypeId);
                            const eventType = Constants['eventTypes'][eventTypeId]['internal'];
                            return <button
                                key={"event-type-" + messageId + "-" + eventTypeId}
                                className={messageLabels['eventType'] === eventTypeId ? ' selected' : ''}
                                disabled={locked}
                                onClick={() => {
                                    const currentEventType = messageLabels['eventType'] || 0;
                                    realtimeDb.ref(root2 + '/' + messageId + "/eventType").set(currentEventType === eventTypeId ? null : eventTypeId);

                                    // Removing unusued when the event type changes
                                    const fieldsToRemove = [
                                        'originalTimestamp',
                                        'standardizedTimestamp',
                                        'dropOffLocationType',
                                        'pickUpLocation',
                                        'dropOffLocation',
                                        'partySize',
                                        'tripType',
                                        'flightTripType',
                                        'numberOfStops',
                                        'roomType',
                                        'numberOfNights',
                                        'trainSeatType',
                                        'trainTicketType',
                                        'busSeatType',
                                        'showTicketType',
                                        'showType',
                                        'showDuration',
                                        'partyInvitationType',
                                        'partyInvitationFormat',
                                        'partyInvitationTemplate',
                                        'partyInvitationTextOrganization',
                                        'partyInvitationTextOrganization2',
                                        'appointmentVisitType',
                                        'appointmentType',
                                        'state'
                                    ]

                                    const obj = Object.fromEntries(fieldsToRemove.map(field => [field, null]));
                                    realtimeDb.ref(root2 + '/' + messageId).update(obj);
                                }}
                            >
                                {eventType}
                            </button>
                        })}
                    </div>
                </div>
            </div>

            {[1, 2, 3, 4, 5, 6, 8, 10, 11].includes(messageLabels['eventType']) && <div className="subcontainer">
                {[2, 4, 11].includes(messageLabels['eventType']) && <div className="message-parameter">
                    <span className="message-parameter-key">Trip type</span>
                    <div className="message-parameter-container">
                        {Object.keys(Constants['tripTypes']).map(tripTypeId => {
                            tripTypeId = parseInt(tripTypeId);
                            const tripType = Constants['tripTypes'][tripTypeId]['internal'];
                            return <button
                                key={"trip-type-" + messageId + "-" + tripTypeId}
                                className={messageLabels['tripType'] === tripTypeId ? ' selected' : ''}
                                disabled={locked}
                                onClick={() => {
                                    const currentTripType = messageLabels['tripType'] || 0;
                                    if (currentTripType === tripTypeId) {
                                        realtimeDb.ref(root2 + '/' + messageId + "/tripType").remove();
                                    } else {
                                        realtimeDb.ref(root2 + '/' + messageId + "/tripType").set(tripTypeId);
                                    }
                                }}
                            >
                                {tripType}
                            </button>
                        })}
                    </div>
                </div>}

                {messageLabels['eventType'] === 1 && <>
                    <div className="message-parameter">
                        <span className="message-parameter-key">Appoint. type</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['appointmentTypes']).map(appointmentTypeId => {
                                appointmentTypeId = parseInt(appointmentTypeId);
                                const appointmentType = Constants['appointmentTypes'][appointmentTypeId]['internal'];
                                return <button
                                    className={messageLabels['appointmentType'] === appointmentTypeId ? ' selected' : ''}
                                    key={"appointment-type-" + messageId + "-" + appointmentTypeId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentAppointmentType = messageLabels['appointmentType'] || 0;
                                        if (currentAppointmentType === appointmentTypeId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/appointmentType").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/appointmentType").set(appointmentTypeId);
                                        }
                                    }}
                                >
                                    {appointmentType}
                                </button>
                            })}
                        </div>
                    </div>

                    <div className="message-parameter">
                        <span className="message-parameter-key">Visit type</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['appointmentVisitTypes']).map(appointmentVisitTypeId => {
                                appointmentVisitTypeId = parseInt(appointmentVisitTypeId);
                                const appointmentVisitType = Constants['appointmentVisitTypes'][appointmentVisitTypeId]['internal'];
                                return <button
                                    className={messageLabels['appointmentVisitType'] === appointmentVisitTypeId ? ' selected' : ''}
                                    key={"appointment-visit-type-" + messageId + "-" + appointmentVisitTypeId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentAppointmentVisitType = messageLabels['appointmentVisitType'] || 0;
                                        if (currentAppointmentVisitType === appointmentVisitTypeId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/appointmentVisitType").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/appointmentVisitType").set(appointmentVisitTypeId);
                                        }
                                    }}
                                >
                                    {appointmentVisitType}
                                </button>
                            })}
                        </div>
                    </div>

                </>}

                {messageLabels['eventType'] === 2 && <div className="message-parameter">
                    <span className="message-parameter-key">Seat type</span>
                    <div className="message-parameter-container">
                        {Object.keys(Constants['busSeatTypes']).map(busSeatTypeId => {
                            busSeatTypeId = parseInt(busSeatTypeId);
                            const busSeatType = Constants['busSeatTypes'][busSeatTypeId]['internal'];
                            return <button
                                className={messageLabels['busSeatType'] === busSeatTypeId ? ' selected' : ''}
                                key={"bus-seat-type-" + messageId + "-" + busSeatTypeId}
                                disabled={locked}
                                onClick={() => {
                                    const currentBusSeatType = messageLabels['busSeatType'] || 0;
                                    if (currentBusSeatType === busSeatTypeId) {
                                        realtimeDb.ref(root2 + '/' + messageId + "/busSeatType").remove();
                                    } else {
                                        realtimeDb.ref(root2 + '/' + messageId + "/busSeatType").set(busSeatTypeId);
                                    }
                                }}
                            >
                                {busSeatType}
                            </button>
                        })}
                    </div>
                </div>}

                {messageLabels['eventType'] === 3 && <div className="message-parameter">
                    <span className="message-parameter-key">Drop off location</span>
                    <div className="message-parameter-container">
                        {Object.keys(Constants['dropOffLocationTypes']).map(dropOffLocationTypeId => {
                            dropOffLocationTypeId = parseInt(dropOffLocationTypeId);
                            const dropOffLocationType = Constants['dropOffLocationTypes'][dropOffLocationTypeId]['internal'];
                            return <button
                                className={messageLabels['dropOffLocationType'] === dropOffLocationTypeId ? ' selected' : ''}
                                key={"drop-off-location-type-" + messageId + "-" + dropOffLocationTypeId}
                                disabled={locked}
                                onClick={() => {
                                    const currentDropOffLocationType = messageLabels['dropOffLocationType'] || 0;
                                    if (currentDropOffLocationType === dropOffLocationTypeId) {
                                        realtimeDb.ref(root2 + '/' + messageId + "/dropOffLocationType").remove();
                                        if (dropOffLocationTypeId === 2) realtimeDb.ref(root2 + '/' + messageId + "/dropOffLocation").remove();
                                    } else {
                                        realtimeDb.ref(root2 + '/' + messageId + "/dropOffLocationType").set(dropOffLocationTypeId);
                                        if (dropOffLocationTypeId !== 2) realtimeDb.ref(root2 + '/' + messageId + "/dropOffLocation").remove();
                                    }
                                }}
                            >
                                {dropOffLocationType}
                            </button>
                        })}
                    </div>
                </div>}


                {messageLabels['eventType'] === 5 && <div className="message-parameter">
                    <span className="message-parameter-key">Trip type</span>
                    <div className="message-parameter-container">
                        {Object.keys(Constants['flightTripTypes']).map(flightTripTypeId => {
                            flightTripTypeId = parseInt(flightTripTypeId);
                            const flightTripType = Constants['flightTripTypes'][flightTripTypeId]['internal'];
                            return <button
                                className={messageLabels['flightTripType'] === flightTripTypeId ? ' selected' : ''}
                                key={"flight-trip-type-" + messageId + "-" + flightTripTypeId}
                                disabled={locked}
                                onClick={() => {
                                    const currentFlightTripType = messageLabels['flightTripType'] || 0;
                                    if (currentFlightTripType === flightTripTypeId) {
                                        realtimeDb.ref(root2 + '/' + messageId + "/flightTripType").remove();
                                        if (flightTripTypeId === 3) realtimeDb.ref(root2 + '/' + messageId + "/numberOfStops").remove();
                                    } else {
                                        realtimeDb.ref(root2 + '/' + messageId + "/flightTripType").set(flightTripTypeId);
                                        if (flightTripTypeId !== 3) realtimeDb.ref(root2 + '/' + messageId + "/numberOfStops").remove();
                                    }
                                }}
                            >
                                {flightTripType}
                            </button>
                        })}
                    </div>
                </div>}

                {messageLabels['eventType'] === 5 && messageLabels['flightTripType'] === 3 && <div className="message-parameter">
                    <span className="message-parameter-key">Stops</span>
                    <div className="message-parameter-container">
                        {Constants['numberOfStops'].map(numberOfStops => {
                            return <button
                                className={messageLabels['numberOfStops'] === numberOfStops ? ' selected' : ''}
                                key={"number-of-stops-" + messageId + "-" + numberOfStops}
                                disabled={locked}
                                onClick={() => {
                                    const currentNumberOfStops = messageLabels['numberOfStops'] || 0;
                                    if (currentNumberOfStops === numberOfStops) {
                                        realtimeDb.ref(root2 + '/' + messageId + "/numberOfStops").remove();
                                    } else {
                                        realtimeDb.ref(root2 + '/' + messageId + "/numberOfStops").set(numberOfStops);
                                    }
                                }}
                            >
                                {numberOfStops}
                            </button>
                        })}
                    </div>
                </div>}

                {messageLabels['eventType'] === 6 && <>
                    <div className="message-parameter">
                        <span className="message-parameter-key">Room</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['roomTypes']).map(roomTypeId => {
                                roomTypeId = parseInt(roomTypeId);
                                const roomType = Constants['roomTypes'][roomTypeId]['internal'];
                                return <button
                                    className={messageLabels['roomType'] === roomTypeId ? ' selected' : ''}
                                    key={"room-type-" + messageId + "-" + roomTypeId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentRoomType = messageLabels['roomType'] || 0;
                                        if (currentRoomType === roomTypeId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/roomType").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/roomType").set(roomTypeId);
                                        }
                                    }}
                                >
                                    {roomType}
                                </button>
                            })}
                        </div>
                    </div>

                    <div className="message-parameter">
                        <span className="message-parameter-key">Nights</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['numberOfNights']).map(numberOfNightsId => {
                                numberOfNightsId = parseInt(numberOfNightsId);
                                const numberOfNights = Constants['numberOfNights'][numberOfNightsId]['internal'];
                                return <button
                                    className={messageLabels['numberOfNights'] === numberOfNightsId ? ' selected' : ''}
                                    key={"number-of-nights-" + messageId + "-" + numberOfNightsId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentNumberOfNights = messageLabels['numberOfNights'] || 0;
                                        if (currentNumberOfNights === numberOfNightsId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/numberOfNights").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/numberOfNights").set(numberOfNightsId);
                                        }
                                    }}
                                >
                                    {numberOfNights}
                                </button>
                            })}
                        </div>
                    </div>
                </>}

                {messageLabels['eventType'] === 8 && <>
                    <div className="message-parameter">
                        <span className="message-parameter-key">Invitation type</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['partyInvitationTypes']).map(partyInvitationTypeId => {
                                partyInvitationTypeId = parseInt(partyInvitationTypeId);
                                const partyInvitationType = Constants['partyInvitationTypes'][partyInvitationTypeId]['internal'];
                                return <button
                                    className={messageLabels['partyInvitationType'] === partyInvitationTypeId ? ' selected' : ''}
                                    key={"party-invitation-type-" + messageId + "-" + partyInvitationTypeId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentPartyInvitationType = messageLabels['partyInvitationType'] || 0;
                                        if (currentPartyInvitationType === partyInvitationTypeId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationType").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationType").set(partyInvitationTypeId);
                                        }
                                    }}
                                >
                                    {partyInvitationType}
                                </button>
                            })}
                        </div>
                    </div>

                    <div className="message-parameter">
                        <span className="message-parameter-key">Invitation format</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['partyInvitationFormats']).map(partyInvitationFormatId => {
                                partyInvitationFormatId = parseInt(partyInvitationFormatId);
                                const partyInvitationFormat = Constants['partyInvitationFormats'][partyInvitationFormatId]['internal'];
                                return <button
                                    className={messageLabels['partyInvitationFormat'] === partyInvitationFormatId ? ' selected' : ''}
                                    key={"party-invitation-format-" + messageId + "-" + partyInvitationFormatId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentPartyInvitationFormat = messageLabels['partyInvitationFormat'] || 0;
                                        if (currentPartyInvitationFormat === partyInvitationFormatId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationFormat").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationFormat").set(partyInvitationFormatId);
                                        }

                                        // Removing party invitation format and text organization when the format changes
                                        if (messageLabels['partyInvitationTemplate'] !== undefined) realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTemplate").remove();
                                        if (messageLabels['partyInvitationTextOrganization'] !== undefined) realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTextOrganization").remove();
                                        if (messageLabels['partyInvitationTextOrganization2'] !== undefined) realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTextOrganization2").remove();
                                    }}
                                >
                                    {partyInvitationFormat}
                                </button>
                            })}
                        </div>
                    </div>

                    {messageLabels['partyInvitationFormat'] === 2 && <>
                        <div className="message-parameter">
                            <span className="message-parameter-key">Invitation template</span>
                            <div className="message-parameter-container">
                                {Object.keys(Constants['partyInvitationTemplates']).sort((a, b) => Constants['partyInvitationTemplates'][a]['internal'].localeCompare(Constants['partyInvitationTemplates'][b]['internal'])).map(partyInvitationTemplateId => {
                                    partyInvitationTemplateId = parseInt(partyInvitationTemplateId);
                                    const partyInvitationTemplate = Constants['partyInvitationTemplates'][partyInvitationTemplateId]['internal'];
                                    return <button
                                        className={messageLabels['partyInvitationTemplate'] === partyInvitationTemplateId ? ' selected' : ''}
                                        key={"party-invitation-template-" + messageId + "-" + partyInvitationTemplateId}
                                        disabled={locked}
                                        onClick={() => {
                                            const currentPartyInvitationTemplate = messageLabels['partyInvitationTemplate'] || 0;
                                            if (currentPartyInvitationTemplate === partyInvitationTemplateId) {
                                                realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTemplate").remove();
                                            } else {
                                                realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTemplate").set(partyInvitationTemplateId);
                                            }

                                            // Removing party invitation text organization when the template changes
                                            if (messageLabels['partyInvitationTextOrganization'] !== undefined) realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTextOrganization").remove();
                                            if (messageLabels['partyInvitationTextOrganization2'] !== undefined) realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTextOrganization2").remove();
                                        }}
                                    >
                                        {partyInvitationTemplate}
                                    </button>
                                })}
                            </div>
                        </div>

                        {messageLabels['partyInvitationTemplate'] === 1 && <div className="message-parameter">
                            <span className="message-parameter-key">Text organization</span>
                            <div className="message-parameter-container">
                                {Object.keys(Constants['partyInvitationTextOrganizations']).map(partyInvitationTextOrganizationId => {
                                    partyInvitationTextOrganizationId = parseInt(partyInvitationTextOrganizationId);
                                    const partyInvitationTextOrganization = Constants['partyInvitationTextOrganizations'][partyInvitationTextOrganizationId]['internal'];
                                    return <button
                                        className={messageLabels['partyInvitationTextOrganization'] === partyInvitationTextOrganizationId ? ' selected' : ''}
                                        key={"party-invitation-text-organization-" + messageId + "-" + partyInvitationTextOrganizationId}
                                        disabled={locked}
                                        onClick={() => {
                                            const currentPartyInvitationTextOrganization = messageLabels['partyInvitationTextOrganization'] || 0;
                                            if (currentPartyInvitationTextOrganization === partyInvitationTextOrganizationId) {
                                                realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTextOrganization").remove();
                                            } else {
                                                realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTextOrganization").set(partyInvitationTextOrganizationId);
                                            }
                                        }}
                                    >
                                        {partyInvitationTextOrganization}
                                    </button>
                                })}
                            </div>
                        </div>}

                        {messageLabels['partyInvitationTemplate'] === 7 && <div className="message-parameter">
                            <span className="message-parameter-key">Text organization</span>
                            <div className="message-parameter-container">
                                {Object.keys(Constants['partyInvitationTextOrganizations2']).map(partyInvitationTextOrganization2Id => {
                                    partyInvitationTextOrganization2Id = parseInt(partyInvitationTextOrganization2Id);
                                    const partyInvitationTextOrganization2 = Constants['partyInvitationTextOrganizations2'][partyInvitationTextOrganization2Id]['internal'];
                                    return <button
                                        className={messageLabels['partyInvitationTextOrganization2'] === partyInvitationTextOrganization2Id ? ' selected' : ''}
                                        key={"party-invitation-text-organization2-" + messageId + "-" + partyInvitationTextOrganization2Id}
                                        disabled={locked}
                                        onClick={() => {
                                            const currentPartyInvitationTextOrganization2 = messageLabels['partyInvitationTextOrganization2'] || 0;
                                            if (currentPartyInvitationTextOrganization2 === partyInvitationTextOrganization2Id) {
                                                realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTextOrganization2").remove();
                                            } else {
                                                realtimeDb.ref(root2 + '/' + messageId + "/partyInvitationTextOrganization2").set(partyInvitationTextOrganization2Id);
                                            }
                                        }}
                                    >
                                        {partyInvitationTextOrganization2}
                                    </button>
                                })}
                            </div>
                        </div>}
                    </>}
                </>}

                {messageLabels['eventType'] === 10 && <>
                    <div className="message-parameter">
                        <span className="message-parameter-key">Ticket type</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['showTicketTypes']).map(showTicketTypeId => {
                                showTicketTypeId = parseInt(showTicketTypeId);
                                const showTicketType = Constants['showTicketTypes'][showTicketTypeId]['internal'];
                                return <button
                                    className={messageLabels['showTicketType'] === showTicketTypeId ? ' selected' : ''}
                                    key={"show-ticket-type-" + messageId + "-" + showTicketTypeId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentShowTicketType = messageLabels['showTicketType'] || 0;
                                        if (currentShowTicketType === showTicketTypeId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/showTicketType").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/showTicketType").set(showTicketTypeId);
                                        }
                                    }}
                                >
                                    {showTicketType}
                                </button>
                            })}
                        </div>
                    </div>

                    <div className="message-parameter">
                        <span className="message-parameter-key">Show type</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['showTypes']).map(showTypeId => {
                                showTypeId = parseInt(showTypeId);
                                const showType = Constants['showTypes'][showTypeId]['internal'];
                                return <button
                                    className={messageLabels['showType'] === showTypeId ? ' selected' : ''}
                                    key={"show-type-" + messageId + "-" + showTypeId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentShowType = messageLabels['showType'] || 0;
                                        if (currentShowType === showTypeId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/showType").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/showType").set(showTypeId);
                                        }

                                        // Removing show duration when the show type changes
                                        if (messageLabels['showDuration'] !== undefined) realtimeDb.ref(root2 + '/' + messageId + "/showDuration").remove();
                                    }}
                                >
                                    {showType}
                                </button>
                            })}
                        </div>
                    </div>

                    {messageLabels['showType'] === 4 && <div className="message-parameter">
                        <span className="message-parameter-key">Show duration</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['showDurations']).map(showDurationId => {
                                showDurationId = parseInt(showDurationId);
                                const showDuration = Constants['showDurations'][showDurationId]['internal'];
                                return <button
                                    className={messageLabels['showDuration'] === showDurationId ? ' selected' : ''}
                                    key={"show-duration-" + messageId + "-" + showDurationId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentShowDuration = messageLabels['showDuration'] || 0;
                                        if (currentShowDuration === showDurationId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/showDuration").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/showDuration").set(showDurationId);
                                        }
                                    }}
                                >
                                    {showDuration}
                                </button>
                            })}
                        </div>
                    </div>}

                </>}

                {messageLabels['eventType'] === 11 && <>
                    <div className="message-parameter">
                        <span className="message-parameter-key">Ticket type</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['trainTicketTypes']).map(trainTicketTypeId => {
                                trainTicketTypeId = parseInt(trainTicketTypeId);
                                const trainTicketType = Constants['trainTicketTypes'][trainTicketTypeId]['internal'];
                                return <button
                                    className={messageLabels['trainTicketType'] === trainTicketTypeId ? ' selected' : ''}
                                    key={"train-ticket-type-" + messageId + "-" + trainTicketTypeId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentTrainTicketType = messageLabels['trainTicketType'] || 0;
                                        if (currentTrainTicketType === trainTicketTypeId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/trainTicketType").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/trainTicketType").set(trainTicketTypeId);
                                        }
                                    }}
                                >
                                    {trainTicketType}
                                </button>
                            })}
                        </div>
                    </div>

                    <div className="message-parameter">
                        <span className="message-parameter-key">Seat type</span>
                        <div className="message-parameter-container">
                            {Object.keys(Constants['trainSeatTypes']).map(trainSeatTypeId => {
                                trainSeatTypeId = parseInt(trainSeatTypeId);
                                const trainSeatType = Constants['trainSeatTypes'][trainSeatTypeId]['internal'];
                                return <button
                                    className={messageLabels['trainSeatType'] === trainSeatTypeId ? ' selected' : ''}
                                    key={"train-seat-type-" + messageId + "-" + trainSeatTypeId}
                                    disabled={locked}
                                    onClick={() => {
                                        const currentTrainSeatType = messageLabels['trainSeatType'] || 0;
                                        if (currentTrainSeatType === trainSeatTypeId) {
                                            realtimeDb.ref(root2 + '/' + messageId + "/trainSeatType").remove();
                                        } else {
                                            realtimeDb.ref(root2 + '/' + messageId + "/trainSeatType").set(trainSeatTypeId);
                                        }
                                    }}
                                >
                                    {trainSeatType}
                                </button>
                            })}
                        </div>
                    </div>
                </>}
            </div>}
        </>}
    </div>
}

export default Labels;