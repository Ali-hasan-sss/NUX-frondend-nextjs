"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, Send, Check, X } from "lucide-react"

// Mock data - in real app, this would come from API
const myGroups = [
  {
    id: "group_1",
    name: "Downtown Food District",
    memberCount: 8,
    role: "admin",
    description: "Restaurants in the downtown area collaborating on loyalty programs",
    members: [
      "Pizza Palace",
      "Burger House",
      "Sushi Master",
      "Taco Bell",
      "Coffee Corner",
      "Pasta Place",
      "Salad Bar",
      "Ice Cream Shop",
    ],
  },
  {
    id: "group_2",
    name: "Fast Casual Alliance",
    memberCount: 5,
    role: "member",
    description: "Fast casual restaurants sharing best practices",
    members: ["Pizza Palace", "Sandwich Shop", "Bowl Place", "Wrap Station", "Smoothie Bar"],
  },
]

const pendingInvites = [
  {
    id: "invite_1",
    groupName: "Healthy Eats Network",
    invitedBy: "Green Garden Cafe",
    description: "A network of health-focused restaurants",
    receivedDate: "2024-01-28",
  },
  {
    id: "invite_2",
    groupName: "Local Business Coalition",
    invitedBy: "Main Street Deli",
    description: "Supporting local businesses together",
    receivedDate: "2024-01-25",
  },
]

const sentInvites = [
  {
    id: "sent_1",
    restaurantName: "Burger Palace",
    groupName: "Downtown Food District",
    status: "pending",
    sentDate: "2024-01-29",
  },
  {
    id: "sent_2",
    restaurantName: "Noodle House",
    groupName: "Fast Casual Alliance",
    status: "accepted",
    sentDate: "2024-01-20",
  },
]

export function GroupManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteData, setInviteData] = useState({
    restaurantName: "",
    groupId: "",
  })

  const handleSendInvite = () => {
    // In real app, this would make an API call
    console.log("Sending invite:", inviteData)
    setIsInviting(false)
    setInviteData({ restaurantName: "", groupId: "" })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Group Management</h1>
          <p className="text-muted-foreground">Manage your restaurant groups and collaborations</p>
        </div>
        <Button onClick={() => setIsInviting(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Restaurant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">My Groups</p>
                <p className="text-2xl font-bold">{myGroups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm font-medium">Pending Invites</p>
                <p className="text-2xl font-bold">{pendingInvites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Connections</p>
                <p className="text-2xl font-bold">{myGroups.reduce((sum, group) => sum + group.memberCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Invite Form */}
      {isInviting && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Restaurant to Group</CardTitle>
            <CardDescription>Send an invitation to another restaurant to join one of your groups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant Name</label>
                <Input
                  placeholder="Enter restaurant name"
                  value={inviteData.restaurantName}
                  onChange={(e) => setInviteData({ ...inviteData, restaurantName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Group</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={inviteData.groupId}
                  onChange={(e) => setInviteData({ ...inviteData, groupId: e.target.value })}
                >
                  <option value="">Select a group</option>
                  {myGroups
                    .filter((group) => group.role === "admin")
                    .map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSendInvite}>Send Invitation</Button>
              <Button variant="outline" onClick={() => setIsInviting(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Groups that have invited you to join</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{invite.groupName}</h4>
                    <p className="text-sm text-muted-foreground">{invite.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invited by {invite.invitedBy} • {new Date(invite.receivedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Check className="mr-1 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Groups */}
      <Card>
        <CardHeader>
          <CardTitle>My Groups</CardTitle>
          <CardDescription>Groups you're a member of</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myGroups.map((group) => (
              <Card key={group.id} className="border-2">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                    <Badge variant={group.role === "admin" ? "default" : "secondary"}>{group.role}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{group.memberCount} members</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.members.slice(0, 4).map((member, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{member.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{member}</span>
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{group.members.length - 4} more</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        View Members
                      </Button>
                      {group.role === "admin" && (
                        <Button size="sm" variant="outline" className="bg-transparent">
                          Manage Group
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sent Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Invitations</CardTitle>
          <CardDescription>Invitations you've sent to other restaurants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{invite.restaurantName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Invited to {invite.groupName} • {new Date(invite.sentDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={invite.status === "accepted" ? "default" : "secondary"}>{invite.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
