'use client';
import { useState, useRef, useEffect } from 'react';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved photos from localStorage
    const savedPhotos = localStorage.getItem('photos');
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }

    // Request camera access
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Failed to access camera. Please allow camera permissions.');
      }
    }
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setPhoto(dataUrl);
        const newPhotos = [dataUrl, ...photos];
        setPhotos(newPhotos);
        localStorage.setItem('photos', JSON.stringify(newPhotos));
      }
    }
  };

  const deletePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    localStorage.setItem('photos', JSON.stringify(newPhotos));
    if (photo === photos[index]) {
      setPhoto(null);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '500px' }} />
      <br />
      <button onClick={takePhoto} style={{ margin: '10px', padding: '10px 20px' }}>
        Take Photo
      </button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {photo && (
        <div>
          <h2>Latest Photo</h2>
          <img src={photo} alt="Captured" style={{ width: '100%', maxWidth: '500px' }} />
        </div>
      )}
      <h2>Saved Photos</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {photos.map((p, index) => (
          <div key={index} style={{ position: 'relative' }}>
            <img src={p} alt={`Saved ${index}`} style={{ width: '150px' }} />
            <button
              onClick={() => deletePhoto(index)}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
                cursor: 'pointer',
              }}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}