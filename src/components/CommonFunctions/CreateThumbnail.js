export default (file, callback) => {
    let reader = new FileReader();
    reader.onload = (event) => {
        let image = new Image();
        image.onload = () => {
            let canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const thumbnailSize = 500;

            // Calculate the aspect ratio of the image
            const aspectRatio = image.width / image.height;

            // Calculate the dimensions of the thumbnail
            let thumbnailWidth, thumbnailHeight;
            if (aspectRatio > 1) {
                thumbnailWidth = thumbnailSize;
                thumbnailHeight = thumbnailSize / aspectRatio;
            } else {
                thumbnailWidth = thumbnailSize * aspectRatio;
                thumbnailHeight = thumbnailSize;
            }

            // Set the canvas dimensions to the thumbnail size
            canvas.width = thumbnailWidth;
            canvas.height = thumbnailHeight;

            // Draw the image onto the canvas
            ctx.drawImage(image, 0, 0, thumbnailWidth, thumbnailHeight);

            // Convert the canvas to a data URL
            const thumbnailDataUrl = canvas.toDataURL('image/jpeg');

            // Invoke the callback with the thumbnail data URL
            callback(thumbnailDataUrl);

            // Free the memory by setting canvas and image to null
            canvas = null;
            image = null;
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);

    // Free the memory by setting the reader to null
    reader = null;
};