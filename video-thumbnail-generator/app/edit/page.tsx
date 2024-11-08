"use client";

import React, { useState, useRef } from 'react';
import { useImage } from '../ImageContext';

const EditPage: React.FC = () => {
  const { image } = useImage();
  const [overlayText, setOverlayText] = useState<string>("");
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [overlayImageFile, setOverlayImageFile] = useState<File | null>(null); // File state for background removal
  const [isRemovingBg, setIsRemovingBg] = useState(false); // State to show loading while removing background

  const [textPosition, setTextPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isResizingText, setIsResizingText] = useState(false);
  const [textDimensions, setTextDimensions] = useState<{ width: number; height: number }>({
    width: 200,
    height: 40,
  });

  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isResizingImage, setIsResizingImage] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const textRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!image) {
    return <p>No image selected for editing</p>;
  }

  const handleOverlayImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOverlayImageFile(file); // Save file for backend processing

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setOverlayImage(reader.result);
          setImageDimensions({ width: 100, height: 100 }); // Initial overlay image dimensions
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBg = async () => {
    if (!overlayImageFile) return;

    setIsRemovingBg(true); // Start loading spinner
    try {
      const formData = new FormData();
      formData.append("image", overlayImageFile);

      const response = await fetch('http://localhost:3001/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { base64Image } = await response.json();
        setOverlayImage(`data:image/png;base64,${base64Image}`); // Update overlay image with background removed
      } else {
        console.error("Failed to remove background");
      }
    } catch (error) {
      console.error("Error removing background:", error);
    } finally {
      setIsRemovingBg(false); // End loading spinner
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, isText: boolean) => {
    dragStart.current = {
      x: e.clientX - (isText ? textPosition.x : imagePosition.x),
      y: e.clientY - (isText ? textPosition.y : imagePosition.y),
    };
    if (isText) setIsDraggingText(true);
    else setIsDraggingImage(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingText) {
      setTextPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    } else if (isDraggingImage) {
      setImagePosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    } else if (isResizingText) {
      setTextDimensions({
        width: Math.max(e.clientX - textPosition.x, 50),
        height: Math.max(e.clientY - textPosition.y, 20),
      });
    } else if (isResizingImage && imageDimensions) {
      const newWidth = Math.max(e.clientX - imagePosition.x, 50);
      const newHeight = Math.max(e.clientY - imagePosition.y, 50);
      setImageDimensions({
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingText(false);
    setIsDraggingImage(false);
    setIsResizingText(false);
    setIsResizingImage(false);
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, isText: boolean) => {
    e.stopPropagation();
    if (isText) setIsResizingText(true);
    else setIsResizingImage(true);
  };

  const computedFontSize = textDimensions.height * 0.5;

  return (
    <div className="edit-container text-center" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <h1 className="mb-4 text-2xl font-bold">Edit Image</h1>
      <div className="relative inline-block">
        {/* Display selected image */}
        <img
          src={image}
          alt="Selected Thumbnail"
          className="w-full max-w-md"
          onLoad={(e) => setImageDimensions({ width: e.currentTarget.width, height: e.currentTarget.height })}
          style={{ userSelect: "none" }}
        />

        {/* Draggable and Resizable Text Overlay */}
        {overlayText && (
          <div
            ref={textRef}
            className="absolute text-overlay text-white font-bold cursor-move"
            style={{
              top: textPosition.y,
              left: textPosition.x,
              width: `${textDimensions.width}px`,
              height: `${textDimensions.height}px`,
              fontSize: `${computedFontSize}px`,
              padding: "4px 8px",
              background: "transparent",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
            }}
            onMouseDown={(e) => handleMouseDown(e, true)}
          >
            {overlayText}
            <div
              onMouseDown={(e) => handleResizeMouseDown(e, true)}
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "10px",
                height: "10px",
                background: "white",
                cursor: "se-resize",
              }}
            />
          </div>
        )}

        {/* Draggable and Resizable Image Overlay */}
        {overlayImage && (
          <img
            src={overlayImage}
            alt="Overlay"
            className="absolute cursor-move"
            style={{
              top: `${imagePosition.y}px`,
              left: `${imagePosition.x}px`,
              width: `${imageDimensions?.width || 100}px`,
              height: `${imageDimensions?.height || 100}px`,
              userSelect: "none",
            }}
            onMouseDown={(e) => handleMouseDown(e, false)}
          />
        )}
        {overlayImage && (
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, false)}
            style={{
              position: "absolute",
              top: `${imagePosition.y + (imageDimensions?.height || 100) - 5}px`,
              left: `${imagePosition.x + (imageDimensions?.width || 100) - 5}px`,
              width: "10px",
              height: "10px",
              background: "white",
              cursor: "se-resize",
            }}
          />
        )}
      </div>

      {/* Controls for adding overlays */}
      <div className="controls mt-6">
        <h2 className="text-lg font-semibold mb-2">Add Text Overlay</h2>
        <input
          type="text"
          value={overlayText}
          onChange={(e) => setOverlayText(e.target.value)}
          placeholder="Enter overlay text"
          className="border p-2 mb-4 rounded"
        />

        <h2 className="text-lg font-semibold mb-2">Add Image Overlay</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleOverlayImageUpload}
          className="mb-4"
        />

        {/* Button for removing background */}
        {overlayImage && (
          <button
            onClick={handleRemoveBg}
            disabled={isRemovingBg}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {isRemovingBg ? 'Removing Background...' : 'Remove Background'}
          </button>
        )}
      </div>

      <style jsx>{`
        .edit-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .text-overlay {
          position: absolute;
          background: transparent;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default EditPage;
