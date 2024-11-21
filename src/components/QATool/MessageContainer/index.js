import React, { useEffect, useState } from 'react';
import { realtimeDb, getFileBlob } from '../../../firebase/config';
import Swal from 'sweetalert2';

import './index.css';
import Constants from '../../Constants';
import Labels from './Labels';
import TextContainer from './TextContainer';
import ImageContainer from './ImageContainer';
import EmailContainer from './EmailContainer';
import AttachmentContainer from './AttachmentContainer';
import Editor from './Editor';

const MessageContainer = ({ messageId, setShowLog, qaToolType, validate, openFromPopUp }) => {

    const [editHistory, setEditHistory] = useState([]);
    const [editor, setEditor] = useState('');
    const [message, setMessage] = useState({});
    const [messageLabels, setMessageLabels] = useState({});
    const [locale, setLocale] = useState('');
    const [states, setStates] = useState({});
    const [screenshotPath, setScreenshotPath] = useState('');
    const [screenshotUrl, setScreenshotUrl] = useState('');
    const [attachmentPath, setAttachmentPath] = useState('');
    const [unlocked, setUnlocked] = useState(false);
    const [attachmentView, setAttachmentView] = useState(2); // 1 = Email, 2 = Attachment, 3 = Redacted attachment
    const [shouldBeBackup, setShouldBeBackup] = useState(false);
    const [deliveryTarget, setDeliveryTarget] = useState({});
    let locked = [4, 5, 6].includes(message['status'] || 'NA');
    if (unlocked) locked = false;

    const getScreenshotUrl = async () => {
        setScreenshotUrl('');
        try {
            const screenshotBlob = await getFileBlob(screenshotPath);
            const screenshotUrl = URL.createObjectURL(screenshotBlob);
            setScreenshotUrl(screenshotUrl);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (Object.keys(message).length === 0 || qaToolType !== 'textMessages') {
            setScreenshotPath('');
            return;
        }
        const fileExtension = Constants['fileExtensions'][message['ext']] || message['ext'];
        const filePath = 'textMessages/' + message['participantId'] + '/' + messageId + '.' + fileExtension;
        setScreenshotPath(filePath);

    }, [messageId, JSON.stringify(message), qaToolType]);

    useEffect(() => {
        if (Object.keys(message).length === 0 || qaToolType !== 'attachments' || attachmentView === 1) {
            setAttachmentPath('');
            return;
        }
        const fileExtension = Constants['fileExtensions'][message['ext']] || message['ext'];
        const fileName = attachmentView === 2 ? 'raw' : 'redacted';
        const filePath = 'attachments/' + messageId + '/' + fileName + '.' + fileExtension;
        setAttachmentPath(filePath);

    }, [messageId, JSON.stringify(message), qaToolType, attachmentView]);



    useEffect(() => {
        if (screenshotPath) getScreenshotUrl();
    }, [screenshotPath]);

    useEffect(() => {
        const listener = realtimeDb.ref('/deliveryTarget').on('value', res => setDeliveryTarget(res.val() || {}));
        return () => realtimeDb.ref('/deliveryTarget').off('value', listener);
    }, []);

    useEffect(() => {
        const root = Constants['qaToolTypes'][qaToolType]['root'];
        const root2 = Constants['qaToolTypes'][qaToolType]['rootLabels'];

        const messagesComponent = document.getElementById('messages');
        if (messagesComponent) messagesComponent.scrollTo(0, 0);
        setEditHistory([]);

        if (!messageId && !openFromPopUp) {
            document.getElementById('navbarTitle').innerText = Constants['qaToolTypes'][qaToolType]['navbarName'];
            return;
        }

        setAttachmentView(2);

        const listener1 = realtimeDb.ref(root + '/' + messageId).on('value', res => {
            const temp = res.val() || {};
            setMessage(temp);

            if (!openFromPopUp) {
                const navbarTitle = document.getElementById('navbarTitle');
                navbarTitle.innerText = Constants['qaToolTypes'][qaToolType]['navbarName'] + " / PPT: " + (temp['participantId'] || 'N/A') + " / ID: ";

                let messageIdButton = document.createElement('button');
                messageIdButton.className = "copy-message-id";
                messageIdButton.title = "Copy message ID";
                messageIdButton.innerText = messageId;
                messageIdButton.onclick = () => {
                    navigator.clipboard.writeText(messageId);
                    Swal.fire({
                        toast: true,
                        icon: 'success',
                        title: 'Copied: ' + messageId,
                        position: 'bottom',
                        width: 'unset',
                        showConfirmButton: false,
                        timer: 2000
                    })
                }
                navbarTitle.appendChild(messageIdButton);
            }
        });

        const listener2 = realtimeDb.ref(root2 + '/' + messageId).on('value', res => setMessageLabels(res.val() || {}));

        return () => {
            realtimeDb.ref(root + '/' + messageId).off('value', listener1);
            realtimeDb.ref(root2 + '/' + messageId).off('value', listener2);
            setMessage({});
            setMessageLabels({});
            setStates({});
        }
    }, [messageId, qaToolType]);

    const getStates = async (tempParticipantId) => {
        if (!tempParticipantId) {
            setLocale('');
            setStates({});
            return;
        }

        const countryOfResidence = await realtimeDb.ref('/participants/' + tempParticipantId + '/countryOfResidence').once('value').then(res => res.val());

        if (countryOfResidence) {
            const countryOfResidenceShortCode = Constants['countryShortCodes'][countryOfResidence];
            setLocale(countryOfResidenceShortCode);
            setStates(Constants['states'][countryOfResidenceShortCode] || {});
        } else {
            setLocale('');
            setStates({});
            return;
        }
    }

    useEffect(() => {
        getStates(message['participantId']);
    }, [JSON.stringify(message['participantId'])]);

    return messageId && <div id="mainMessageContainer" tabIndex="0">
        <Labels
            messageId={messageId}
            message={message}
            locked={locked}
            setShowLog={setShowLog}
            unlocked={unlocked}
            setUnlocked={setUnlocked}
            messageLabels={messageLabels}
            qaToolType={qaToolType}
            validate={validate}
            shouldBeBackup={shouldBeBackup}
            locale={locale}
        />

        {(screenshotUrl || qaToolType === 'emails' || qaToolType === 'attachments') && <TextContainer
            messageId={messageId}
            message={message}
            messageLabels={messageLabels}
            locked={locked}
            editHistory={editHistory}
            setEditHistory={setEditHistory}
            locale={locale}
            states={states}
            qaToolType={qaToolType}
            editor={editor}
            setEditor={setEditor}
            attachmentView={attachmentView}
            setAttachmentView={setAttachmentView}
            setShouldBeBackup={setShouldBeBackup}
            openFromPopUp={openFromPopUp}
            deliveryTarget={deliveryTarget}
        />}

        {screenshotUrl && qaToolType === 'textMessages' && <ImageContainer
            messageId={messageId}
            message={message}
            screenshotUrl={screenshotUrl}
            locked={locked}
            setEditHistory={setEditHistory}
            openFromPopUp={openFromPopUp}
        />}

        {((qaToolType === 'emails') || (qaToolType === 'attachments' && attachmentView === 1)) && <EmailContainer
            messageId={qaToolType === 'emails' ? messageId : message['emailId']}
            qaToolType={qaToolType}
        />}

        {qaToolType === 'attachments' && attachmentView !== 1 && <AttachmentContainer
            attachmentPath={attachmentPath}
        />}

        {editor && <Editor
            editor={editor}
            setEditor={setEditor}
            messageId={messageId}
            messageLabels={messageLabels}
            editHistory={editHistory}
            setEditHistory={setEditHistory}
            qaToolType={qaToolType}
            locked={locked}
            openFromPopUp={openFromPopUp}
        />}
    </div>
}

export default MessageContainer;