import React, { useEffect, useState, useRef } from 'react';
import { getFileBlob, getFileUrl } from '../../../../firebase/config';

import './index.css';

const AttachmentContainer = ({ attachmentPath }) => {
    const [attachmentUrl, setAttachmentUrl] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getAttachmentUrl = async () => {
            setAttachmentUrl('');
            try {
                const temp = await getFileUrl(attachmentPath);
                setAttachmentUrl(temp);
            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        }
        if (attachmentPath) getAttachmentUrl();

        return () => setAttachmentUrl('');
    }, [attachmentPath]);

    return <>
        {!isLoading && <iframe id="attachmentContainer" src={attachmentUrl} />}
        {isLoading && <div id="loading"><span>Loading...</span></div>}
    </>;
}

export default AttachmentContainer;