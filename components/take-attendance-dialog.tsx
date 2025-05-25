"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { getStudents, saveAttendance } from "@/lib/api-client"

interface Student {
  id: string
  name: string
  room: string
}

interface TakeAttendanceDialogProps {
  onAttendanceUpdated: () => void
}

export default function TakeAttendanceDialog({ onAttendanceUpdated }: TakeAttendanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBlock, setSelectedBlock] = useState("all")
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [attendance, setAttendance] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const data = await getStudents()
        setStudents(data)
        
        // Initialize attendance state
        const initialAttendance = data.reduce((acc: Record<string, boolean>, student: Student) => {
          acc[student.id] = true // Default to present
          return acc
        }, {} as Record<string, boolean>)
        
        setAttendance(initialAttendance)
        setError(null)
      } catch (err) {
        console.error("Error fetching students:", err)
        setError("Failed to load students. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchStudents()
    }
  }, [open])

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBlock = selectedBlock === "all" || student.room.startsWith(selectedBlock)
    return matchesSearch && matchesBlock
  })

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: isPresent,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await saveAttendance(new Date().toISOString().split('T')[0], attendance)
      onAttendanceUpdated()
      setOpen(false)
    } catch (error) {
      console.error("Error submitting attendance:", error)
      setError("Failed to save attendance. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Take Attendance</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Take Attendance</DialogTitle>
            <DialogDescription>Mark attendance for students in the hostel.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4 mb-4">
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
              <Select value={selectedBlock} onValueChange={setSelectedBlock}>
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
              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.id}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.room}</TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={attendance[student.id]}
                              onCheckedChange={(checked) => handleAttendanceChange(student.id, checked === true)}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Save Attendance</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
