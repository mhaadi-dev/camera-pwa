"use client";

import { useState, useRef, useEffect } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ url: string; coords: { lat: number; lng: number } }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load saved photos from localStorage
    const saved = localStorage.getItem("photos");
    if (saved) {
      setPhotos(JSON.parse(saved));
    }

    // Set up geolocation tracking
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to retrieve location. Please enable location permissions.");
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000,
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }

    // Set up camera stream
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setError("Allow camera permissions."));

    // Cleanup on unmount
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !coords) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    const dataUrl = canvasRef.current.toDataURL("image/png");
    const newPhoto = { url: dataUrl, coords };
    const newList = [newPhoto, ...photos];
    setPhoto(dataUrl);
    setPhotos(newList);
    localStorage.setItem("photos", JSON.stringify(newList));

    if (Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    if (Notification.permission === "granted") {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification("Photo Saved", {
        body: "Photo has been saved in local storage.",
        icon: "/icons/icon-192x192.png",
      });
    }
  };

  const deletePhoto = (i: number) => {
    const updated = photos.filter((_, idx) => idx !== i);
    setPhotos(updated);
    localStorage.setItem("photos", JSON.stringify(updated));
    if (photo === photos[i]?.url) setPhoto(null);
  };

  return (
    <div className="camera-container">
      {error && <p className="error-text">{error}</p>}

      {coords && (
        <p className="coords-text">
          <b>Current Location:</b> Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
        </p>
      )}

      <video ref={videoRef} autoPlay className="video-feed" />

      <button onClick={takePhoto} className="take-photo-btn">
        Take Photo
      </button>

      <canvas ref={canvasRef} className="hidden-canvas" />

      {photo && (
        <>
          <h2 className="latest-photo-heading">Latest Photo</h2>
          <img src={photo} alt="Captured" className="latest-photo-img" />
        </>
      )}

      {photos.length > 0 && (
        <>
          <h2 className="saved-photos-heading">Saved Photos</h2>
          <div className="photos-grid">
            {photos.map((p, i) => (
              <div key={i} className="photo-item">
                <img src={p.url} alt={`Saved ${i}`} className="photo-img" />
             
                <button className="delete-photo-btn" onClick={() => deletePhoto(i)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}