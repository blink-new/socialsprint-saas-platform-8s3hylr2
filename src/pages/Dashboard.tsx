import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Calendar, Users, Zap, BarChart3, UserCircle, Lightbulb } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import blink from '@/blink/client'
import type { User, Workspace, ContentPiece, HotTopic } from '@/types'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [recentContent, setRecentContent] = useState<ContentPiece[]>([])
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([])
  const [stats, setStats] = useState({
    totalContent: 0,
    scheduledPosts: 0,
    timeSaved: 0,
    engagementRate: 0
  })

  const loadDashboardData = async (userId: string) => {
    try {
      // Load or create workspace
      const workspaces = await blink.db.workspaces.list({
        where: { userId },
        limit: 1
      })

      if (workspaces.length === 0) {
        const newWorkspace = await blink.db.workspaces.create({
          name: 'My Workspace',
          userId,
          plan: 'free',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        setWorkspace(newWorkspace)
      } else {
        setWorkspace(workspaces[0])
      }

      // Load recent content and hot topics (mock data for now)
      setRecentContent([
        {
          id: '1',
          workspaceId: workspaces[0]?.id || 'temp',
          topicId: 'topic1',
          platform: 'linkedin',
          title: 'AI in Marketing: The Future is Now',
          content: 'Artificial Intelligence is revolutionizing how we approach marketing...',
          status: 'published',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          engagementStats: { likes: 45, shares: 12, comments: 8 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          workspaceId: workspaces[0]?.id || 'temp',
          topicId: 'topic2',
          platform: 'twitter',
          title: 'Quick Twitter Thread',
          content: '🧵 Thread: 5 ways to improve your content strategy...',
          status: 'scheduled',
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])

      setHotTopics([
        {
          id: '1',
          workspaceId: workspaces[0]?.id || 'temp',
          title: 'AI Content Creation Tools',
          description: 'Latest trends in AI-powered content generation',
          engagementScore: 8.5,
          sourceUrls: ['https://example.com/ai-tools'],
          isSelected: false,
          priority: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          workspaceId: workspaces[0]?.id || 'temp',
          title: 'Social Media ROI Metrics',
          description: 'How to measure social media return on investment',
          engagementScore: 7.2,
          sourceUrls: ['https://example.com/roi-metrics'],
          isSelected: false,
          priority: 2,
          createdAt: new Date().toISOString()
        }
      ])

      setStats({
        totalContent: 24,
        scheduledPosts: 8,
        timeSaved: 15.5,
        engagementRate: 4.2
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      if (state.user) {
        setUser(state.user)
        await loadDashboardData(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  const getPlatformColor = (platform: string) => {
    const colors = {
      linkedin: 'bg-blue-100 text-blue-800',
      twitter: 'bg-sky-100 text-sky-800',
      instagram: 'bg-pink-100 text-pink-800',
      tiktok: 'bg-purple-100 text-purple-800',
      youtube: 'bg-red-100 text-red-800'
    }
    return colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (!user || !workspace) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.displayName || user.email.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your content today.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledPosts}</div>
            <p className="text-xs text-muted-foreground">
              Next post in 2 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.timeSaved}h</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              +0.8% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>
              Your latest posts and their performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentContent.map((content) => (
              <div key={content.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getPlatformColor(content.platform)}>
                      {content.platform}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(content.status)}>
                      {content.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {content.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {content.content}
                  </p>
                  {content.engagementStats && (
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>👍 {content.engagementStats.likes}</span>
                      <span>🔄 {content.engagementStats.shares}</span>
                      <span>💬 {content.engagementStats.comments}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Content
            </Button>
          </CardContent>
        </Card>

        {/* Hot Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Hot Topics</CardTitle>
            <CardDescription>
              Trending topics from your inspiration sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hotTopics.map((topic) => (
              <div key={topic.id} className="p-3 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {topic.title}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-medium text-amber-600">
                      {topic.engagementScore}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  {topic.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {topic.sourceUrls.length} sources
                  </span>
                  <Button size="sm" variant="outline">
                    Generate Content
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Discover More Topics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with your content workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/writing-profile')}
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-sm">Setup Writing Profile</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/inspiration')}
            >
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm">Add Inspiration Sources</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => navigate('/generate')}
            >
              <Zap className="w-5 h-5" />
              <span className="text-sm">Generate Content</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}