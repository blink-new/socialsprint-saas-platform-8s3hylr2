import { Lightbulb, Plus, TrendingUp, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Inspiration() {
  const inspirationSources = [
    {
      id: '1',
      platform: 'linkedin',
      username: 'garyvee',
      profileUrl: 'https://linkedin.com/in/garyvee',
      isActive: true,
      lastScraped: '2 hours ago'
    },
    {
      id: '2',
      platform: 'twitter',
      username: 'naval',
      profileUrl: 'https://twitter.com/naval',
      isActive: true,
      lastScraped: '1 hour ago'
    }
  ]

  const hotTopics = [
    {
      id: '1',
      title: 'AI Content Creation Tools',
      description: 'Latest trends in AI-powered content generation',
      engagementScore: 8.5,
      sourceCount: 12
    },
    {
      id: '2',
      title: 'Remote Work Productivity',
      description: 'Best practices for distributed teams',
      engagementScore: 7.2,
      sourceCount: 8
    },
    {
      id: '3',
      title: 'Social Media ROI Metrics',
      description: 'How to measure social media return on investment',
      engagementScore: 6.8,
      sourceCount: 15
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspiration Sources</h1>
          <p className="text-gray-600 mt-1">
            Discover trending topics from your favorite creators and competitors
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Source
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspiration Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Your Sources</CardTitle>
            <CardDescription>
              Profiles you're tracking for inspiration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inspirationSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {source.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">@{source.username}</span>
                      <Badge variant="outline" className="text-xs">
                        {source.platform}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Last scraped: {source.lastScraped}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <div className={`w-2 h-2 rounded-full ${source.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add More Sources
            </Button>
          </CardContent>
        </Card>

        {/* Hot Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-amber-500" />
              Hot Topics
            </CardTitle>
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
                    {topic.sourceCount} sources
                  </span>
                  <Button size="sm" variant="outline">
                    Generate Content
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-12">
        <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Adding Inspiration Sources</h3>
        <p className="text-gray-600 mb-4">
          Add competitor profiles and role models to discover trending topics and content ideas.
        </p>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Your First Source
        </Button>
      </div>
    </div>
  )
}