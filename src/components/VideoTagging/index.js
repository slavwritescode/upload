import { useEffect, useState } from "react";
import { realtimeDb, storage } from "../../firebase/config";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import VideoPreview from "./VideoPreview";
import { formatDateTime } from "../../shared";
import { uploadBytesResumable, ref } from "firebase/storage";
import { updateUserInfo } from "../../Redux/Features/userInfo";

import './index.css';

const VideoTagging = () => {
    const location = useLocation();
    const { uid } = location.state || {};

    const [allUploadedVideos, setAllUploadedVideos] = useState(null);
    const [error, setError] = useState();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.userInfo.value) || {};
    const userId = userInfo['userId'];

    const [selectedVideo, setSelectedVideo] = useState(null);

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        if (file && file.type === 'video/quicktime') {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        let videoId;
        try {
            const videoIdRunningNumber = await realtimeDb.ref('/lastVideoId').transaction((currentValue) => {
                return currentValue === null ? 1 : currentValue + 1;
            });
            if (videoIdRunningNumber.committed) {
                videoId = videoIdRunningNumber.snapshot.val();
            }
        } catch (error) {

        }

        const storageRef = ref(storage, `videos/${videoId}.mov`);
        const uploadTask = uploadBytesResumable(storageRef, file, {
            contentType: file.type,
        });

        // Track upload progress
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);

            },
            (error) => {
                // Handle upload errors
                console.error("Upload failed:", error.message);
            },
            async () => {
                try {
                    await realtimeDb.ref(`/videos/${userId}/${videoId}`).set({ 'date': Date.now(), 'labels': {} });
                } catch (error) {
                    console.log("Error uploading file to database:", error.message);
                }

            }
        );
    };

    // Handler for when a video item is clicked
    const handleVideoClick = (keyIdentifier, data) => {

        setSelectedVideo(keyIdentifier);
    };

    useEffect(() => {
        const getAllVideos = async () => {

            let videosRef = realtimeDb.ref(`/videos/${userId}`);
            try {
                videosRef.on('value', data => {
                    const videoData = data.val() || null;
                    setAllUploadedVideos(videoData);
                });
            } catch (error) {
                setError(error.message);
            }
        }
        getAllVideos();
    }, [userId]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userSnapshot = await realtimeDb.ref(`/users/${uid}`).once('value');
                const userData = userSnapshot.val();
                let temp = {};
                temp['userId'] = userData.userId;

                if (userData) {
                    dispatch((updateUserInfo(temp)));
                }
            } catch (error) {
                console.error("Error fetching user data:", error.message);
            }
        };

        fetchUserId();
    }, [])

    useEffect(() => {
        console.log('running selected video', selectedVideo)
    }, [selectedVideo])

    return (
        <div id="videoTaggingPage">
            {/**have a list for all previous uploaded videos */}
            <div id="videosList">
                <h3>Recently uploaded</h3>
                {error || allUploadedVideos == null
                    ? <p>An error occured when displaying the videos you have recently uploaded</p>
                    : <ul className="allVideosList">
                        {allUploadedVideos ? Object.entries(allUploadedVideos)
                            .sort((a, b) => {

                                return b[1].date - a[1].date
                            })
                            .map(singleVideo => {
                                const keyIdentifier = singleVideo[0];
                                const data = singleVideo[1];

                                return <li key={keyIdentifier}><button onClick={() => handleVideoClick(keyIdentifier, data)}>
                                    {formatDateTime(data.date)}

                                </button></li>
                            }) : <p id="uploadWarning">Nothing uploaded recently.</p>}

                    </ul>}
            </div>
            <div className="container">
                {selectedVideo && (
                    <VideoPreview
                        videoUrl={"/videos/" + selectedVideo + '.mov'}
                        keyIdentifier={selectedVideo} />
                )}

                <div id="uploadForm">

                    <h2>Upload File</h2>

                    {previewUrl && (
                        <div>
                            <video
                                width={'100%'}
                                controls
                                src={previewUrl}
                                style={{ display: 'block', margin: '3em 0' }}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}

                    {progress > 0 && (
                        <div className="progressBar">
                            <p>Progress: {progress.toFixed(2)}%</p>
                            <progress value={progress} max="100"></progress>
                        </div>
                    )}

                    <div className="uploadControls">
                        <input type="file" onChange={handleFileChange} />
                        <button onClick={handleUpload} disabled={!file}>
                            Upload File
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default VideoTagging;