import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import { realtimeDb, uploadToStorage } from '../../../../firebase/config';
import Tooltip from '@mui/material/Tooltip';
import Swal from 'sweetalert2';

import './index.css';
import Constants from '../../../Constants';
import getDateTime from './getDateTime.js';

const PiiLabels = ({ messageId, messageLabels, messageContainer, editHistory, setEditHistory, qaToolType, editor, openFromPopUp }) => {
    const userInfo = useSelector((state) => state.userInfo.value || {});
    const userId = userInfo['userId'];

    const root2 = Constants['qaToolTypes'][qaToolType]['rootLabels'];

    const params = useParams();
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

    useEffect(() => {
        if (editHistory.length === 0 && messageLabels['text']) setEditHistory([messageLabels['text']]);
    }, [JSON.stringify(messageLabels['text'])]);

    const saveText = () => {
        if (!messageContainer.current) return;
        const html = messageContainer.current.innerHTML;

        // Removing innerText from each label element
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        const labels = tempContainer.querySelectorAll('label');
        labels.forEach(label => label.innerText = '');
        const tempHtml = tempContainer.innerHTML;

        if (['emails', 'attachments'].includes(qaToolType)) {
            if (editor === 'subject') {
                realtimeDb.ref(root2 + '/' + messageId + '/' + editor).set(tempHtml);
            } else {
                const fileName = 'body.html';
                const blob = new Blob([html], { type: 'text/html' });
                const file = new File([blob], fileName, { type: 'text/html' });
                uploadToStorage("/emails/" + messageId + "/" + fileName, file, { contentType: 'text/html' });
                console.log('saving');

                // This is a temporary solution....
                document.getElementById('messageContainerDiv').innerHTML = html;
            }
        } else {
            realtimeDb.ref(root2 + '/' + messageId + '/text').set(tempHtml);
        }
    }

    const randomizeDate = async (label) => {
        const selection = window.getSelection();
        const selectionText = selection.toString();
        const selectionLength = selectionText.trim().length;

        const spaceBefore = selectionText.match(/^\s+/);
        const spaceAfter = selectionText.match(/\s+$/);
        if (selection && selectionLength > 2) {
            //if (selection['focusNode']['parentElement']['id'] !== 'messageContainerDiv') return;
            const range = selection.getRangeAt(0);

            const { internal, typeId } = label;
            if (messageContainer.current) {
                setEditHistory(prev => [...prev, messageContainer.current.innerHTML]);
            }

            // console.clear();
            // console.log('Original:');
            // console.log(selectionText);
            let weeksToAdd = parseInt(messageId) % 50;
            const negative = messageId.toString().split('').pop() === '0';

            if (weeksToAdd === 0) weeksToAdd = 1;
            if (negative) weeksToAdd = weeksToAdd * -1;

            let newDateString = await getDateTime(selectionText, weeksToAdd);

            // console.log('Result:');
            // console.log(date);

            if (!newDateString) {
                // user input
                setIsPopUpOpen(true);
                const newDateStringQuestion = await Swal.fire({
                    title: internal,
                    html: 'Modify the date manually by <b><u>' + (negative ? 'deducting' : 'adding') + '</u></b> ' + Math.abs(weeksToAdd) + ' weeks exactly. <br/><br/>Remember to keep the original format and weekday! <br/>',
                    input: 'text',
                    showCancelButton: true,
                    confirmButtonText: 'Save',
                    cancelButtonText: 'Cancel',
                    inputValue: selectionText,
                    inputPlaceholder: selectionText,
                    showLoaderOnConfirm: true,
                    preConfirm: (date) => {
                        return date;
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                });
                setIsPopUpOpen(false);

                if (newDateStringQuestion.isConfirmed && newDateStringQuestion.value && (newDateStringQuestion.value || '').toString().trim().length > 2) {
                    newDateString = newDateStringQuestion.value.toString().trim();
                }
            }

            if (!newDateString) {
                // Swal.fire({
                //     title: 'Error',
                //     text: 'Something went wrong...',
                //     icon: 'error'
                // });
                return;
            }

            const labelElement = document.createElement('label');
            labelElement.setAttribute('pii-type-id', typeId);
            labelElement.setAttribute('date-value', newDateString);
            labelElement.innerText = '[' + newDateString + ']';

            range.deleteContents();

            if (spaceAfter) range.insertNode(document.createTextNode(spaceAfter[0]));
            range.insertNode(labelElement);
            if (spaceBefore) range.insertNode(document.createTextNode(spaceBefore[0]));

            selection.removeAllRanges();
            saveText();
        }
    }

    const replacePii = (label) => {
        const selection = window.getSelection();
        const selectionText = selection.toString();
        const selectionLength = selectionText.trim().length;

        const spaceBefore = selectionText.match(/^\s+/);
        const spaceAfter = selectionText.match(/\s+$/);
        if (selection && selectionLength > 0) {
            //if (selection['focusNode']['parentElement']['id'] !== 'messageContainerDiv') return;
            const range = selection.getRangeAt(0);

            const { internal, typeId } = label;
            if (messageContainer.current) {
                setEditHistory(prev => [...prev, messageContainer.current.innerHTML]);
            }

            const labelElement = document.createElement('label');
            labelElement.setAttribute('pii-type-id', typeId);
            if (selectionText.trim() && qaToolType === 'attachments') labelElement.setAttribute('pii-original-value', selectionText.trim());
            labelElement.innerText = '[' + internal + ']';

            range.deleteContents();

            if (spaceAfter) range.insertNode(document.createTextNode(spaceAfter[0]));
            range.insertNode(labelElement);
            if (spaceBefore) range.insertNode(document.createTextNode(spaceBefore[0]));

            selection.removeAllRanges();
            saveText();
        }
    }

    const undoLastAction = () => {
        const temp = editHistory[editHistory.length - (editHistory.length > 1 ? 2 : 1)];
        messageContainer.current.innerHTML = temp || '';
        if (editHistory.length > 1) setEditHistory(prev => [...prev.slice(0, prev.length - 1)]);
        saveText();
    }

    const deleteText = () => {
        const selection = window.getSelection();

        const selectionLength = selection.toString().length;
        if (selection && selectionLength > 0) {
            //if (selection['focusNode']['parentElement']['id'] !== 'messageContainerDiv') return;

            if (messageContainer.current) {
                setEditHistory(prev => [...prev, messageContainer.current.innerHTML]);
            }

            const range = selection.getRangeAt(0);
            range.deleteContents();
            selection.removeAllRanges();
            saveText();
        }
    }

    const customFunctions = { 'randomizeDate': randomizeDate };

    const onKeyPress = (e) => {
        if (e.ctrlKey && e.key.toString().toLowerCase() === 'q') undoLastAction(); // Not used ctrl+z, because it triggers additional fields...
        else if (e.key.toString().toLowerCase() === 'delete') deleteText();
        else {
            const label = Constants['piiLabels'].find(label => label.hotkey === e.key.toString().toLowerCase());
            if (label) {
                const onlyForEventTypes = label['onlyForEventTypes'];
                const onlyForUsers = label['onlyForUsers'];
                const disabled = (onlyForEventTypes && !(onlyForEventTypes || []).includes(messageLabels['eventType'])) || (onlyForUsers && !(onlyForUsers || []).includes(userId));
                if (disabled) return;

                const functionName = label['functionName'];
                const customFunction = customFunctions[functionName];
                if (customFunction) customFunction(label);
                else replacePii(label);
            }
        }
    }

    useEffect(() => {
        if (!Object.keys(params || {}).includes('qaToolType') && !openFromPopUp) return;
        if (isPopUpOpen) return;

        window.addEventListener('keydown', onKeyPress, true);
        return () => {
            try {
                window.removeEventListener('keydown', onKeyPress, true);
            } catch (e) { }
        }
    }, [editHistory, JSON.stringify(messageLabels), params, isPopUpOpen]);

    return <div id="piiLabels">
        {Constants['piiLabels'].map((label, index) => {
            const { internal, hotkey, onlyForEventTypes, onlyForUsers, functionName, description, typeId } = label;
            const disabled = (onlyForEventTypes && !(onlyForEventTypes || []).includes(messageLabels['eventType'])) || (onlyForUsers && !(onlyForUsers || []).includes(userId));
            if (disabled) return null;

            return <div key={'pii-label-' + index} className='button-container'>
                <button
                    className={(typeId === 18 ? 'margin-top' : '') + (disabled ? ' disabled' : '')}
                    disabled={disabled}
                    onClick={() => {
                        if (disabled) return;
                        const customFunction = customFunctions[functionName];

                        if (customFunction) customFunction(label);
                        else replacePii(label);
                    }}
                >
                    {internal} {hotkey ? <span className='hotkey'>{' [' + hotkey + ']'}</span> : ''}
                </button>

                {description !== undefined && <Tooltip
                    arrow
                    disableInteractive
                    TransitionProps={{ timeout: 100 }}
                    componentsProps={{ tooltip: { sx: { fontSize: '1em' } } }}
                    placement="right"
                    title={<div dangerouslySetInnerHTML={{ __html: description }} />}
                // title={description}
                >
                    <a className="description fas fa-info-circle" onClick={(e) => e.preventDefault()} />
                </Tooltip>}
            </div>
        })}

        <button
            id="undo"
            onClick={undoLastAction}
            disabled={editHistory.length === 1}
            className={'margin-top ' + (editHistory.length === 1 ? 'disabled' : '')}
        >
            Undo <span className='hotkey'>[ctrl+q]</span>
        </button>

        <button
            id="delete"
            onClick={deleteText}
        >
            Delete text <span className='hotkey'>[del]</span>
        </button>
    </div>
}

export default PiiLabels;