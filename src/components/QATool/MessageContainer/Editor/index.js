import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { getFileBlob } from '../../../.././firebase/config';

import './index.css';
import Constants from '../../../Constants';
import PiiLabels from '../PiiLabels';

const Editor = ({ editor, setEditor, messageId, messageLabels, editHistory, setEditHistory, qaToolType, locked, openFromPopUp }) => {

    const messageContainer = useRef(null);
    const [firstRender, setFirstRender] = useState(true);

    const updateMessageView = async () => {
        try {
            let fileBblob = await getFileBlob('/emails/' + messageId + '/body.html');
            if (fileBblob) {
                let reader = new FileReader();
                reader.onload = () => messageContainer.current.innerHTML = reader.result;
                reader.readAsText(fileBblob);
            }
        } catch (error) {
            messageContainer.current.innerHTML = '';
            //console.error(error);
        }
    }

    useEffect(() => {
        if (!messageContainer.current) return;

        if (editor === 'subject') {
            const html = messageLabels[editor] || '';

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

            if (firstRender) {
                setEditHistory([tempHtml]);
                setFirstRender(false);
            }
        } else {
            if (firstRender) {
                updateMessageView();
                const lastHtml = document.getElementById('messageContainerDiv').innerHTML;
                setEditHistory([lastHtml]);
                setFirstRender(false);
            }
        }
    }, [JSON.stringify(messageLabels[editor])]);

    useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) setEditor(""); };
        window.addEventListener('keydown', handleEsc);
        return () => { window.removeEventListener('keydown', handleEsc) };
    }, []);

    return ReactDOM.createPortal((
        <div id="editor" onClick={(e) => { if (e.target.id === "editor") setEditor("") }}>
            <div id="editorMainContainer">
                <div id="header">
                    <span>
                        {(editor === 'subject' ? 'Subject' : 'Body') + ' editor [' + messageId + ']'}
                    </span>
                </div>
                <div id="content">

                    {!locked && <PiiLabels
                        messageId={messageId}
                        messageLabels={messageLabels}
                        messageContainer={messageContainer}
                        editHistory={editHistory}
                        setEditHistory={setEditHistory}
                        qaToolType={qaToolType}
                        editor={editor}
                        openFromPopUp={openFromPopUp}
                    />}

                    <div
                        id="messageContainerDiv"
                        ref={messageContainer}
                    />
                </div>
            </div>
        </div >
    ), document.body);
}

export default Editor;