import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')

  const scheduledPosts = [
    {
      id: '1',
      title: 'AI in Marketing: The Future is Now',
      platform: 'linkedin',
      scheduledFor: new Date(2024, 0, 22, 9, 0),
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Quick Twitter Thread on Content Strategy',
      platform: 'twitter',
      scheduledFor: new Date(2024, 0, 22, 14, 30),
      status: 'scheduled'
    },
    {
      id: '3',
      title: 'Instagram Story: Behind the Scenes',
      platform: 'instagram',
      scheduledFor: new Date(2024, 0, 23, 11, 0),
      status: 'scheduled'
    }
  ]

  const getPlatformColor = (platform: string) => {
    const colors = {
      linkedin: 'bg-blue-100 text-blue-800 border-blue-200',
      twitter: 'bg-sky-100 text-sky-800 border-sky-200',
      instagram: 'bg-pink-100 text-pink-800 border-pink-200',
      tiktok: 'bg-purple-100 text-purple-800 border-purple-200',
      youtube: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-600 mt-1">
            Schedule and manage your social media posts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            Today
          </Button>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                {view === 'week' ? 'Week View' : view === 'day' ? 'Day View' : 'Month View'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {view === 'week' && (
                <div className="space-y-4">
                  {/* Week header */}
                  <div className="grid grid-cols-8 gap-2 text-sm font-medium text-gray-500">
                    <div className="p-2">Time</div>
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(currentDate)
                      date.setDate(date.getDate() - date.getDay() + i)
                      return (
                        <div key={i} className="p-2 text-center">
                          <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {date.getDate()}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Time slots */}
                  <div className="space-y-1">
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = i + 8 // Start from 8 AM
                      return (
                        <div key={i} className="grid grid-cols-8 gap-2 min-h-[60px] border-t border-gray-100">
                          <div className="p-2 text-sm text-gray-500">
                            {hour}:00
                          </div>
                          {Array.from({ length: 7 }, (_, dayIndex) => {
                            const dayPosts = scheduledPosts.filter(post => {
                              const postDate = new Date(post.scheduledFor)
                              const currentDay = new Date(currentDate)
                              currentDay.setDate(currentDay.getDate() - currentDay.getDay() + dayIndex)
                              return postDate.toDateString() === currentDay.toDateString() &&
                                     postDate.getHours() === hour
                            })

                            return (
                              <div key={dayIndex} className="p-1">
                                {dayPosts.map(post => (
                                  <div
                                    key={post.id}
                                    className={`p-2 rounded text-xs border ${getPlatformColor(post.platform)} cursor-pointer hover:shadow-sm transition-shadow`}
                                  >
                                    <div className="font-medium truncate">
                                      {post.title}
                                    </div>
                                    <div className="text-xs opacity-75">
                                      {formatTime(post.scheduledFor)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {view === 'day' && (
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    Day view coming soon...
                  </div>
                </div>
              )}

              {view === 'month' && (
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    Month view coming soon...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Posts</CardTitle>
              <CardDescription>
                Next scheduled content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduledPosts
                .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
                .slice(0, 5)
                .map((post) => (
                  <div key={post.id} className="p-3 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getPlatformColor(post.platform)}>
                        {post.platform}
                      </Badge>
                      <Badge variant="outline">
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(post.scheduledFor)} at {formatTime(post.scheduledFor)}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scheduled</span>
                <span className="font-semibold">8 posts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Published</span>
                <span className="font-semibold">12 posts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Drafts</span>
                <span className="font-semibold">3 posts</span>
              </div>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { platform: 'linkedin', count: 5 },
                { platform: 'twitter', count: 8 },
                { platform: 'instagram', count: 4 },
                { platform: 'tiktok', count: 2 }
              ].map(({ platform, count }) => (
                <div key={platform} className="flex items-center justify-between">
                  <Badge className={getPlatformColor(platform)}>
                    {platform}
                  </Badge>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}