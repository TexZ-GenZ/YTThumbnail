import React from 'react';
import VideoUploader from '@/app/components/VideoUploader';

const Home: React.FC = () => (
  <main className="flex flex-col gap-8 items-center sm:items-start">
    <VideoUploader />
  </main>
);

export default Home;
