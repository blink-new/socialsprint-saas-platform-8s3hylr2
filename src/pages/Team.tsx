import { Users, Plus, Crown, Edit, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Team() {
  const teamMembers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      joinedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'editor',
      joinedAt: '2024-01-20'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'viewer',
      joinedAt: '2024-01-25'
    }
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />
      case 'editor':
        return <Edit className="w-4 h-4" />
      case 'viewer':
        return <Shield className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800'
      case 'viewer':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage team members and their access permissions
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                People with access to this workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                      <div className="text-xs text-gray-400">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getRoleColor(member.role)}>
                      <span className="flex items-center space-x-1">
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </span>
                    </Badge>
                    {member.role !== 'owner' && (
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Role Permissions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                What each role can do
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium">Owner</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>• Full workspace access</li>
                  <li>• Manage team members</li>
                  <li>• Billing and settings</li>
                  <li>• Delete workspace</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Edit className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Editor</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>• Create and edit content</li>
                  <li>• Schedule posts</li>
                  <li>• View analytics</li>
                  <li>• Manage sources</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Viewer</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>• View content</li>
                  <li>• View analytics</li>
                  <li>• Export reports</li>
                  <li>• Read-only access</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Members</span>
                <span className="font-semibold">{teamMembers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Owners</span>
                <span className="font-semibold">
                  {teamMembers.filter(m => m.role === 'owner').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Editors</span>
                <span className="font-semibold">
                  {teamMembers.filter(m => m.role === 'editor').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Viewers</span>
                <span className="font-semibold">
                  {teamMembers.filter(m => m.role === 'viewer').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}