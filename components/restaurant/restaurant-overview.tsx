"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QrCode, Users, TrendingUp, Bell, Star } from "lucide-react"
import { useAppSelector } from "@/app/hooks"

// Mock data - in real app, this would come from API
const stats = {
  totalQRScans: 1247,
  loyaltyPointsIssued: 3456,
  groupMembers: 12,
  monthlyRevenue: 8750,
  activeCustomers: 234,
  averageRating: 4.8,
}

const recentActivity = [
  {
    id: 1,
    type: "qr_scan",
    message: "Customer scanned QR code - 50 loyalty points issued",
    time: "2 minutes ago",
    points: 50,
  },
  {
    id: 2,
    type: "group_invite",
    message: "Burger Palace accepted your group invitation",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "payment",
    message: "Monthly subscription payment processed successfully",
    time: "2 hours ago",
    amount: 79,
  },
  {
    id: 4,
    type: "customer",
    message: "New customer registered through your QR code",
    time: "4 hours ago",
  },
]

export function RestaurantOverview() {
  const { user } = useAppSelector((state) => state.auth)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.fullName}!</h1>
        <p className="text-muted-foreground">Here's what's happening with {user?.restaurantName} today</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button className="flex items-center space-x-2">
          <QrCode className="h-4 w-4" />
          <span>Generate QR Code</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
          <Users className="h-4 w-4" />
          <span>Invite Restaurant</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
          <Bell className="h-4 w-4" />
          <span>View Notifications</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Code Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQRScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points Issued</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loyaltyPointsIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.groupMembers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">Based on 156 reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {activity.type === "qr_scan" && <QrCode className="h-5 w-5 text-primary" />}
                  {activity.type === "group_invite" && <Users className="h-5 w-5 text-secondary" />}
                  {activity.type === "payment" && <TrendingUp className="h-5 w-5 text-green-600" />}
                  {activity.type === "customer" && <Users className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <div className="flex-shrink-0">
                  {activity.points && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      +{activity.points} pts
                    </Badge>
                  )}
                  {activity.amount && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ${activity.amount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
