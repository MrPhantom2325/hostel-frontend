import { NextResponse } from "next/server"

// This would be replaced with actual database calls in a real application
const students = [
  { id: "ST001", name: "Rahul Sharma", room: "A-101", phone: "9876543210", date: "12 Aug 2023" },
  { id: "ST002", name: "Priya Patel", room: "B-205", phone: "8765432109", date: "15 Aug 2023" },
  { id: "ST003", name: "Amit Kumar", room: "C-304", phone: "7654321098", date: "20 Aug 2023" },
  { id: "ST004", name: "Sneha Gupta", room: "D-102", phone: "6543210987", date: "25 Aug 2023" },
  { id: "ST005", name: "Vikram Singh", room: "A-203", phone: "5432109876", date: "01 Sep 2023" },
  { id: "ST006", name: "Neha Verma", room: "B-105", phone: "4321098765", date: "05 Sep 2023" },
  { id: "ST007", name: "Rajesh Khanna", room: "C-202", phone: "3210987654", date: "10 Sep 2023" },
  { id: "ST008", name: "Ananya Mishra", room: "D-301", phone: "2109876543", date: "15 Sep 2023" },
]

export async function GET() {
  // In a real application, this would fetch data from a database
  return NextResponse.json(students)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Generate a new ID (in a real app, this would be handled by the database)
    const newId = `ST${String(students.length + 1).padStart(3, "0")}`

    // Format the date
    const currentDate = new Date()
    const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString("default", { month: "short" })} ${currentDate.getFullYear()}`

    // Create the new student object
    const newStudent = {
      id: newId,
      name: data.name,
      room: `${data.roomBlock}-${data.roomNumber}`,
      phone: data.phone,
      date: formattedDate,
    }

    // In a real application, this would save to a database
    students.push(newStudent)

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
