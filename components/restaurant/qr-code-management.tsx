"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QrCode, Download, Eye, MoreHorizontal, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data - in real app, this would come from API
const qrCodes = [
  {
    id: "qr_1",
    name: "Table 1 - Loyalty Points",
    type: "loyalty",
    pointsValue: 50,
    scans: 234,
    status: "active",
    createdDate: "2024-01-15",
    lastScanned: "2024-01-30",
  },
  {
    id: "qr_2",
    name: "Table 2 - Loyalty Points",
    type: "loyalty",
    pointsValue: 50,
    scans: 189,
    status: "active",
    createdDate: "2024-01-15",
    lastScanned: "2024-01-29",
  },
  {
    id: "qr_3",
    name: "Special Promotion - Double Points",
    type: "promotion",
    pointsValue: 100,
    scans: 67,
    status: "active",
    createdDate: "2024-01-20",
    lastScanned: "2024-01-30",
  },
  {
    id: "qr_4",
    name: "Takeaway Counter",
    type: "loyalty",
    pointsValue: 25,
    scans: 145,
    status: "inactive",
    createdDate: "2024-01-10",
    lastScanned: "2024-01-25",
  },
]

export function QRCodeManagement() {
  const [isCreating, setIsCreating] = useState(false)
  const [newQRCode, setNewQRCode] = useState({
    name: "",
    type: "loyalty",
    pointsValue: 50,
  })

  const handleCreateQRCode = () => {
    // In real app, this would make an API call
    console.log("Creating QR code:", newQRCode)
    setIsCreating(false)
    setNewQRCode({ name: "", type: "loyalty", pointsValue: 50 })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">QR Code Management</h1>
          <p className="text-muted-foreground">Monitor and manage your loyalty point QR codes</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create QR Code
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total QR Codes</p>
                <p className="text-2xl font-bold">{qrCodes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Scans</p>
                <p className="text-2xl font-bold">{qrCodes.reduce((sum, qr) => sum + qr.scans, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-green-600"></div>
              <div>
                <p className="text-sm font-medium">Active Codes</p>
                <p className="text-2xl font-bold">{qrCodes.filter((qr) => qr.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-secondary"></div>
              <div>
                <p className="text-sm font-medium">Points Issued</p>
                <p className="text-2xl font-bold">
                  {qrCodes.reduce((sum, qr) => sum + qr.scans * qr.pointsValue, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create QR Code Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New QR Code</CardTitle>
            <CardDescription>Generate a new QR code for loyalty points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qr-name">QR Code Name</Label>
                <Input
                  id="qr-name"
                  placeholder="e.g., Table 3 - Loyalty Points"
                  value={newQRCode.name}
                  onChange={(e) => setNewQRCode({ ...newQRCode, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qr-type">Type</Label>
                <Select value={newQRCode.type} onValueChange={(value) => setNewQRCode({ ...newQRCode, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loyalty">Loyalty Points</SelectItem>
                    <SelectItem value="promotion">Special Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="points-value">Points Value</Label>
                <Input
                  id="points-value"
                  type="number"
                  value={newQRCode.pointsValue}
                  onChange={(e) => setNewQRCode({ ...newQRCode, pointsValue: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateQRCode}>Create QR Code</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your QR Codes</CardTitle>
          <CardDescription>Manage all your loyalty point QR codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Points Value</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Scanned</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qrCodes.map((qrCode) => (
                  <TableRow key={qrCode.id}>
                    <TableCell>
                      <div className="font-medium">{qrCode.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Created {new Date(qrCode.createdDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={qrCode.type === "promotion" ? "default" : "secondary"}>
                        {qrCode.type === "loyalty" ? "Loyalty" : "Promotion"}
                      </Badge>
                    </TableCell>
                    <TableCell>{qrCode.pointsValue} pts</TableCell>
                    <TableCell>{qrCode.scans}</TableCell>
                    <TableCell>
                      <Badge variant={qrCode.status === "active" ? "default" : "secondary"}>{qrCode.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(qrCode.lastScanned).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
