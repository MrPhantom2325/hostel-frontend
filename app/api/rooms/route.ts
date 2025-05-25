import { NextResponse } from "next/server"

// This would be replaced with actual database calls in a real application
const rooms = [
  { room: "A-101", block: "A", floor: "1", capacity: 2, occupants: 2, status: "occupied" },
  { room: "A-102", block: "A", floor: "1", capacity: 2, occupants: 1, status: "occupied" },
  { room: "B-201", block: "B", floor: "2", capacity: 3, occupants: 3, status: "occupied" },
  { room: "B-202", block: "B", floor: "2", capacity: 3, occupants: 0, status: "available" },
  { room: "C-301", block: "C", floor: "3", capacity: 2, occupants: 2, status: "occupied" },
  { room: "C-302", block: "C", floor: "3", capacity: 2, occupants: 0, status: "maintenance" },
  { room: "D-401", block: "D", floor: "4", capacity: 1, occupants: 1, status: "occupied" },
  { room: "D-402", block: "D", floor: "4", capacity: 1, occupants: 0, status: "available" },
]

export async function GET() {
  // In a real application, this would fetch data from a database
  return NextResponse.json(rooms)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Create the new room object
    const newRoom = {
      room: `${data.block}-${data.roomNumber}`,
      block: data.block,
      floor: data.floor,
      capacity: Number.parseInt(data.capacity),
      occupants: 0,
      status: "available",
    }

    // In a real application, this would save to a database
    rooms.push(newRoom)

    return NextResponse.json(newRoom, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
