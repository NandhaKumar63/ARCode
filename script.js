document.addEventListener('DOMContentLoaded', () => {
    const video = document.createElement('video');
    const canvas = document.getElementById('qr-canvas');
    const context = canvas.getContext('2d');
    const box = document.getElementById('box');
    const videoContainer = document.getElementById('video-container');

    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                video.srcObject = stream;
                video.setAttribute('playsinline', true);
                video.play();

                requestAnimationFrame(tick);
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
            });
    }

    function tick() {
        console.log('tick')
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                console.log('QR Code detected:', code.data);

                // Display YouTube video if QR code contains a valid YouTube video URL
                const videoUrl = code.data;
                if (videoUrl.startsWith('https://www.youtube.com/watch?v=')) {
                    box.style.display = 'none'; // Hide the box
                    videoContainer.style.display = 'block'; // Show the video container
                    const videoId = new URL(videoUrl).searchParams.get('v');
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    iframe.width = '100%';
                    iframe.height = '100%';
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    iframe.allowFullscreen = true;

                    // Clear previous video
                    videoContainer.innerHTML = '';
                    videoContainer.appendChild(iframe);
                } else {
                    box.style.display = 'none'; // Hide the box
                    videoContainer.style.display = 'none'; // Hide the video container
                }
            } else {
                box.style.display = 'none'; // Hide the box
                videoContainer.style.display = 'none'; // Hide the video container
            }

            requestAnimationFrame(tick);
        }
    }

    startCamera();
});
