"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import AddRoomDialog from "@/components/add-room-dialog"
import { getRooms } from "@/lib/api-client"

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [blockFilter, setBlockFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Stats for the summary cards
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    occupancyRate: 0,
  })

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)
        const data = await getRooms()
        setRooms(data)

        // Calculate stats
        const total = data.length
        const occupied = data.filter((room: any) => room.status === "occupied").length
        const available = data.filter((room: any) => room.status === "available").length
        const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0

        setStats({
          total,
          occupied,
          available,
          occupancyRate,
        })

        setError(null)
      } catch (err) {
        console.error("Error fetching rooms:", err)
        setError("Failed to load rooms. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  // Filter rooms based on search query, block filter, and status filter
  const filteredRooms = rooms.filter((room: any) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBlock = blockFilter === "all" || room.block === blockFilter
    const matchesStatus = statusFilter === "all" || room.status === statusFilter

    return matchesSearch && matchesBlock && matchesStatus
  })

  const handleRoomAdded = async () => {
    // Refresh the room list after adding a new room
    try {
      const data = await getRooms()
      setRooms(data)

      // Recalculate stats
      const total = data.length
      const occupied = data.filter((room: any) => room.status === "occupied").length
      const available = data.filter((room: any) => room.status === "available").length
      const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0

      setStats({
        total,
        occupied,
        available,
        occupancyRate,
      })
    } catch (err) {
      console.error("Error refreshing rooms:", err)
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Hostel Management System</h1>
          <nav className="ml-auto flex gap-4">
            <Link href="/" className="text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/students" className="text-sm font-medium">
              Students
            </Link>
            <Link href="/rooms" className="text-sm font-medium text-primary">
              Rooms
            </Link>
            <Link href="/attendance" className="text-sm font-medium">
              Attendance
            </Link>
          </nav>
        </div>
      </header>
      <div className="container flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
          <AddRoomDialog onRoomAdded={handleRoomAdded} />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupied}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.available}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Room Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search rooms..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={blockFilter} onValueChange={setBlockFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blocks</SelectItem>
                  <SelectItem value="A">Block A</SelectItem>
                  <SelectItem value="B">Block B</SelectItem>
                  <SelectItem value="C">Block C</SelectItem>
                  <SelectItem value="D">Block D</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            {loading ? (
              <div className="text-center py-8">Loading rooms...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Number</TableHead>
                      <TableHead>Block</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Occupants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No rooms found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRooms.map((room: any) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.roomNumber}</TableCell>
                          <TableCell>{room.block}</TableCell>
                          <TableCell>{room.floor}</TableCell>
                          <TableCell>{room.capacity}</TableCell>
                          <TableCell>{room.occupants}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                room.status === "occupied"
                                  ? "default"
                                  : room.status === "available"
                                    ? "success"
                                    : "destructive"
                              }
                            >
                              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
