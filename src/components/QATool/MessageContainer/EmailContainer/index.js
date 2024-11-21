import { useEffect, useState } from 'react';
import { getFileBlob } from '../../../../firebase/config';

import './index.css';

let currentlySelectedThreadId = '';
const EmailContainer = ({ messageId, qaToolType }) => {

    const [htmlRawText, setHtmlRawText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const updateMessageView = async () => {
            const path = qaToolType === 'emails' ? '/emails/' + messageId + '/raw.html' : '/attachmentEmails/' + messageId + '/raw.html';
            let fileBblob = await getFileBlob(path);
            if (fileBblob) {
                let reader = new FileReader();
                reader.onload = () => {
                    if (currentlySelectedThreadId === messageId) {
                        setHtmlRawText(reader.result);
                        setIsLoading(false);
                    }
                }
                reader.readAsText(fileBblob);
            }
        }

        currentlySelectedThreadId = messageId;
        updateMessageView();

        return () => setHtmlRawText('');
    }, [messageId, qaToolType]);

    return <>
        {!isLoading && <div
            id="emailContainer"
            style={{ display: htmlRawText ? 'block' : 'none' }}
            dangerouslySetInnerHTML={{ __html: htmlRawText }}
        />}
        {isLoading && <div id="loading"><span>Loading...</span></div>}
    </>
}

export default EmailContainer;