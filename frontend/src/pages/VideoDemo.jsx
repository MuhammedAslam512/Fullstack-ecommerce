import VideoPlayer from "../components/videoPlayer";

export default function VideoDemo() {
  return (
    <div style={{ padding: '30px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
        📹 Media Streaming Demo (Day 41)
      </h2>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Streaming video files in lightweight chunks using HTTP 206 Partial Content Range Requests.
      </p>

      {/* Renders the Video Player Component */}
      <VideoPlayer videoFilename="sample-demo.mp4" />
    </div>
  );
}