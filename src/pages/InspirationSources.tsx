import { useState, useEffect, useCallback } from 'react'
import { Plus, ExternalLink, Trash2, RefreshCw, TrendingUp, Eye, EyeOff, Settings2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import blink from '@/blink/client'
import type { User, Workspace, InspirationSource, HotTopic } from '@/types'

const PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'twitter', label: 'X (Twitter)', icon: '🐦' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'threads', label: 'Threads', icon: '🧵' },
  { value: 'blog', label: 'Blog/Newsletter', icon: '📝' }
]

export default function InspirationSources() {
  const [user, setUser] = useState<User | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [sources, setSources] = useState<InspirationSource[]>([])
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [newSource, setNewSource] = useState({
    platform: '',
    profileUrl: '',
    username: ''
  })
  const [scrapingSettings, setScrapingSettings] = useState({
    postsToAnalyze: 10,
    minEngagementScore: 5.0,
    autoRefresh: true
  })
  const { toast } = useToast()

  const loadData = useCallback(async (userId: string) => {
    try {
      // Get workspace
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
        
        // Load inspiration sources
        const inspirationSources = await blink.db.inspirationSources.list({
          where: { workspaceId: workspaces[0].id },
          orderBy: { createdAt: 'desc' }
        })
        setSources(inspirationSources)

        // Load hot topics
        const topics = await blink.db.hotTopics.list({
          where: { workspaceId: workspaces[0].id },
          orderBy: { engagementScore: 'desc' }
        })
        setHotTopics(topics)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load inspiration sources data.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      if (state.user) {
        setUser(state.user)
        await loadData(state.user.id)
      }
    })
    return unsubscribe
  }, [loadData])

  const extractUsernameFromUrl = (url: string, platform: string): string => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      
      switch (platform) {
        case 'linkedin': {
          const linkedinMatch = pathname.match(/\/in\/([^/]+)/)
          return linkedinMatch ? linkedinMatch[1] : ''
        }
        case 'twitter': {
          const twitterMatch = pathname.match(/\/([^/]+)$/)
          return twitterMatch ? twitterMatch[1] : ''
        }
        case 'instagram': {
          const instaMatch = pathname.match(/\/([^/]+)\/?$/)
          return instaMatch ? instaMatch[1] : ''
        }
        case 'tiktok': {
          const tiktokMatch = pathname.match(/\/@([^/]+)/)
          return tiktokMatch ? tiktokMatch[1] : ''
        }
        case 'youtube': {
          const youtubeMatch = pathname.match(/\/(c|channel|user)\/([^/]+)/) || pathname.match(/\/@([^/]+)/)
          return youtubeMatch ? (youtubeMatch[2] || youtubeMatch[1]) : ''
        }
        case 'threads': {
          const threadsMatch = pathname.match(/\/@([^/]+)/)
          return threadsMatch ? threadsMatch[1] : ''
        }
        default:
          return urlObj.hostname.replace('www.', '')
      }
    } catch {
      return ''
    }
  }

  const handleAddSource = async () => {
    if (!workspace || !newSource.platform || !newSource.profileUrl) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      const username = newSource.username || extractUsernameFromUrl(newSource.profileUrl, newSource.platform)
      
      const source = await blink.db.inspirationSources.create({
        id: `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workspaceId: workspace.id,
        platform: newSource.platform,
        profileUrl: newSource.profileUrl,
        username: username,
        isActive: true,
        createdAt: new Date().toISOString()
      })

      setSources(prev => [source, ...prev])
      setNewSource({ platform: '', profileUrl: '', username: '' })
      setShowAddDialog(false)
      
      toast({
        title: "Success",
        description: "Inspiration source added! Click 'Scrape Content' to discover hot topics."
      })
    } catch (error) {
      console.error('Error adding source:', error)
      toast({
        title: "Error",
        description: "Failed to add inspiration source. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleScrapeSource = async (sourceId: string) => {
    setScraping(sourceId)
    
    try {
      const source = sources.find(s => s.id === sourceId)
      if (!source) {
        throw new Error('Source not found')
      }

      console.log(`🔄 Starting REAL scrape for ${source.username} (${source.platform})`)
      toast({
        title: "Scraping Content",
        description: `Extracting real content from ${source.username}...`
      })

      // Step 1: Actually scrape the URL content
      let scrapedContent = ''
      let scrapedMetadata = {}
      
      try {
        console.log(`📡 Scraping URL: ${source.profileUrl}`)
        const result = await blink.data.scrape(source.profileUrl)
        scrapedContent = result.markdown || result.extract || ''
        scrapedMetadata = result.metadata || {}
        
        console.log(`📄 Successfully scraped ${scrapedContent.length} characters`)
        console.log(`📊 Metadata:`, scrapedMetadata)
        
        if (scrapedContent.length < 100) {
          throw new Error('Insufficient content scraped')
        }
        
      } catch (error) {
        console.error('❌ Real scraping failed:', error)
        toast({
          title: "Scraping Failed",
          description: `Could not access ${source.username}'s content. The profile may be private or restricted.`,
          variant: "destructive"
        })
        return
      }

      // Step 2: Extract REAL posts and topics from scraped content
      toast({
        title: "Analyzing Content",
        description: "Extracting trending topics from real posts..."
      })

      const prompt = `You are analyzing REAL scraped content from a ${source.platform} profile (@${source.username}).

SCRAPED CONTENT:
${scrapedContent.slice(0, 4000)}

TASK: Extract the ACTUAL trending topics from this real content. Look for:
1. Posts with high engagement indicators (likes, comments, shares mentioned)
2. Recurring themes and subjects the person posts about
3. Topics that generated discussion or controversy
4. Content that got significant attention

For each REAL topic you find, provide:
- title: The actual topic/theme from their posts
- description: What they specifically said about this topic
- engagementScore: Based on actual engagement indicators you see (1-10)
- keywords: Actual keywords/hashtags they used
- sourcePost: A snippet of the actual post that shows this topic

Only extract topics that you can clearly see evidence for in the scraped content. Do not make up generic topics.`

      const { object: result } = await blink.ai.generateObject({
        prompt,
        schema: {
          type: 'object',
          properties: {
            topics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  engagementScore: { type: 'number' },
                  keywords: { type: 'array', items: { type: 'string' } },
                  sourcePost: { type: 'string' }
                },
                required: ['title', 'description', 'engagementScore', 'sourcePost']
              }
            },
            contentAnalysis: {
              type: 'object',
              properties: {
                totalPostsFound: { type: 'number' },
                avgEngagement: { type: 'number' },
                topPerformingPost: { type: 'string' }
              }
            }
          },
          required: ['topics']
        }
      })

      const topics = result.topics || []
      const analysis = result.contentAnalysis || {}
      
      console.log(`🎯 Extracted ${topics.length} REAL topics from actual content`)
      console.log(`📊 Content analysis:`, analysis)

      if (topics.length === 0) {
        toast({
          title: "No Topics Found",
          description: `Could not extract trending topics from ${source.username}'s content. The profile may not have enough public posts.`,
          variant: "destructive"
        })
        return
      }

      // Step 3: Save REAL topics to database
      const createdTopics = []
      for (const topicData of topics) {
        const topic = await blink.db.hotTopics.create({
          id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          workspaceId: workspace!.id,
          title: topicData.title,
          description: topicData.description,
          engagementScore: topicData.engagementScore,
          sourceUrls: [source.profileUrl],
          keywords: topicData.keywords || [],
          rawContent: topicData.sourcePost || scrapedContent.slice(0, 500),
          isSelected: false,
          priority: 0,
          createdAt: new Date().toISOString()
        })
        createdTopics.push(topic)
      }

      setHotTopics(prev => [...createdTopics, ...prev])

      // Update source with analysis data
      await blink.db.inspirationSources.update(sourceId, {
        lastScraped: new Date().toISOString()
      })

      setSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { ...s, lastScraped: new Date().toISOString() }
          : s
      ))
      
      toast({
        title: "Real Topics Extracted!",
        description: `Found ${createdTopics.length} trending topics from ${source.username}'s actual posts!`
      })
      
    } catch (error) {
      console.error('Error in real scraping:', error)
      toast({
        title: "Error",
        description: "Failed to extract real topics. The profile may be private or have limited public content.",
        variant: "destructive"
      })
    } finally {
      setScraping(null)
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await blink.db.inspirationSources.delete(sourceId)
      setSources(prev => prev.filter(s => s.id !== sourceId))
      
      toast({
        title: "Success",
        description: "Inspiration source deleted successfully."
      })
    } catch (error) {
      console.error('Error deleting source:', error)
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleToggleSource = async (sourceId: string, isActive: boolean) => {
    try {
      await blink.db.inspirationSources.update(sourceId, { isActive })
      setSources(prev => prev.map(s => 
        s.id === sourceId ? { ...s, isActive } : s
      ))
    } catch (error) {
      console.error('Error toggling source:', error)
    }
  }

  const handleToggleTopic = async (topicId: string, isSelected: boolean) => {
    try {
      await blink.db.hotTopics.update(topicId, { isSelected })
      setHotTopics(prev => prev.map(t => 
        t.id === topicId ? { ...t, isSelected } : t
      ))
    } catch (error) {
      console.error('Error toggling topic:', error)
    }
  }

  const handleScrapeAll = async () => {
    const activeSources = sources.filter(s => s.isActive)
    for (const source of activeSources) {
      await handleScrapeSource(source.id)
      // Add delay between scrapes
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const handleDeleteSelectedTopics = async () => {
    try {
      const selectedTopicIds = hotTopics.filter(t => t.isSelected).map(t => t.id)
      
      if (selectedTopicIds.length === 0) {
        toast({
          title: "No Topics Selected",
          description: "There are no selected topics to delete.",
          variant: "default"
        })
        return
      }

      // Delete all selected topics from database
      for (const topicId of selectedTopicIds) {
        await blink.db.hotTopics.delete(topicId)
      }

      // Update local state - remove deleted topics
      setHotTopics(prev => prev.filter(t => !t.isSelected))
      
      toast({
        title: "Topics Deleted",
        description: `Permanently deleted ${selectedTopicIds.length} topics successfully.`
      })
    } catch (error) {
      console.error('Error deleting selected topics:', error)
      toast({
        title: "Error",
        description: "Failed to delete selected topics. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAllTopics = async () => {
    try {
      if (hotTopics.length === 0) {
        toast({
          title: "No Topics Found",
          description: "There are no topics to delete.",
          variant: "default"
        })
        return
      }

      // Delete all topics from database
      for (const topic of hotTopics) {
        await blink.db.hotTopics.delete(topic.id)
      }

      // Clear local state
      setHotTopics([])
      
      toast({
        title: "All Topics Deleted",
        description: `Permanently deleted ${hotTopics.length} topics successfully.`
      })
    } catch (error) {
      console.error('Error deleting all topics:', error)
      toast({
        title: "Error",
        description: "Failed to delete all topics. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getPlatformInfo = (platform: string) => {
    return PLATFORM_OPTIONS.find(p => p.value === platform) || { label: platform, icon: '🔗' }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50'
    if (score >= 6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const selectedTopics = hotTopics.filter(t => t.isSelected)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspiration Sources</h1>
          <p className="text-gray-600 mt-1">
            Add competitor and role model profiles to discover trending topics and content ideas.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings2 className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scraping Settings</DialogTitle>
                <DialogDescription>
                  Configure how we analyze inspiration sources
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label>Posts to Analyze: {scrapingSettings.postsToAnalyze}</Label>
                  <Slider
                    value={[scrapingSettings.postsToAnalyze]}
                    onValueChange={([value]) => setScrapingSettings(prev => ({ ...prev, postsToAnalyze: value }))}
                    min={5}
                    max={50}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of recent posts to analyze per source
                  </p>
                </div>
                <div>
                  <Label>Minimum Engagement Score: {scrapingSettings.minEngagementScore}</Label>
                  <Slider
                    value={[scrapingSettings.minEngagementScore]}
                    onValueChange={([value]) => setScrapingSettings(prev => ({ ...prev, minEngagementScore: value }))}
                    min={1}
                    max={10}
                    step={0.5}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only surface topics with engagement above this threshold
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-refresh Sources</Label>
                    <p className="text-xs text-gray-500">
                      Automatically scrape sources daily
                    </p>
                  </div>
                  <Switch
                    checked={scrapingSettings.autoRefresh}
                    onCheckedChange={(checked) => setScrapingSettings(prev => ({ ...prev, autoRefresh: checked }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowSettingsDialog(false)}>
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Inspiration Source</DialogTitle>
                <DialogDescription>
                  Add a competitor or role model profile to discover trending topics.
                  Public profiles work best - LinkedIn, blogs, and personal websites are most reliable.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={newSource.platform} onValueChange={(value) => 
                    setNewSource(prev => ({ ...prev, platform: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_OPTIONS.map(platform => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div className="flex items-center space-x-2">
                            <span>{platform.icon}</span>
                            <span>{platform.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="profileUrl">Profile URL</Label>
                  <Input
                    id="profileUrl"
                    placeholder="https://linkedin.com/in/competitor"
                    value={newSource.profileUrl}
                    onChange={(e) => setNewSource(prev => ({ ...prev, profileUrl: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Input
                    id="username"
                    placeholder="Will be auto-extracted from URL"
                    value={newSource.username}
                    onChange={(e) => setNewSource(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSource}>
                  Add Source
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspiration Sources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inspiration Sources</CardTitle>
                <CardDescription>
                  Competitors and role models to learn from
                </CardDescription>
              </div>
              {sources.length > 0 && (
                <Button 
                  size="sm" 
                  onClick={handleScrapeAll}
                  disabled={scraping !== null}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${scraping ? 'animate-spin' : ''}`} />
                  Scrape All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sources added yet</h3>
                <p className="text-gray-600 mb-4">
                  Add competitor profiles to discover trending topics.
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  Add Your First Source
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sources.map((source) => {
                  const platformInfo = getPlatformInfo(source.platform)
                  const isScrapingThis = scraping === source.id
                  
                  return (
                    <div key={source.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{platformInfo.icon}</div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {platformInfo.label}
                            </h4>
                            <p className="text-sm text-gray-600">@{source.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={source.isActive}
                            onCheckedChange={(checked) => handleToggleSource(source.id, checked)}
                            size="sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(source.profileUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSource(source.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {source.lastScraped 
                            ? `Last scraped: ${new Date(source.lastScraped).toLocaleDateString()}`
                            : 'Never scraped'
                          }
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleScrapeSource(source.id)}
                          disabled={isScrapingThis || !source.isActive}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${isScrapingThis ? 'animate-spin' : ''}`} />
                          {isScrapingThis ? 'Scraping...' : 'Scrape Content'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hot Topics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hot Topics</CardTitle>
                <CardDescription>
                  Trending topics ranked by engagement ({hotTopics.length} discovered)
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {selectedTopics.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleDeleteSelectedTopics}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
                {hotTopics.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleDeleteAllTopics}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hotTopics.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No topics discovered yet</h3>
                <p className="text-gray-600 mb-4">
                  Add inspiration sources and scrape their content to discover hot topics.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {hotTopics.map((topic) => (
                  <div key={topic.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-2">
                        <Switch
                          checked={topic.isSelected}
                          onCheckedChange={(checked) => handleToggleTopic(topic.id, checked)}
                          size="sm"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {topic.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {topic.description}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getEngagementColor(topic.engagementScore)}`}>
                        {topic.engagementScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{topic.sourceUrls.length} sources</span>
                      <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Topics Summary */}
      {selectedTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Topics ({selectedTopics.length})</CardTitle>
            <CardDescription>
              Topics you've selected for content generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Engagement Score</TableHead>
                  <TableHead>Sources</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{topic.title}</div>
                        <div className="text-sm text-gray-600">{topic.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEngagementColor(topic.engagementScore)}>
                        {topic.engagementScore.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{topic.sourceUrls.length}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Generate Content
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-between">
              <Button 
                variant="outline"
                onClick={handleDeleteSelectedTopics}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Selected
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Generate All Selected Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}