import axios from 'axios';

// Base URL for the Java backend
const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// Student APIs
export async function getStudents() {
  const response = await api.get('/students');
  return response.data;
}

export async function getStudentById(id: string) {
  const response = await api.get(`/students/${id}`);
  return response.data;
}

export async function addStudent(studentData: any) {
  const response = await api.post('/students', studentData);
  return response.data;
}

export async function updateStudent(id: string, studentData: any) {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
}

export async function deleteStudent(id: string) {
  const response = await api.delete(`/students/${id}`);
  return response.data;
}

// Room APIs
export async function getRooms() {
  const response = await api.get('/rooms');
  return response.data;
}

export async function getRoomById(id: string) {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
}

export async function addRoom(roomData: any) {
  const response = await api.post('/rooms', roomData);
  return response.data;
}

export async function updateRoom(id: string, roomData: any) {
  const response = await api.put(`/rooms/${id}`, roomData);
  return response.data;
}

export async function deleteRoom(id: string) {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
}

// Attendance APIs
export async function getAttendance(date: string) {
  const response = await api.get(`/attendance/date?date=${date}`);
  return response.data;
}

export async function saveAttendance(date: string, attendance: Record<string, boolean>) {
  try {
    const response = await api.post('/attendance', {
      date,
      attendance
    });
    return response.data;
  } catch (error) {
    console.error('Error saving attendance:', error);
    throw error;
  }
}

export async function getAttendanceByDateRange(startDate: string, endDate: string) {
  const response = await api.get(`/attendance/range?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
}

export async function getAttendanceByStudent(studentId: string) {
  const response = await api.get(`/attendance/student/${studentId}`);
  return response.data;
}
