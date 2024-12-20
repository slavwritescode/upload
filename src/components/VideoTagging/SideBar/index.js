import React from 'react'
import { formatDateTime } from '../../../shared'
import './index.css';

const SideBar = ({ error, allUploadedVideos, handleVideoClick }) => {
    return (
        <div id="videosList">
            <h3>Recently uploaded</h3>
            {error || allUploadedVideos == null
                ? <p>An error occured when displaying the videos you have recently uploaded</p>
                : <ul className="allVideosList">
                    {allUploadedVideos ? Object.entries(allUploadedVideos)
                        .sort((a, b) => b[1].date - a[1].date)
                        .map(singleVideo => {
                            const keyIdentifier = singleVideo[0];
                            const data = singleVideo[1];

                            return <li key={keyIdentifier}><button onClick={() => handleVideoClick(keyIdentifier, data)}>
                                {formatDateTime(data.date)}

                            </button></li>
                        }) : <p id="uploadWarning">Nothing uploaded recently.</p>}

                </ul>}
        </div>
    )
}

export default SideBar