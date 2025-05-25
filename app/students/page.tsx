"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import AddStudentDialog from "@/components/add-student-dialog"
import { getStudents } from "@/lib/api-client"

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [blockFilter, setBlockFilter] = useState("all")

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const data = await getStudents()
        setStudents(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching students:", err)
        setError("Failed to load students. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Filter students based on search query and block filter
  const filteredStudents = students.filter((student: any) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBlock = blockFilter === "all" || (student.room && student.room.startsWith(blockFilter))

    return matchesSearch && matchesBlock
  })

  const handleStudentAdded = async () => {
    // Refresh the student list after adding a new student
    try {
      const data = await getStudents()
      setStudents(data)
    } catch (err) {
      console.error("Error refreshing students:", err)
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
            <Link href="/students" className="text-sm font-medium text-primary">
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <AddStudentDialog onStudentAdded={handleStudentAdded} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
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
              <div className="text-center py-8">Loading students...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joining Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.id}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.room}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell>{student.joiningDate}</TableCell>
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
