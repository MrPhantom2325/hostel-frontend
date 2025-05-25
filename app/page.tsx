"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DoorOpen, Users, CalendarCheck, Home } from "lucide-react"
import { getStudents, getRooms, getAttendance } from "@/lib/api-client"

interface DashboardStats {
  totalStudents: number
  availableRooms: number
  totalRooms: number
  presentToday: number
  attendanceRate: number
  blocks: number
}

interface CheckInRecord {
  id: string
  name: string
  room: string
  checkIn: string
  checkOut: string
  status: string
}

interface RoomOccupancy {
  block: string
  total: number
  occupied: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    availableRooms: 0,
    totalRooms: 0,
    presentToday: 0,
    attendanceRate: 0,
    blocks: 0
  })
  const [recentCheckins, setRecentCheckins] = useState<CheckInRecord[]>([])
  const [roomOccupancy, setRoomOccupancy] = useState<RoomOccupancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Fetch all required data
        const [students, rooms, attendance] = await Promise.all([
          getStudents(),
          getRooms(),
          getAttendance(new Date().toISOString().split('T')[0])
        ])

        // Calculate stats
        const totalStudents = students.length
        const totalRooms = rooms.length
        const availableRooms = rooms.filter((room: any) => room.status === "available").length
        const presentToday = attendance.filter((record: any) => record.status === "present").length
        const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0

        // Get unique blocks
        const blocks = new Set(rooms.map((room: any) => room.block)).size

        setStats({
          totalStudents,
          availableRooms,
          totalRooms,
          presentToday,
          attendanceRate,
          blocks
        })

        // Get recent check-ins (last 5 present students)
        const recent = attendance
          .filter((record: any) => record.status === "present")
          .sort((a: any, b: any) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
          .slice(0, 5)
        setRecentCheckins(recent)

        // Calculate room occupancy by block
        const occupancy = Array.from(new Set(rooms.map((room: any) => room.block))).map(block => {
          const blockRooms = rooms.filter((room: any) => room.block === block)
          return {
            block: `Block ${block}`,
            total: blockRooms.length,
            occupied: blockRooms.filter((room: any) => room.status === "occupied").length
          }
        })
        setRoomOccupancy(occupancy)

        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Hostel Management System</h1>
          <nav className="ml-auto flex gap-4">
            <Link href="/" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            <Link href="/students" className="text-sm font-medium">
              Students
            </Link>
            <Link href="/rooms" className="text-sm font-medium">
              Rooms
            </Link>
            <Link href="/attendance" className="text-sm font-medium">
              Attendance
            </Link>
          </nav>
        </div>
      </header>
      <div className="container flex-1 space-y-6 p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}
        
        {loading ? (
          <div className="text-center py-8">Loading dashboard data...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.availableRooms}</div>
                  <p className="text-xs text-muted-foreground">Out of {stats.totalRooms} total rooms</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.presentToday}</div>
                  <p className="text-xs text-muted-foreground">{stats.attendanceRate}% attendance rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blocks</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.blocks}</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Check-ins</CardTitle>
                  <CardDescription>Students who checked in during the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentCheckins.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">No recent check-ins</div>
                    ) : (
                      recentCheckins.map((record: any) => (
                        <div key={record.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{record.name}</p>
                            <p className="text-sm text-muted-foreground">Room: {record.room}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">{record.checkIn}</div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Room Occupancy</CardTitle>
                  <CardDescription>Current occupancy status by block</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roomOccupancy.map((block: any) => (
                      <div key={block.block} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{block.block}</p>
                          <p className="text-sm text-muted-foreground">
                            {block.occupied}/{block.total} rooms
                          </p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${(block.occupied / block.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
