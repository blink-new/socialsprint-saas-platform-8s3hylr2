export interface User {
  id: string
  email: string
  displayName?: string
  createdAt: string
}

export interface Workspace {
  id: string
  name: string
  userId: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  createdAt: string
  updatedAt: string
}

export interface SocialProfile {
  id: string
  workspaceId: string
  platform: 'linkedin' | 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'threads' | 'blog'
  profileUrl: string
  username: string
  isActive: boolean
  lastAnalyzed?: string
  profileName?: string // Name of the person (e.g., "Damien Vujasin")
  profileGroup?: string // Group ID to group multiple sources under one profile
  styleProfile?: StyleProfile
  createdAt: string
}

export interface WritingProfile {
  id: string
  workspaceId: string
  name: string // e.g., "Damien Vujasin"
  description?: string
  sources: SocialProfile[] // Multiple social media sources
  styleProfile?: StyleProfile
  isActive: boolean
  lastAnalyzed?: string
  createdAt: string
  updatedAt: string
}

export interface StyleProfile {
  id: string
  profileId: string
  tone: string
  avgSentenceLength: number
  emojiUsage: number
  hashtagPattern: string
  ctaPatterns: string[]
  keyPhrases?: string[]
  writingCharacteristics?: string
  rawContent?: string
  embedding?: number[]
  createdAt: string
}

export interface InspirationSource {
  id: string
  workspaceId: string
  platform: string
  profileUrl: string
  username: string
  isActive: boolean
  lastScraped?: string
  createdAt: string
}

export interface HotTopic {
  id: string
  workspaceId: string
  title: string
  description: string
  engagementScore: number
  sourceUrls: string[]
  keywords?: string[]
  rawContent?: string
  isSelected: boolean
  priority: number
  createdAt: string
}

export interface ContentPiece {
  id: string
  workspaceId: string
  topicId: string
  platform: string
  title: string
  content: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduledFor?: string
  publishedAt?: string
  engagementStats?: {
    likes: number
    shares: number
    comments: number
  }
  createdAt: string
  updatedAt: string
}

export interface GenerationSettings {
  llmProvider: 'openai' | 'claude' | 'mistral'
  model: string
  language: 'en' | 'fr' | 'es' | 'de'
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative'
}