import VideoCard from './VideoCard'

export default function VideoGrid({ videos }) {
  if (!videos?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-white/40">No videos to show yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
      {videos.map((video, i) => (
        <VideoCard key={video._id} video={video} index={i} />
      ))}
    </div>
  )
}