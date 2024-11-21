import { useEffect, useState } from "react";
import { realtimeDb } from "../../firebase/config";
import { useSelector } from "react-redux";
import VideoPreview from "./VideoPreview";
import { formatDateTime } from "../../shared";
import { uploadBytesResumable, ref } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/config";
import './index.css';

const VideoTagging = () => {
    const [allUploadedVideos, setAllUploadedVideos] = useState(null);
    const [error, setError] = useState();
    const userInfo = useSelector((state) => state.userInfo.value) || {};
    const userId = userInfo['userId'];

    const [selectedVideo, setSelectedVideo] = useState(null);


    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [downloadURL, setDownloadURL] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        // const storageRef = ref(storage, `uploads/${file.name}`); // Define the storage path
        const storageRef = ref(storage, `videos/${file.name}`);
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
                // Handle successful upload
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setDownloadURL(downloadURL);
                alert("File uploaded successfully!");
                console.log("File available at:", downloadURL);
            }
        );
    };

    // Handler for when a video item is clicked
    const handleVideoClick = (video) => {
        setSelectedVideo(video);
    };

    useEffect(() => {
        const listAllVidoes = async () => {
            ('running...')
            let videosRef = realtimeDb.ref(`/videos/${userId}`);
            //it is going to be equal to whatever the id

            try {
                // mainQuery = mainQuery.orderByChild('moderator').equalTo(userId);
                // mainQuery.on('value', (data) => {
                //   const videoData = data.val() || null;
                //   setAllUploadedVideos(videoData);
                // })
                videosRef.on('value', data => {
                    const videoData = data.val() || null;
                    setAllUploadedVideos(videoData);
                });
            } catch (error) {
                setError(error.message);
            }
            // const videos = await realtimeDb.ref('/')
        }
        if (userId) {
            listAllVidoes();
        }
    }, [userId])
    return (
        <div id="videoTaggingPage">
            {/**have a list for all previous uploaded videos */}
            {/* <div id="videoContainer">
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
                                    <span>Date:</span> {formatDateTime(data.date)} <span>Moderator:</span> {userId}
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
                        <strong>Moderator:</strong> {userId}
                    </div>
                    <div>
                        <strong>Video URL:</strong>
                        <a href={`/videos/${selectedVideo.keyIdentifier}.mov`} target="_blank" rel="noopener noreferrer">
                            View Video
                        </a>
                    </div>
                </div>
            )} */}
            <div id="uploadForm">
                <h2>Upload File and Tag it</h2>
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUpload} disabled={!file}>
                    Upload File
                </button>
                {progress > 0 && (
                    <div>
                        <p>Progress: {progress.toFixed(2)}%</p>
                        <progress value={progress} max="100"></progress>
                    </div>
                )}
                {downloadURL && (
                    <div>
                        <p>File uploaded! Access it here:</p>
                        <a href={downloadURL} target="_blank" rel="noopener noreferrer">
                            {downloadURL}
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VideoTagging;