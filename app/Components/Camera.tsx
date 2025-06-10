'use client';
import { useState, useRef, useEffect } from 'react';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('photos');
    if (saved) setPhotos(JSON.parse(saved));

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setError('Allow camera permissions.'));
  }, []);

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    const dataUrl = canvasRef.current.toDataURL('image/png');
    const newList = [dataUrl, ...photos];
    setPhoto(dataUrl);
    setPhotos(newList);
    localStorage.setItem('photos', JSON.stringify(newList));

    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification('Photo Saved!', {
        body: 'Your photo was saved successfully in local storage!',
        icon: '/icons/icon-192x192.png',
      });
    }
  };

  const deletePhoto = (i: number) => {
    const updated = photos.filter((_, idx) => idx !== i);
    setPhotos(updated);
    localStorage.setItem('photos', JSON.stringify(updated));
    if (photo === photos[i]) setPhoto(null);
  };

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: 500 }} />
      <button onClick={takePhoto} style={{ margin: 10, padding: 10 }}>
        Take Photo
      </button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {photo && (
        <>
          <h2>Latest Photo</h2>
          <img src={photo} alt="Captured" style={{ width: '100%', maxWidth: 500 }} />
        </>
      )}
      <h2>Saved Photos</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {photos.map((p, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img src={p} alt={`Saved ${i}`} style={{ width: 150 }} />
            <button
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 25,
                height: 25,
                cursor: 'pointer',
              }}
              onClick={() => deletePhoto(i)}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
