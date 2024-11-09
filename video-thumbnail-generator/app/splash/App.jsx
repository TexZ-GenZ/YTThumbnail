"use client";
import React from "react";
import "../App.css";
import { useRouter } from "next/navigation";
function App() {
  const router = useRouter();

  const navigate = () => {
    router.push("/components");
  };
  return (
    <div className="App">
      <header className="nav-bar">
        <a className="logo" href="#">
          FrameGrab
        </a>
        <div className="auth-buttons">
          <button className="sign-in-btn">Sign In</button>
        </div>
      </header>

      <main className="hero-section">
        <div className="hero-main-content">
          <div className="hero-content">
            <h1>Generate High-Quality Video Thumbnails in Seconds</h1>
            <p className="para">
              Say goodbye to manual thumbnail creation! Our tool quickly
              extracts high-quality frames from your videos, making it
              effortless to generate engaging and clickable thumbnails in
              seconds.
            </p>
            <button onClick={navigate} className="cta-btn">Click here to upload your video</button>
          </div>
          <div className="hero-image">
            <img
              src="https://www.vdocipher.com/blog/wp-content/uploads/2023/12/DALL%C2%B7E-2023-12-10-20.21.58-A-creative-and-visually-appealing-featured-image-for-a-blog-about-video-thumbnails-for-various-social-platforms-like-YouTube-Instagram-and-TikTok-s-1024x585.png"
              alt="Landing page builder demo"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
