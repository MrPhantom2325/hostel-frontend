import { NextResponse } from "next/server"

// This would be replaced with actual database calls in a real application
const attendanceRecords = [
  {
    date: "2023-05-23",
    records: [
      {
        id: "ST001",
        name: "Rahul Sharma",
        room: "A-101",
        checkIn: "08:30 AM",
        checkOut: "09:45 PM",
        status: "present",
      },
      { id: "ST002", name: "Priya Patel", room: "B-205", checkIn: "09:15 AM", checkOut: "10:20 PM", status: "present" },
      { id: "ST003", name: "Amit Kumar", room: "C-304", checkIn: "10:45 AM", checkOut: "08:30 PM", status: "present" },
      { id: "ST004", name: "Sneha Gupta", room: "D-102", checkIn: "11:20 AM", checkOut: "09:15 PM", status: "present" },
      {
        id: "ST005",
        name: "Vikram Singh",
        room: "A-203",
        checkIn: "12:05 PM",
        checkOut: "11:00 PM",
        status: "present",
      },
      { id: "ST006", name: "Neha Verma", room: "B-105", checkIn: "-", checkOut: "-", status: "absent" },
      {
        id: "ST007",
        name: "Rajesh Khanna",
        room: "C-202",
        checkIn: "09:30 AM",
        checkOut: "10:45 PM",
        status: "present",
      },
      { id: "ST008", name: "Ananya Mishra", room: "D-301", checkIn: "-", checkOut: "-", status: "absent" },
    ],
  },
]

export async function GET(request: Request) {
  // Get the date from the URL query parameters
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  // Find the attendance record for the specified date
  const record = attendanceRecords.find((r) => r.date === date)

  if (record) {
    return NextResponse.json(record.records)
  } else {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { date, attendance } = data

    // Find if there's an existing record for this date
    const existingRecordIndex = attendanceRecords.findIndex((r) => r.date === date)

    // Mock student data - in a real app, this would come from the database
    const students = [
      { id: "ST001", name: "Rahul Sharma", room: "A-101" },
      { id: "ST002", name: "Priya Patel", room: "B-205" },
      { id: "ST003", name: "Amit Kumar", room: "C-304" },
      { id: "ST004", name: "Sneha Gupta", room: "D-102" },
      { id: "ST005", name: "Vikram Singh", room: "A-203" },
      { id: "ST006", name: "Neha Verma", room: "B-105" },
      { id: "ST007", name: "Rajesh Khanna", room: "C-202" },
      { id: "ST008", name: "Ananya Mishra", room: "D-301" },
    ]

    // Create attendance records
    const records = students.map((student) => {
      const isPresent = attendance[student.id] === true
      return {
        id: student.id,
        name: student.name,
        room: student.room,
        checkIn: isPresent
          ? `${Math.floor(Math.random() * 4) + 8}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")} AM`
          : "-",
        checkOut: isPresent
          ? `${Math.floor(Math.random() * 3) + 8}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")} PM`
          : "-",
        status: isPresent ? "present" : "absent",
      }
    })

    // Update or add the attendance record
    if (existingRecordIndex !== -1) {
      attendanceRecords[existingRecordIndex].records = records
    } else {
      attendanceRecords.push({
        date,
        records,
      })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 })
  }
}
