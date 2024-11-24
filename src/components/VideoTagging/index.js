import { useEffect, useState } from "react";
import { realtimeDb, storage } from "../../firebase/config";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import VideoPreview from "./VideoPreview";
import { formatDateTime } from "../../shared";
import { uploadBytesResumable, ref } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";

import './index.css';
import { set } from "date-fns";

const VideoTagging = () => {
    const location = useLocation();
    const { uid } = location.state || {};
    const [allUploadedVideos, setAllUploadedVideos] = useState(null);
    const [error, setError] = useState();
    //const userInfo = useSelector((state) => state.userInfo.value) || {};
    //const userId = userInfo['userId'];

    const [selectedVideo, setSelectedVideo] = useState(null);

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        if (file && file.type === 'video/quicktime') {
            console.log('test')
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
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                // Handle upload errors
                console.error("Upload failed:", error.message);
            },
            async () => {

                // const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                // setDownloadURL(downloadURL);
                // alert("File uploaded successfully!");
                try {
                    await realtimeDb.ref(`/videos/${uid}/${videoId}`).set({ 'date': formatDateTime(Date.now()), 'labels': {} });
                } catch (error) {
                    console.log("Error uploading file to database:", error.message);
                }

            }
        );
    };

    // Handler for when a video item is clicked
    const handleVideoClick = (video) => {
        setSelectedVideo(video);
    };

    // useEffect(() => {
    //     const listAllVidoes = async () => {
    //         ('running...')
    //         let videosRef = realtimeDb.ref(`/videos/${userId}`);
    //         //it is going to be equal to whatever the id

    //         try {
    //             // mainQuery = mainQuery.orderByChild('moderator').equalTo(userId);
    //             // mainQuery.on('value', (data) => {
    //             //   const videoData = data.val() || null;
    //             //   setAllUploadedVideos(videoData);
    //             // })
    //             videosRef.on('value', data => {
    //                 const videoData = data.val() || null;
    //                 setAllUploadedVideos(videoData);
    //             });
    //         } catch (error) {
    //             setError(error.message);
    //         }
    //         // const videos = await realtimeDb.ref('/')
    //     }
    //     if (userId) {
    //         listAllVidoes();
    //     }
    // }, [userId])

    useEffect(() => {
        const getAllVideos = async () => {
            let videosRef = realtimeDb.ref(`/videos/${uid}`);
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
    }, []);

    return (
        <div id="videoTaggingPage">
            {/**have a list for all previous uploaded videos */}
            <div id="videoContainer">
                <h3>All recently uploaded videos</h3>
                {error
                    ? <p>An error occured when displaying the videos you have recently uploaded</p>
                    : <ul className="allVideosList">
                        {allUploadedVideos ? Object.entries(allUploadedVideos)
                            .sort((a, b) => {

                                return b[1].date - a[1].date
                            })
                            .map(singleVideo => {
                                console.log(singleVideo, 'is single video')
                                const keyIdentifier = singleVideo[0];
                                const data = singleVideo[1];
                                console.log("/videos/" + singleVideo[0] + '.mov', 'is the url');
                                return <li key={keyIdentifier} onClick={() => handleVideoClick({ keyIdentifier, data })}>
                                    <span>Date:</span> {formatDateTime(data.date)} <span>Moderator:</span> {uid}
                                    <VideoPreview
                                        videoUrl={"/videos/" + singleVideo[0] + '.mov'}
                                        keyIdentifier={keyIdentifier}
                                    />
                                </li>
                            }) : <p>{"It appears you haven't uploaded recently. "}</p>}

                    </ul>}
            </div>
            {selectedVideo && (
                <div id="videoContainerDetailed">
                    <h3>Details for Selected Video</h3>
                    <div>
                        <strong>Date:</strong> {formatDateTime(selectedVideo.data.date)}
                    </div>
                    <div>
                        <strong>Moderator:</strong> {uid}
                    </div>
                    <div>
                        <strong>Video URL:</strong>
                        <a href={`/videos/${selectedVideo.keyIdentifier}.mov`} target="_blank" rel="noopener noreferrer">
                            View Video
                        </a>
                    </div>
                </div>
            )}
            <div id="taggingControls">
                {/* <VideoPreview videoUrl={ } keyIdentifier={ } /> */}
            </div>
            <div id="uploadForm">

                <h2>Upload File and Review it</h2>

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
                    <div>
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
    )
}

export default VideoTagging;