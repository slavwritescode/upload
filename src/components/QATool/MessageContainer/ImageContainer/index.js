import { useEffect, useState, useRef, useCallback } from 'react';
import { realtimeDb, auth, backend } from '../../../../firebase/config';
import { useSelector } from 'react-redux';

import './index.css';
import Constants from '../../../Constants';

const ImageContainer = ({ messageId, message, screenshotUrl, locked, setEditHistory, openFromPopUp }) => {
    const userInfo = useSelector((state) => state.userInfo.value || {});

    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const loadingRef = useRef(null);
    // const [highlightedBoxUrl, setHighlightedBoxUrl] = useState('');
    const [imgFrameWidth, setImgFrameWidth] = useState(userInfo['imgFrameWidth'] || 1);

    const [isPainting, setIsPainting] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const paint = useCallback(
        (event) => {
            if (isPainting) {
                const newMousePosition = getCoordinates(event);
                if (mousePosition && newMousePosition) {
                    selectRectangle(newMousePosition);
                    setMousePosition(newMousePosition);
                }
            }
        },
        [isPainting, mousePosition]
    );

    const getCoordinates = (event) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const scrollTop = canvas.parentElement.parentElement.parentElement.scrollTop - 20;
        const scrollLeft = canvas.parentElement.parentElement.scrollLeft;
        return { x: event.pageX - canvas.parentElement.offsetLeft - (openFromPopUp ? canvas.parentElement.parentElement.parentElement.offsetLeft : 0) + scrollLeft, y: event.pageY - canvas.parentElement.offsetTop + scrollTop };
    };

    const selectRectangle = (newMousePosition) => {
        if (!canvasRef.current) return;

        if (newMousePosition.x < 0) newMousePosition.x = 0;
        if (newMousePosition.y < 0) newMousePosition.y = 0;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.strokeStyle = 'red';
        context.lineJoin = 'round';
        context.lineWidth = 1;

        // Drwaing the bounding box
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.rect(startPosition.x, startPosition.y, newMousePosition.x - startPosition.x, newMousePosition.y - startPosition.y);
        context.closePath();
        context.stroke();

        // Filling the selected region
        let region = new Path2D();
        region.rect(startPosition.x, startPosition.y, newMousePosition.x - startPosition.x, newMousePosition.y - startPosition.y);
        region.closePath();
        context.fillStyle = "rgba(255, 255, 255, .1)";
        context.fill(region, "evenodd");

        // Filling the rest of the canvas
        let region1 = new Path2D();
        region1.rect(0, 0, canvas.width, startPosition.y < newMousePosition.y ? startPosition.y : newMousePosition.y);
        region1.closePath();
        context.fillStyle = "rgba(0, 0, 0, .1)";
        context.fill(region1, "evenodd");

        let region2 = new Path2D();
        region2.rect(0, startPosition.y < newMousePosition.y ? newMousePosition.y : startPosition.y, canvas.width, canvas.height);
        region2.closePath();
        context.fillStyle = "rgba(0, 0, 0, .1)";
        context.fill(region2, "evenodd");

        let region3 = new Path2D();
        region3.rect(0, startPosition.y, startPosition.x < newMousePosition.x ? startPosition.x : newMousePosition.x, newMousePosition.y - startPosition.y);
        region3.closePath();
        context.fillStyle = "rgba(0, 0, 0, .1)";
        context.fill(region3, "evenodd");

        let region4 = new Path2D();
        region4.rect(startPosition.x < newMousePosition.x ? newMousePosition.x : startPosition.x, startPosition.y, canvas.width, newMousePosition.y - startPosition.y);
        region4.closePath();
        context.fillStyle = "rgba(0, 0, 0, .1)";
        context.fill(region4, "evenodd");
    }

    const startPaint = useCallback((event) => {
        if (locked || message['status'] === 2) return;
        const coordinates = getCoordinates(event);
        if (coordinates) {
            setMousePosition(coordinates);
            setIsPainting(true);
            setStartPosition(coordinates);
        }
    }, [locked, message['status']]);

    const exitPaint = useCallback(() => {
        setIsPainting(false);
        //setMousePosition(undefined);
    }, []);

    useEffect(() => {
        if (JSON.stringify(startPosition) !== JSON.stringify(mousePosition)) {

            const canvas = canvasRef.current;
            if (!canvas) return;

            let imageObj = new Image();

            imageObj.onload = function () {

                const loading = loadingRef.current;
                if (loading) loading.style.display = 'flex';

                const tempCanvas = document.createElement('canvas');
                const context = tempCanvas.getContext('2d');

                const startPositionX = startPosition.x;
                const startPositionY = startPosition.y;
                const mousePositionX = mousePosition.x;
                const mousePositionY = mousePosition.y;
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;

                tempCanvas.width = ((mousePositionX - startPositionX) / canvasWidth) * imageObj.width;
                tempCanvas.height = ((mousePositionY - startPositionY) / canvasHeight) * imageObj.height;

                context.drawImage(imageObj,
                    startPositionX / canvasWidth * imageObj.width,
                    startPositionY / canvasHeight * imageObj.height,
                    ((mousePositionX - startPositionX) / canvasWidth) * imageObj.width,
                    ((mousePositionY - startPositionY) / canvasHeight) * imageObj.height,
                    0,
                    0,
                    ((mousePositionX - startPositionX) / canvasWidth) * imageObj.width,
                    ((mousePositionY - startPositionY) / canvasHeight) * imageObj.height,
                );

                const croppedImage = tempCanvas.toDataURL('image/png');
                // setHighlightedBoxUrl(croppedImage);

                realtimeDb.ref("/textMessageLabels/" + messageId + "/text").remove();

                backend('getTextFromImage', { image_url: croppedImage.split(',')[1] }).then((response) => {
                    // console.log(response);
                    const text = response['data'][0]['textAnnotations'][0]['description'].toString().trim();
                    realtimeDb.ref("/textMessageLabels/" + messageId + "/text").set(text);
                    setEditHistory(prev => [...prev, text]);
                    if (loading) loading.style.display = 'none';
                }).catch((error) => {
                    console.log(error);
                    if (loading) loading.style.display = 'none';
                });
            }
            imageObj.src = screenshotUrl;
        }
    }, [isPainting]);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.addEventListener('mousemove', paint);
        return () => canvas.removeEventListener('mousemove', paint);
    }, [paint, isPainting]);

    useEffect(() => {
        if (!imgRef.current) return;
        const resizeObserver = new ResizeObserver(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = imgRef.current.width; // + 50;
            canvas.height = imgRef.current.height; // + 50;

            const loading = loadingRef.current;
            if (loading) {
                loading.style.width = imgRef.current.width + 'px';
                loading.style.height = imgRef.current.height + 'px';
            } else {
                loading.style.display = 'none';
            }
        });
        resizeObserver.observe(imgRef.current);
        return () => resizeObserver.disconnect(); // clean up
    }, []);

    useEffect(() => {
        setImgFrameWidth(userInfo['imgFrameWidth'] || 1);
    }, [JSON.stringify(userInfo)]);

    return <div id="imageContainer">
        <div id="loadingCover" ref={loadingRef}>Loading...</div>
        <select
            id="zoomSelector"
            onChange={(e) => realtimeDb.ref("/users/" + auth.currentUser.uid + "/imgFrameWidth").set(parseInt(e.target.value))}
            defaultValue={imgFrameWidth}
        >
            {Object.keys(Constants['screenshotZoomValues']).map(zoomId => {
                zoomId = parseInt(zoomId);
                const zoomValue = Constants['screenshotZoomValues'][zoomId];
                return <option
                    key={'zoom-' + zoomId}
                    value={zoomId}
                >
                    Size: {zoomValue}
                </option>
            })}
        </select>
        <img
            ref={imgRef}
            id="screenshot"
            src={screenshotUrl}
            style={{ width: Constants['screenshotZoomValues'][imgFrameWidth] + 'em' }}
            onLoad={(e) => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                canvas.width = e.target.width; // + 50;
                canvas.height = e.target.height; // + 50;

                const loading = loadingRef.current;
                if (loading) {
                    loading.style.width = e.target.width + 'px';
                    loading.style.height = e.target.height + 'px';
                } else {
                    loading.style.display = 'none';
                }
            }}
        />
        <canvas
            ref={canvasRef}
            width="0"
            height="0"
            onMouseDown={startPaint}
            onMouseUp={exitPaint}
        />

        {/* Showing the snippet
        <img
            id="snippet"
            src={highlightedBoxUrl}
        />*/}
    </div>
}

export default ImageContainer;