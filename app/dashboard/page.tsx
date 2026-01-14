"use client"

import Link from "next/link"
import { Button } from '@/components/ui/button'
import { GitCompare, Upload, BarChart3, ArrowUpRight, Lightbulb, Youtube, Lock, Sparkles, Users, MessageSquare } from "lucide-react"
import { ViewsIcon, SubscribersIcon, WatchTimeIcon, EngagementIcon } from "@/components/icons/dashboard-icons"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import SharedSidebar from "@/components/shared-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import Image from "next/image"

interface YouTubeChannel {
  id: string
  title: string
  description: string
  customUrl?: string
  thumbnail: string
  subscriberCount: string
  videoCount: string
  viewCount: string
  publishedAt: string
}

interface LatestVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  viewCount: number
  titleScore?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Creator' 
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [latestVideo, setLatestVideo] = useState<LatestVideo | null>(null)
  const [loadingVideo, setLoadingVideo] = useState(false)

  // Load YouTube channel data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('youtube_channel')
      if (stored) {
        setYoutubeChannel(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load channel data:', error)
    }
  }, [])

  // Fetch latest video when channel is loaded
  useEffect(() => {
    const fetchLatestVideo = async () => {
      if (!youtubeChannel) return
      
      setLoadingVideo(true)
      try {
        const accessToken = localStorage.getItem('youtube_access_token')
        if (!accessToken) {
          console.log('No access token found')
          setLoadingVideo(false)
          return
        }

        const response = await fetch(`/api/youtube/best-videos?channelId=${youtubeChannel.id}&accessToken=${accessToken}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch videos')
        }
        
        const data = await response.json()
        
        console.log('Fetched videos data:', data)
        
        // Check if we have videos in the response
        if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
          const video = data.videos[0] // Get the first (latest) video
          console.log('Latest video:', video)
          
          setLatestVideo({
            id: video.id || '',
            title: video.title || 'Untitled Video',
            thumbnail: video.thumbnail || '',
            publishedAt: video.publishedAt || new Date().toISOString(),
            viewCount: video.viewCount || 0,
            titleScore: 67 // Default score, can be calculated
          })
        } else {
          console.log('No videos found for this channel')
          setLatestVideo(null)
        }
      } catch (error) {
        console.error('Error fetching latest video:', error)
        // Set null instead of keeping loading state
        setLatestVideo(null)
      } finally {
        setLoadingVideo(false)
      }
    }

    fetchLatestVideo()
  }, [youtubeChannel])

  const startYouTubeAuth = () => {
    setIsConnecting(true)
    
    const popup = window.open('/api/auth/youtube', 'youtube-auth', 'width=500,height=600')
    
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'YOUTUBE_AUTH_SUCCESS') {
        setIsConnecting(false)
        setShowConnectModal(false)
        window.removeEventListener('message', messageListener)
        if (popup) popup.close()
        window.location.reload()
      } else if (event.data.type === 'YOUTUBE_AUTH_ERROR') {
        setIsConnecting(false)
        window.removeEventListener('message', messageListener)
        if (popup) popup.close()
        console.error('Authentication failed:', event.data.error)
      }
    }

    window.addEventListener('message', messageListener)
    
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        setIsConnecting(false)
        window.removeEventListener('message', messageListener)
      }
    }, 1000)

    setTimeout(() => {
      clearInterval(checkClosed)
      setIsConnecting(false)
      window.removeEventListener('message', messageListener)
      if (popup && !popup.closed) {
        popup.close()
      }
    }, 300000)
  }

  const formatNumber = (num: string | number): string => {
    const n = typeof num === "string" ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return n.toString()
  }

  // Enhanced reusable base classes for cards with better mobile responsiveness
  const cardBase = 'group relative bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5 md:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden backdrop-blur-sm'

  // Mock analytics data
  const analyticsData = {
    views: youtubeChannel ? parseInt(youtubeChannel.viewCount) : 127500,
    subscribers: youtubeChannel ? parseInt(youtubeChannel.subscriberCount) : 45200,
    watchTime: 8200,
    engagement: 12.5,
    revenue: 2450,
    growth: {
      views: 23,
      subscribers: 18,
      watchTime: 31,
      engagement: 15,
      revenue: 28
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        {/* Shared Sidebar */}
        <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage="dashboard" />

        {/* Main Content */}
        <main className="flex-1 pt-20 md:pt-20 md:ml-72 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Redesigned Welcome Section */}
            <div className="mb-8 mt-8 md:mt-10">
              {/* Upgrade Banner */}
              <div className="flex justify-center mb-4 px-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-100 px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm text-yellow-800 shadow-sm max-w-full overflow-hidden">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium truncate">You're on Free Plan</span>
                  <span className="text-gray-700 hidden md:inline">Unlock unlimited access to all features and get paid.</span>
                  <Link href="/pricing" className="text-blue-600 font-semibold underline ml-2">Upgrade now</Link>
                </div>
              </div>

              {/* Hero / Overview */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 mb-2">Welcome back, {firstName}!</h1>
                  <p className="text-gray-600 text-sm sm:text-lg">Here's a quick snapshot of your account — performance highlights, recent activity, and recommended next steps.</p>
                </div>


              </div>

              

              {/* Three main statistic cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-violet-500 flex items-center justify-center text-white shadow-md">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Automations</p>
                    <p className="text-2xl font-extrabold text-gray-900">8</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-cyan-500 flex items-center justify-center text-white shadow-md">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Followers</p>
                    <p className="text-2xl font-extrabold text-gray-900">{formatNumber(analyticsData.subscribers)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-400 flex items-center justify-center text-white shadow-md">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">AutoDM Sent</p>
                    <p className="text-2xl font-extrabold text-gray-900">3,412</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimize Your Latest Video Section */}
            {youtubeChannel && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black text-gray-900">Optimize Your Latest Video</h2>
                  <Link href="/videos">
                    <Button variant="link" className="text-blue-600 hover:text-blue-700">
                      View All
                    </Button>
                  </Link>
                </div>
                
                {loadingVideo ? (
                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-white">Loading video...</div>
                    </div>
                  </div>
                ) : latestVideo ? (
                  <Link href="/videos" className="block">
                    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Video Thumbnail */}
                        <div className="relative w-full md:w-48 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-700">
                          {latestVideo.thumbnail ? (
                            <Image
                              src={latestVideo.thumbnail}
                              alt={latestVideo.title}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <Youtube className="w-12 h-12" />
                            </div>
                          )}
                        </div>

                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                            {latestVideo.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <span>{latestVideo.viewCount.toLocaleString()} views</span>
                            <span>•</span>
                            <span>{new Date(latestVideo.publishedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                          </div>

                          {/* Title Score */}
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm font-medium">Title</span>
                              <div className="bg-gray-700 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                {latestVideo.titleScore || 67}
                              </div>
                            </div>
                            <button 
                              onClick={(e) => e.preventDefault()}
                              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                              Generate scores
                              <span className="text-lg">+</span>
                            </button>
                          </div>
                        </div>

                      {/* Optimize Button */}
                      <div className="w-full md:w-auto flex items-center justify-center md:justify-end">
                        <Link href={`/videos?videoId=${latestVideo.id}`}>
                          <Button 
                            className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
                          >
                            <Lock className="w-4 h-4" />
                            Optimize
                          </Button>
                        </Link>
                      </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-white text-lg font-semibold mb-2">No Videos Found</div>
                      <div className="text-gray-400 text-sm mb-6">Upload your first video to see it here</div>
                      <Link href="/upload/normal">
                        <Button className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-2 rounded-lg">
                          Upload Video
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Connect Additional Channel</h3>
              <p className="text-sm text-gray-600 mt-1">Add another YouTube channel to manage multiple accounts</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">YouTube Channel</p>
                  <p className="text-sm text-gray-600">Connect via Google OAuth</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={startYouTubeAuth}
                  disabled={isConnecting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Channel'}
                </Button>
                <Button
                  onClick={() => setShowConnectModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
