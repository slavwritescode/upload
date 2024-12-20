import { useState } from 'react'
import { formatDateTimeToHumanReadableString } from '../../../shared'
import './index.css';

const SideBar = ({ error, allUploadedVideos, handleVideoClick }) => {
    //you have to filter based on the dropdown
    const [filterByThisDate, setFilterByThisDate] = useState('');

    const handleDateChange = (e) => {
        setFilterByThisDate(e.target.value);
    }

    if (!allUploadedVideos) {
        return <div>Loading videos list...</div>
    }

    const filteredVideos = Object.entries(allUploadedVideos).filter(video => {
        if (filterByThisDate === 'today') {
            return video.date === Date.now();
        } else {
            return video;
        }
    })


    return (
        <div id="videosList">
            <div className="uploadedWhen">Uploaded
                <div>
                    <select
                        value={filterByThisDate}
                        onChange={handleDateChange}>
                        <option value="today">Today</option>
                        <option value="last three days">In the last three days</option>
                    </select>
                </div>
            </div>
            {error || filteredVideos == null
                ? <p>An error occured when displaying the videos you have recently uploaded</p>
                : <ul className="allVideosList">
                    {filteredVideos ? Object.entries(filteredVideos)
                        .sort((a, b) => b[1].date - a[1].date)
                        .map(singleVideo => {
                            const keyIdentifier = singleVideo[0];
                            const data = singleVideo[1];

                            return <li key={keyIdentifier}><button onClick={() => handleVideoClick(keyIdentifier, data)}>
                                {formatDateTimeToHumanReadableString(data.date)}

                            </button></li>
                        }) : <p id="uploadWarning">Nothing uploaded recently.</p>}

                </ul>}
        </div>
    )
}

export default SideBar