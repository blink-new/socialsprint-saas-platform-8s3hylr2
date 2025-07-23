import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import blink from '@/blink/client'

export default function ScrapingDebug() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const testScraping = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL to test",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      console.log(`🔍 Testing scraping for URL: ${url}`)
      
      // Test the actual Blink scraping functionality
      const scrapedData = await blink.data.scrape(url)
      
      console.log('✅ Scraping successful:', scrapedData)
      setResult(scrapedData)
      
      toast({
        title: "Success",
        description: `Successfully scraped ${scrapedData.markdown?.length || 0} characters`
      })
      
    } catch (err: any) {
      console.error('❌ Scraping failed:', err)
      setError(err.message || 'Unknown error occurred')
      
      toast({
        title: "Scraping Failed",
        description: err.message || 'Unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const testUrls = [
    'https://blog.vercel.com/',
    'https://github.com/vercel/next.js',
    'https://news.ycombinator.com/',
    'https://www.linkedin.com/in/dan-abramov/',
    'https://overreacted.io/',
    'https://kentcdodds.com/blog'
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scraping Debug Tool</h1>
        <p className="text-gray-600 mt-1">
          Test the actual Blink scraping functionality to see what works and what doesn't.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test URL Scraping</CardTitle>
          <CardDescription>
            Enter a URL to test the Blink data.scrape() functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testScraping} disabled={loading}>
              {loading ? 'Scraping...' : 'Test Scrape'}
            </Button>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Quick test URLs:</p>
            <div className="flex flex-wrap gap-2">
              {testUrls.map((testUrl) => (
                <Button
                  key={testUrl}
                  variant="outline"
                  size="sm"
                  onClick={() => setUrl(testUrl)}
                >
                  {testUrl.replace('https://', '').split('/')[0]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Scraping Results</CardTitle>
            <CardDescription>
              URL: {url}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Metadata:</h4>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(result.metadata || {}, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Content Length:</h4>
              <p className="text-sm">
                Markdown: {result.markdown?.length || 0} characters<br/>
                Extract: {result.extract?.length || 0} characters
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">First 500 Characters:</h4>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto whitespace-pre-wrap">
                {(result.markdown || result.extract || '').slice(0, 500)}...
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Full Response:</h4>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}