import { CreditCard, Check, Zap, Crown, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Billing() {
  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '5 social profiles',
        '10 posts per month',
        'Basic analytics',
        'Email support'
      ],
      current: true,
      popular: false
    },
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'For small teams and creators',
      features: [
        '15 social profiles',
        '100 posts per month',
        'Advanced analytics',
        'Priority support',
        'Team collaboration',
        'Custom branding'
      ],
      current: false,
      popular: true
    },
    {
      name: 'Pro',
      price: '$79',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Unlimited social profiles',
        '500 posts per month',
        'Advanced AI models',
        'White-label solution',
        'API access',
        'Custom integrations',
        'Dedicated support'
      ],
      current: false,
      popular: false
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Unlimited posts',
        'Custom AI training',
        'On-premise deployment',
        'SLA guarantee',
        'Dedicated account manager'
      ],
      current: false,
      popular: false
    }
  ]

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'Free Trial':
        return <Zap className="w-5 h-5" />
      case 'Starter':
        return <Star className="w-5 h-5" />
      case 'Pro':
        return <Crown className="w-5 h-5" />
      case 'Enterprise':
        return <CreditCard className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-gray-600 mt-1">
          Choose the perfect plan for your content creation needs
        </p>
      </div>

      {/* Current Plan */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Free Trial</h3>
              <p className="text-sm text-gray-600">
                14 days remaining • Expires on Jan 30, 2024
              </p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.popular
                ? 'border-indigo-500 shadow-lg scale-105'
                : plan.current
                ? 'border-green-500'
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600 text-white">Current Plan</Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.name)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                {plan.price}
                <span className="text-sm font-normal text-gray-500">
                  {plan.period}
                </span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button
                className={`w-full ${
                  plan.current
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
                disabled={plan.current}
              >
                {plan.current
                  ? 'Current Plan'
                  : plan.name === 'Enterprise'
                  ? 'Contact Sales'
                  : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Posts This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 / 10</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">2 posts remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 / 5</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">2 profiles available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 / 1</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-amber-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Upgrade for more</p>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your recent transactions and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No billing history yet</p>
            <p className="text-sm">Your invoices will appear here after your first payment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}