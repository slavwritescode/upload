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


    for (const [key, value] of Object.entries(allUploadedVideos)) {
        console.log(`${key}: ${value}`);
        console.log(JSON.stringify(value));
    }

    const filteredVideos = Object.entries(allUploadedVideos).filter(video => {

        const dateOfTheVideo = video[1]['date'];
        const now = Date.now();
        const todayStart = new Date().setHours(0, 0, 0, 0);

        if (filterByThisDate === 'today') {

            return dateOfTheVideo >= todayStart && dateOfTheVideo < now;
        } else if (filterByThisDate === 'last three days') {

            const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
            return dateOfTheVideo >= threeDaysAgo && dateOfTheVideo < now;

        } else {
            return true;
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
                    {filteredVideos ? filteredVideos
                        .sort((a, b) => b[1].date - a[1].date)
                        .map(singleVideo => {
                            const keyIdentifier = singleVideo[0];
                            const data = singleVideo[1];
                            console.log(data, 'is data');

                            return <li key={keyIdentifier}><button onClick={() => handleVideoClick(keyIdentifier, data)}>
                                {formatDateTimeToHumanReadableString(data.date)}

                            </button></li>
                        }) : <p id="uploadWarning">Nothing uploaded recently.</p>}

                </ul>}
        </div>
    )
}

export default SideBar