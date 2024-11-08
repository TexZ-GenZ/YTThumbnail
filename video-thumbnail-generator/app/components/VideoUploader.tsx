"use client";

import React, { useState, useEffect } from 'react';

const VideoUploader: React.FC = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0); // Track upload progress
  const [backendProgress, setBackendProgress] = useState<number>(0); // Track backend progress
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files.length > 0) {
    const selectedVideo = event.target.files[0];
    console.log(`File size: ${(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB`);

    if (selectedVideo.size > 104857600) { // 100 MB limit
      alert('The file size exceeds 100 MB and cannot be uploaded.');
      setVideo(null);
    } else {
      setVideo(selectedVideo);
      setProgress(0); // Reset progress to 0 when a new file is selected
    }
  } else {
    console.error('No file selected');
    setVideo(null);
  }
};
  
const generateThumbnail = async () => {
  if (video) {
    const formData = new FormData();
    formData.append('video', video);
    setLoading(true);
    setProgress(0);  // Reset upload progress
    setBackendProgress(0);  // Reset processing progress

    // WebSocket connection to handle both upload and processing progress
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Check if it's an upload progress message
      if (data.uploadProgress !== undefined) {
        setProgress(data.uploadProgress);  // Update upload progress bar
      }

      // Check if it's a processing progress message
      if (data.progress !== undefined) {
        setBackendProgress(data.progress);  // Update processing progress bar
      }
    };

    try {
      // Use fetch to upload video without progress tracking; WebSocket will handle progress
      const response = await fetch('http://localhost:3001/api/thumbnail', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) throw new Error('ReadableStream not supported in this browser.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          const lines = chunk.split("\n").filter(line => line.trim() !== "");

          lines.forEach(line => {
            try {
              const parsed = JSON.parse(line);
              setThumbnails((prev) => [...prev, parsed.thumbnail]); // Append new thumbnail
            } catch (error) {
              console.error("Error parsing JSON chunk:", error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    } finally {
      setLoading(false);
      ws.close();
    }
  }
};


  return (
    <div className="flex flex-col items-center justify-center ml-auto mr-auto mt-[200px]">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Video Thumbnail Generator</h1>
      <div className="w-full max-w-lg p-4 rounded-lg shadow-lg border border-gray-300">
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {video && (
          <div className="w-full">
            <button
              onClick={generateThumbnail}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-semibold text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Generating...' : 'Generate Thumbnails'}
            </button>
            {loading && (
              <>
                <div className="mt-4 w-full bg-gray-200 rounded-lg">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-2 bg-blue-500 rounded-lg transition-all duration-300"
                  ></div>
                  <p className="text-center text-gray-700 mt-1">{progress}% uploaded</p>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-lg">
                  <div
                    style={{
                      width: `${backendProgress}%`,
                      transition: 'width 0.5s ease-in-out',
                    }}
                    className="h-2 bg-green-500 rounded-lg transition-all duration-300"
                  ></div>
                  <p className="text-center text-gray-700 mt-1">{backendProgress}% processed</p>
                </div>
              </>
            )}
            {thumbnails.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {thumbnails.map((thumbnail, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <p className="mb-2 text-gray-700">Thumbnail {index + 1}:</p>
                    <img
                      src={thumbnail}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full rounded-lg border border-gray-300 shadow-sm"
                      onClick={() => setEnlargedImage(thumbnail)}
                    />
                  </div>
                ))}
              </div>
            )}
            {enlargedImage && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
                onClick={() => setEnlargedImage(null)}  // Click outside to close
              >
                <img
                  src={enlargedImage}
                  alt="Enlarged Thumbnail"
                  className="max-w-full max-h-full"
                  onClick={(e) => e.stopPropagation()}  // Prevent click on image itself from closing
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
