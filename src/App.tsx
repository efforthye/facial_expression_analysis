import React, { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import '@tensorflow/tfjs-backend-webgl';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const expressionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        console.log('Loading models...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log('Models loaded successfully');
      } catch (error) {
        console.error('Error loading models: ', error);
        throw error;
      }
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
            };
            console.log('Video started');
          }
        })
        .catch(err => console.error('Error accessing webcam: ', err));
    };

    const handleVideoPlay = () => {
      const intervalId = setInterval(async () => {
        if (videoRef.current && canvasRef.current) {
          const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          const context = canvasRef.current.getContext('2d');
          if (context) {
            context.clearRect(0, 0, displaySize.width, displaySize.height);
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
          }

          if (expressionsRef.current && detections.length > 0) {
            const { expressions }: any = detections[0];
            const maxExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
            expressionsRef.current.innerText = `Expression: ${maxExpression}`;
          }
        }
      }, 1000); // 1초마다 분석

      return () => clearInterval(intervalId);
    };

    const initializeApp = async () => {
      await loadModels();
      startVideo();
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.addEventListener('play', handleVideoPlay);
      }
    };

    initializeApp();

    return () => {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.removeEventListener('play', handleVideoPlay);
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ position: 'relative' }}>
        <video ref={videoRef} autoPlay muted width="720" height="560" style={{ position: 'absolute' }} />
        <canvas ref={canvasRef} width="720" height="560" style={{ position: 'absolute' }} />
        <div ref={expressionsRef} style={{ position: 'absolute', top: 10, left: 10, color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px' }} />
      </div>
    </div>
  );
};

export default App;
