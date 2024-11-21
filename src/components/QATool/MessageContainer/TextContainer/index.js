import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { realtimeDb, uploadToStorage, getFileBlob, deleteFile, getFileUrl } from '../../../../firebase/config';

import './index.css';
import Constants from '../../../Constants';
import PiiLabels from '../PiiLabels';
import Swal from 'sweetalert2';
import normalizeProvider from '../../../CommonFunctions/normalizeProvider';
import LogEvent from '../../../CommonFunctions/LogEvent';
import isBackup from '../../../CommonFunctions/isBackup';

let currentlySelectedThreadId = '';
const TextContainer = ({ messageId, message, messageLabels, locked, editHistory, setEditHistory, locale, states, qaToolType, editor, setEditor, attachmentView, setAttachmentView, setShouldBeBackup, openFromPopUp, deliveryTarget }) => {
    const subjectContainer = useRef(null);
    const messageContainer = useRef(null);

    const userInfo = useSelector((state) => state.userInfo.value || {});
    const userId = userInfo['userId'];

    const [weekday, setWeekday] = useState(undefined);
    const [acceptedProvider, setAcceptedProvider] = useState(0);
    const [reasonToRemove, setReasonToRemove] = useState('');

    const updateMessageView = async () => {
        try {
            let fileBblob = await getFileBlob('/emails/' + messageId + '/body.html');
            if (fileBblob) {
                let reader = new FileReader();
                reader.onload = () => {
                    if (currentlySelectedThreadId === messageId) messageContainer.current.innerHTML = reader.result;
                }
                reader.readAsText(fileBblob);
            }
        } catch (error) {
            try {
                messageContainer.current.innerHTML = '';
                //console.error(error);
            } catch (error) {
                //console.error(error);
            }
        }
    }

    useEffect(() => {
        const labels = messageLabels || {};

        const shouldBeBackupBasedOnDeliveryTarget = isBackup(qaToolType, locale, labels['eventType'], labels['providerType'], labels['partyInvitationFormat'], deliveryTarget);

        if (shouldBeBackupBasedOnDeliveryTarget) {
            setAcceptedProvider(0);
            setShouldBeBackup(true);
            return;
        }

        if (labels['eventType'] === undefined || labels['providerName'] === undefined || locale === undefined) {
            setAcceptedProvider(0);
            setShouldBeBackup(false);
            return;
        } else {
            const normalizedProvider = normalizeProvider(labels['providerName']);
            if (normalizedProvider !== '') {
                // console.log('downloading');
                const root = Constants['qaToolTypes'][qaToolType]['root'];
                const path = '/providers' + root + '/' + normalizedProvider + '/' + locale + '/e' + messageLabels['eventType'];
                realtimeDb.ref(path).once('value').then(res => {
                    const statuses = res.val() || {};

                    // s1 = Accepted, s4 = Delivered, s5 = Accepted by client
                    const count = (statuses['s1'] || 0) + (statuses['s4'] || 0) + (statuses['s5'] || 0);

                    setAcceptedProvider(count);

                    const limit = messageLabels['eventType'] === undefined ? 100 : Constants['eventTypes'][messageLabels['eventType']]['providerLimit'];
                    setShouldBeBackup(count >= limit);
                }).catch(error => console.log(error));
            }
        }
    }, [locale, JSON.stringify(messageLabels['eventType']), JSON.stringify(messageLabels['providerName']), JSON.stringify(messageLabels['providerType']), JSON.stringify(messageLabels['partyInvitationType']), JSON.stringify(deliveryTarget)]);

    useEffect(() => {
        if (!messageId || qaToolType !== 'emails' || !messageContainer.current) return;
        currentlySelectedThreadId = messageId;
        updateMessageView();
    }, [messageId, messageContainer.current]);


    const root2 = Constants['qaToolTypes'][qaToolType]['rootLabels'];

    const pickupFromEmailBody = async (key) => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0 && !locked) {
            const selectedText = selection.toString().trim();
            if (selectedText.length > 0) {
                let hasBodyAlready = messageLabels[key] !== undefined;
                if (key === 'text' && qaToolType === 'emails') {
                    hasBodyAlready = await getFileUrl('/emails/' + messageId + '/body.html').then(() => true).catch(() => false);
                }

                if (hasBodyAlready) {
                    const userConfirmation = await Swal.fire({
                        title: 'Are you sure?',
                        text: 'This will replace the current ' + (key === 'subject' ? 'subject' : 'body'),
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, replace'
                    });
                    if (!userConfirmation.isConfirmed) return false;
                }

                if (key === 'subject') {
                    realtimeDb.ref(root2 + '/' + + messageId + '/' + key).set(selectedText);
                    selection.removeAllRanges();
                    return true;
                } else if (key === 'text' && qaToolType === 'emails') {
                    const range = selection.getRangeAt(0);
                    const clonedSelection = range.cloneContents();
                    const div = document.createElement('div');
                    div.appendChild(clonedSelection);
                    const selectedHtml = div.innerHTML;

                    const fileName = 'body.html';
                    const blob = new Blob([selectedHtml], { type: 'text/html' });
                    const file = new File([blob], fileName, { type: 'text/html' });

                    return uploadToStorage("/emails/" + messageId + "/" + fileName, file, { contentType: 'text/html' }).then(() => {
                        selection.removeAllRanges();
                        messageContainer.current.innerHTML = selectedHtml;
                        return true;
                    });
                }
            }
        }
        return true;
    }

    const updateFreeFormParameter = (key, value, spaceIsAllowed) => {
        value = value.toString();
        if (spaceIsAllowed !== true) value = value.trim();
        if (value === '') value = null;
        realtimeDb.ref(root2 + '/' + messageId + '/' + key).set(value);
    }

    useEffect(() => {
        if (!subjectContainer.current) return;
        const html = messageLabels['subject'] || '';

        // adding labels to the text
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        const labels = tempContainer.querySelectorAll('label');
        labels.forEach(label => {
            const piiTypeId = parseInt(label.getAttribute('pii-type-id'));
            const dateValue = label.getAttribute('date-value');
            if (dateValue) {
                label.innerText = '[' + dateValue + ']';
            } else {
                const internal = Constants['piiLabels'].find(label => label['typeId'] === piiTypeId)['internal'];
                label.innerText = '[' + internal + ']';
            }
        });

        const tempHtml = tempContainer.innerHTML;
        subjectContainer.current.innerHTML = tempHtml;
    }, [JSON.stringify(messageLabels['subject'])]);

    useEffect(() => {
        if (['emails', 'attachments'].includes(qaToolType) || !messageContainer.current) return;

        const html = messageLabels['text'] || '';

        // adding labels to the text
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        const labels = tempContainer.querySelectorAll('label');
        labels.forEach(label => {
            const piiTypeId = parseInt(label.getAttribute('pii-type-id'));
            const dateValue = label.getAttribute('date-value');
            if (dateValue) {
                label.innerText = '[' + dateValue + ']';
            } else {
                const internal = Constants['piiLabels'].find(label => label['typeId'] === piiTypeId)['internal'];
                label.innerText = '[' + internal + ']';
            }
        });

        const tempHtml = tempContainer.innerHTML;
        messageContainer.current.innerHTML = tempHtml;
    }, [JSON.stringify(messageLabels['text'])]);

    useEffect(() => {
        try {
            // Check if the date is macthing with 'YYYY-MM-DD' format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(messageLabels['standardizedTimestamp'])) {
                setWeekday(undefined);
                return;
            }

            const date = new Date(messageLabels['standardizedTimestamp']);
            const day = date.getDay();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            setWeekday(days[day]);
        } catch (error) {
            console.log(error);
            setWeekday(undefined);
        }
    }, [messageLabels['standardizedTimestamp']])

    const getUserConfimation = async (key) => {
        const userConfirmation = await Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Remove ' + key
        })

        return userConfirmation.isConfirmed;
    }

    const removeRedactedAttachment = async () => {
        if (reasonToRemove === '') return;

        const userConfirmation = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will remove the redacted attachment',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, remove'
        });
        if (!userConfirmation.isConfirmed) return;
        if (attachmentView === 3) setAttachmentView(2);

        await realtimeDb.ref("/attachments/" + messageId).update({ redacted: null, reasonToRemove: reasonToRemove, redactedDate: null });

        // const fileExtension = Constants['fileExtensions'][message['ext']] || message['ext'];
        // deleteFile('/attachments/' + messageId + '/redacted.' + fileExtension);
        await LogEvent({ participantId: message['participantId'], messageId, qaToolType, action: 11, value: reasonToRemove, userId: userId, appVersion: userInfo['appVersion'] });

        Swal.fire({
            toast: true,
            icon: 'success',
            title: 'The redacted attachment was removed successfully',
            position: 'bottom',
            width: 'unset',
            showConfirmButton: false,
            timer: 3000
        })
    }

    return <div id="textContainer">

        <div id="textFields">
            {qaToolType === 'attachments' && <div id="toggleAttachment">
                {[1, 2, 3].map(viewId => {
                    const viewName = viewId === 1 ? 'Email' : (viewId === 2 ? 'Attachment' : 'Redacted');
                    if (viewId === 3 && userInfo['role'] !== 'admin' && ![11, 12, 13, 14, 18, 27, 32, 33, 34].includes(userId)) return null;
                    const disabled = viewId === 3 && !message['redacted'];
                    if (disabled) return null;
                    return <button
                        key={'toggleAttachment-' + viewId}
                        id={'toggleAttachment-' + viewId}
                        className={attachmentView === viewId ? 'selected' : ''}
                        onClick={() => setAttachmentView(viewId)}
                    >
                        {viewName} {viewId === 3 && message['redactedVersion'] && <span>(v{message['redactedVersion']})</span>}
                    </button>
                })}
            </div>}

            {qaToolType === 'attachments' &&
                message['redacted'] &&
                !locked &&
                (userInfo['role'] === 'admin' || [11, 13, 14, 18, 27, 33, 34].includes(userId)) && <>
                    <textarea
                        id="reasonToRemoveUserInput"
                        placeholder='Reason to remove the redacted attachment'
                        onInput={(e) => {
                            const inputText = e.currentTarget.value.toString().trim();
                            setReasonToRemove(inputText);

                            let height = e.currentTarget.offsetHeight;
                            let newHeight = e.currentTarget.scrollHeight;
                            if (newHeight > height) {
                                e.currentTarget.style.height = 0;
                                e.currentTarget.style.height = newHeight + "px";
                            }
                        }}
                    />
                    {reasonToRemove !== '' && <button
                        id="removeRedactedAttachment"
                        onClick={removeRedactedAttachment}
                    >
                        Remove redacted attachment
                    </button>}
                </>}

            {message['status'] !== 2 && <>
                {['emails', 'attachments'].includes(qaToolType) && <div className={'input-field ' + (editor === 'subject' ? 'selected' : '')} >
                    <span className='header'>
                        Subject

                        {!locked && !(qaToolType === 'attachments' && attachmentView !== 1 && messageLabels['subject'] === undefined) && <a
                            className="fas fa-edit"
                            title="Edit"
                            onClick={async (e) => {
                                e.preventDefault();
                                const res = await pickupFromEmailBody('subject');
                                if (res) setEditor('subject');
                            }}
                            target="_blank"
                        />}

                        {locked && !(qaToolType === 'attachments' && attachmentView !== 1 && messageLabels['subject'] === undefined) && <a
                            className="fas fa-eye"
                            title="Check"
                            onClick={async (e) => {
                                e.preventDefault();
                                setEditor('subject');
                            }}
                            target="_blank"
                        />}

                        {!locked && messageLabels['subject'] !== undefined && <a
                            className="fas fa-eraser"
                            title="Clear"
                            onClick={async (e) => {
                                e.preventDefault();
                                const userConfirmation = await getUserConfimation('subject');
                                if (!userConfirmation) return;
                                realtimeDb.ref(root2 + '/' + messageId + '/subject').remove();
                            }}
                            target="_blank"
                        />}
                    </span>

                    <div ref={subjectContainer} id="subjectContainerDiv" />
                </div>}

                {['emails', 'textMessages'].includes(qaToolType) && <div id="messageContainerDivParent" className={'input-field ' + (editor === 'text' ? 'selected' : '')} >
                    <span className='header'>
                        {qaToolType === 'emails' ? 'Body' : 'Message'}

                        {!locked && qaToolType === 'emails' && <a
                            className="fas fa-edit"
                            title="Edit"
                            onClick={async (e) => {
                                e.preventDefault();
                                const res = await pickupFromEmailBody('text');
                                if (res) setEditor('text');
                            }}
                            target="_blank"
                        />}

                        {locked && qaToolType === 'emails' && <a
                            className="fas fa-eye"
                            title="Check"
                            onClick={async (e) => {
                                e.preventDefault();
                                setEditor('text');
                            }}
                            target="_blank"
                        />}

                        {!locked && (messageLabels['text'] !== undefined || qaToolType === 'emails') && <a
                            className="fas fa-eraser"
                            title="Clear"
                            onClick={async (e) => {
                                e.preventDefault();
                                const userConfirmation = await getUserConfimation(qaToolType === 'emails' ? 'body' : 'message');
                                if (!userConfirmation) return;

                                if (qaToolType === 'textMessages') {
                                    realtimeDb.ref(root2 + '/' + messageId + '/text').remove();
                                    setEditHistory(prev => [...prev, '']);
                                } else {
                                    deleteFile('/emails/' + messageId + '/body.html').catch(error => console.log(error));
                                    messageContainer.current.innerHTML = '';
                                }
                            }}
                            target="_blank"
                        />}
                    </span>

                    <div ref={messageContainer} id="messageContainerDiv" />
                </div>}

                {['emails', 'attachments'].includes(qaToolType) && <div className='input-field'>
                    <span className='header'>Sender email address</span>
                    <input type='text' value={messageLabels['sender'] || ''} onChange={(e) => updateFreeFormParameter('sender', e.target.value, true)} disabled={locked} />
                </div>}

                <div className='input-field'>
                    <span className='header'>
                        Provider name
                        {[1, 9].includes(userId) && acceptedProvider > 0 && <span> (accepted ≈ {acceptedProvider})</span>}
                    </span>
                    <input type='text' value={messageLabels['providerName'] || ''} onChange={(e) => updateFreeFormParameter('providerName', e.target.value, true)} disabled={locked} />
                </div>

                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(messageLabels['eventType'] || '') && ['emails', 'attachments'].includes(qaToolType) && <div className='input-field'>
                    <span className='header'>Original timestamp</span>
                    <input type='text' value={messageLabels['originalTimestamp'] || ''} onChange={(e) => updateFreeFormParameter('originalTimestamp', e.target.value, true)} disabled={locked} />
                </div>}

                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(messageLabels['eventType'] || '') && <div className='input-field'>
                    <span className='header'>Standardized timestamp</span>
                    <input type='text' placeholder='YYYY-MM-DD' value={messageLabels['standardizedTimestamp'] || ''} onChange={(e) => updateFreeFormParameter('standardizedTimestamp', e.target.value, false)} disabled={locked} />
                </div>}

                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(messageLabels['eventType'] || '') && weekday !== undefined && <div className='input-field'>
                    <span className='header'>Weekday of standardized timestamp</span>
                    <input type='text' value={weekday || ''} disabled />
                </div>}

                {[2, 3, 4, 5, 7, 9, 10, 11].includes(messageLabels['eventType'] || '') && <div className='input-field'>
                    <span className='header'>Party size (for {Constants['eventTypes'][messageLabels['eventType']]['internal'].toLowerCase()})</span>
                    <input type='text' placeholder='"X" or "X-X"' value={messageLabels['partySize'] || ''} onChange={(e) => updateFreeFormParameter('partySize', e.target.value, false)} disabled={locked} />
                </div>}

                {messageLabels['eventType'] === 1 && <div className='input-field'>
                    <span className='header'>State / region</span>
                    {Object.keys(states).length === 0 && <input type='text' value={messageLabels['state'] || ''} onChange={(e) => updateFreeFormParameter('state', e.target.value, true)} disabled={locked} />}
                    {Object.keys(states).length > 0 && <select
                        disabled={locked}
                        onChange={(e) => updateFreeFormParameter('state', e.target.value, true)}
                    >
                        {Object.keys(states).map((stateId, index) => {
                            const state = states[stateId];
                            return <option
                                key={'state-' + index}
                                value={state}
                                selected={state === messageLabels['state']}
                            >
                                {state || 'N/A'}
                            </option>
                        })}
                    </select>}
                </div>}

                {messageLabels['eventType'] === 3 && <div className='input-field'>
                    <span className='header'>Pick up location</span>
                    <input type='text' value={messageLabels['pickUpLocation'] || ''} onChange={(e) => updateFreeFormParameter('pickUpLocation', e.target.value, true)} disabled={locked} />
                </div>}

                {messageLabels['eventType'] === 3 && messageLabels['dropOffLocationType'] === 2 && <div className='input-field'>
                    <span className='header'>Drop off location</span>
                    <input type='text' value={messageLabels['dropOffLocation'] || ''} onChange={(e) => updateFreeFormParameter('dropOffLocation', e.target.value, true)} disabled={locked} />
                </div>}
            </>}
        </div>

        {!locked && qaToolType === 'textMessages' && message['status'] !== 2 && <PiiLabels
            messageId={messageId}
            messageLabels={messageLabels}
            messageContainer={messageContainer}
            editHistory={editHistory}
            setEditHistory={setEditHistory}
            qaToolType={qaToolType}
            openFromPopUp={openFromPopUp}
        />}
    </div>
}

export default TextContainer;