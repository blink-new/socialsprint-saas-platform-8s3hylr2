import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Wand2, Settings, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import blink from '@/blink/client'
import type { User, Workspace, HotTopic, StyleProfile } from '@/types'

export default function ContentGeneration() {
  const [user, setUser] = useState<User | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([])
  const [styleProfiles, setStyleProfiles] = useState<StyleProfile[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [llmProvider, setLlmProvider] = useState('gpt-4o-mini')
  const [language, setLanguage] = useState('en')
  const [tone, setTone] = useState('professional')
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
        
        // Load hot topics
        const topics = await blink.db.hotTopics.list({
          where: { workspaceId: workspaces[0].id },
          orderBy: { engagementScore: 'desc' }
        })
        setHotTopics(topics)

        // Load style profiles for writing style
        const styles = await blink.db.styleProfiles.list({
          orderBy: { createdAt: 'desc' },
          limit: 5
        })
        setStyleProfiles(styles)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load content generation data.",
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

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', description: 'Professional networking' },
    { id: 'twitter', name: 'X (Twitter)', description: 'Microblogging platform' },
    { id: 'instagram', name: 'Instagram', description: 'Visual storytelling' },
    { id: 'tiktok', name: 'TikTok', description: 'Short-form videos' },
    { id: 'youtube', name: 'YouTube', description: 'Long-form video content' }
  ]

  const handleGenerate = async () => {
    if (!selectedTopic || !selectedPlatform) {
      toast({
        title: "Missing Selection",
        description: "Please select both a topic and platform to generate content.",
        variant: "destructive"
      })
      return
    }
    
    setIsGenerating(true)
    
    try {
      const selectedTopicData = hotTopics.find(t => t.id === selectedTopic)
      const platformData = platforms.find(p => p.id === selectedPlatform)
      
      if (!selectedTopicData || !platformData) {
        throw new Error('Invalid topic or platform selection')
      }

      toast({
        title: "Generating Content",
        description: `Creating ${platformData.name} content about "${selectedTopicData.title}"...`
      })

      // Get user's writing style if available
      let writingStyleContext = ''
      if (styleProfiles.length > 0) {
        const primaryStyle = styleProfiles[0]
        writingStyleContext = `
        
User's Writing Style:
- Tone: ${primaryStyle.tone}
- Average sentence length: ${primaryStyle.avgSentenceLength} words
- Emoji usage: ${Math.round(primaryStyle.emojiUsage * 100)}%
- Hashtag pattern: ${primaryStyle.hashtagPattern}
- Common CTAs: ${primaryStyle.ctaPatterns.join(', ')}
- Writing characteristics: ${primaryStyle.writingCharacteristics}
        `
      }

      // Platform-specific content guidelines
      const platformGuidelines = {
        linkedin: {
          maxLength: 3000,
          style: 'Professional, thought-leadership focused. Use line breaks for readability. Include relevant hashtags at the end.',
          format: 'Start with a hook, provide value through insights or tips, end with engagement question.'
        },
        twitter: {
          maxLength: 280,
          style: 'Concise, engaging. Use thread format for longer content. Include relevant hashtags.',
          format: 'Hook in first tweet, numbered points for threads, call-to-action at the end.'
        },
        instagram: {
          maxLength: 2200,
          style: 'Visual-first, storytelling approach. Use emojis and line breaks. Include hashtags.',
          format: 'Engaging caption with story elements, bullet points for tips, relevant hashtags.'
        },
        tiktok: {
          maxLength: 300,
          style: 'Casual, trendy, hook-focused. Include trending hashtags and call-to-action.',
          format: 'Strong hook, quick tips or insights, engagement prompt.'
        },
        youtube: {
          maxLength: 5000,
          style: 'Detailed, educational. Include timestamps and clear structure.',
          format: 'Introduction, main content sections, conclusion with call-to-action.'
        }
      }

      const guidelines = platformGuidelines[selectedPlatform as keyof typeof platformGuidelines]

      const prompt = `Create engaging social media content for ${platformData.name} about the topic: "${selectedTopicData.title}"

Topic Details:
- Title: ${selectedTopicData.title}
- Description: ${selectedTopicData.description}
- Engagement Score: ${selectedTopicData.engagementScore}/10
- Context: ${selectedTopicData.rawContent || 'General trending topic in the industry'}

Platform Guidelines:
- Platform: ${platformData.name}
- Max Length: ${guidelines.maxLength} characters
- Style: ${guidelines.style}
- Format: ${guidelines.format}

Content Requirements:
- Tone: ${tone}
- Language: ${language === 'en' ? 'English' : language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'German'}
- Make it engaging and valuable to the audience
- Include relevant hashtags appropriate for the platform
- Add a call-to-action to encourage engagement
${writingStyleContext}

Generate content that would perform well on ${platformData.name} and matches the user's writing style if provided.`

      const { text } = await blink.ai.generateText({
        prompt,
        model: llmProvider,
        maxTokens: 1000
      })
      
      setGeneratedContent(text)
      
      toast({
        title: "Content Generated!",
        description: `Successfully created ${platformData.name} content about "${selectedTopicData.title}"`
      })
    } catch (error) {
      console.error('Error generating content:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Generation</h1>
          <p className="text-gray-600 mt-1">
            Create platform-optimized content from trending topics
          </p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Generation Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
              Hot Topics
            </CardTitle>
            <CardDescription>
              Select a trending topic to generate content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hotTopics.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No topics available</h3>
                <p className="text-gray-600 mb-4">
                  Add inspiration sources and scrape content to discover trending topics.
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/inspiration-sources'}>
                  Add Inspiration Sources
                </Button>
              </div>
            ) : (
              hotTopics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTopic === topic.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {topic.title}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {topic.engagementScore.toFixed(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {topic.description}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Platform Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Platform</CardTitle>
            <CardDescription>
              Choose your target social media platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPlatform === platform.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                <h4 className="text-sm font-medium text-gray-900">
                  {platform.name}
                </h4>
                <p className="text-xs text-gray-600">
                  {platform.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Generation Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
            <CardDescription>
              AI-powered content creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">LLM Provider</label>
              <Select value={llmProvider} onValueChange={setLlmProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">OpenAI GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedTopic || !selectedPlatform || isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Content
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  Schedule Post
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              AI-generated content optimized for {platforms.find(p => p.id === selectedPlatform)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Generated content will appear here..."
            />
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>Characters: {generatedContent.length}</span>
              <span>Platform optimized ✓</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}