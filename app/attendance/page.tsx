"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Search } from "lucide-react"
import { format } from "date-fns"
import TakeAttendanceDialog from "@/components/take-attendance-dialog"
import { getStudents, getAttendance } from "@/lib/api-client"

interface AttendanceRecord {
  id: string
  name: string
  room: string
  checkIn: string
  checkOut: string
  status: string
}

interface AttendanceStats {
  totalStudents: number
  presentToday: number
  absentToday: number
  attendanceRate: number
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [blockFilter, setBlockFilter] = useState("all")

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true)
        const [students, attendance] = await Promise.all([
          getStudents(),
          getAttendance(format(selectedDate, 'yyyy-MM-dd'))
        ])

        setAttendanceRecords(attendance)

        // Calculate stats
        const totalStudents = students.length
        const presentToday = attendance.filter((record: any) => record.status === "present").length
        const absentToday = totalStudents - presentToday
        const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0

        setStats({
          totalStudents,
          presentToday,
          absentToday,
          attendanceRate
        })

        setError(null)
      } catch (err) {
        console.error("Error fetching attendance data:", err)
        setError("Failed to load attendance data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceData()
  }, [selectedDate])

  // Filter attendance records based on search query and block filter
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBlock = blockFilter === "all" || record.room.startsWith(blockFilter)

    return matchesSearch && matchesBlock
  })

  const handleAttendanceUpdated = async () => {
    // Refresh attendance data after taking attendance
    try {
      const attendance = await getAttendance(format(selectedDate, 'yyyy-MM-dd'))
      setAttendanceRecords(attendance)
      
      // Recalculate stats
      const presentToday = attendance.filter((record: any) => record.status === "present").length
      const absentToday = stats.totalStudents - presentToday
      const attendanceRate = stats.totalStudents > 0 ? Math.round((presentToday / stats.totalStudents) * 100) : 0

      setStats(prev => ({
        ...prev,
        presentToday,
        absentToday,
        attendanceRate
      }))
    } catch (err) {
      console.error("Error refreshing attendance data:", err)
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
            <Link href="/rooms" className="text-sm font-medium">
              Rooms
            </Link>
            <Link href="/attendance" className="text-sm font-medium text-primary">
              Attendance
            </Link>
          </nav>
        </div>
      </header>
      <div className="container flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
          <div className="flex gap-2">
            <TakeAttendanceDialog onAttendanceUpdated={handleAttendanceUpdated} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.presentToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.absentToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{format(selectedDate, "PPP")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            {loading ? (
              <div className="text-center py-8">Loading attendance records...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Check-out Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.id}</TableCell>
                          <TableCell className="font-medium">{record.name}</TableCell>
                          <TableCell>{record.room}</TableCell>
                          <TableCell>{record.checkIn}</TableCell>
                          <TableCell>{record.checkOut}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === "present" ? "default" : "destructive"}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
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
