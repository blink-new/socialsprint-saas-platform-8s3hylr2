import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import blink from '@/blink/client'

export default function ScrapeTest() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testScrape = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL to test')
      return
    }

    setLoading(true)
    try {
      console.log('🔄 Testing scrape for URL:', url)
      
      const scrapedData = await blink.data.scrape(url)
      console.log('✅ Scrape successful:', scrapedData)
      
      setResult({
        success: true,
        data: scrapedData,
        contentLength: scrapedData.markdown?.length || 0,
        title: scrapedData.metadata?.title || 'No title found',
        description: scrapedData.metadata?.description || 'No description found'
      })
      
      toast.success('Scraping successful!')
      
    } catch (error: any) {
      console.error('❌ Scrape failed:', error)
      
      setResult({
        success: false,
        error: error.message || 'Unknown error',
        details: error
      })
      
      toast.error(`Scraping failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Web Scraping Test</CardTitle>
          <p className="text-sm text-gray-600">
            Test what the Blink SDK can actually scrape from the web
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter URL to test (e.g., https://example.com/blog/post)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testScrape} disabled={loading}>
              {loading ? 'Scraping...' : 'Test Scrape'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Try these URLs:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><code>https://blog.vercel.com/</code> - Public blog</li>
              <li><code>https://github.com/vercel/next.js</code> - GitHub repo</li>
              <li><code>https://news.ycombinator.com/</code> - Hacker News</li>
              <li><code>https://www.linkedin.com/pulse/</code> - LinkedIn articles (public)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
              {result.success ? '✅ Scraping Successful' : '❌ Scraping Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title:</label>
                    <p className="text-sm text-gray-600">{result.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content Length:</label>
                    <p className="text-sm text-gray-600">{result.contentLength} characters</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description:</label>
                  <p className="text-sm text-gray-600">{result.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Scraped Content (First 500 chars):</label>
                  <Textarea
                    value={result.data.markdown?.substring(0, 500) + '...' || 'No content found'}
                    readOnly
                    className="h-32"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Full Response:</label>
                  <Textarea
                    value={JSON.stringify(result.data, null, 2)}
                    readOnly
                    className="h-48 font-mono text-xs"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-red-600">Error:</label>
                  <p className="text-sm text-red-600">{result.error}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Error Details:</label>
                  <Textarea
                    value={JSON.stringify(result.details, null, 2)}
                    readOnly
                    className="h-32 font-mono text-xs"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}