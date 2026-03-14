export const API_BASE = import.meta.env.VITE_API_URL || 'https://dcen88remj.execute-api.us-east-1.amazonaws.com/prod';

export interface RecognizedStudent {
  id: string;
  name: string;
}

export interface AttendanceResponse {
  count: number;
  students: RecognizedStudent[];
  error?: string;
}

export interface EnrollResponse {
  message?: string;
  faceId?: string;
  error?: string;
}

export interface Student {
  faceId: string;
  fullName: string;
  studentId: string;
  classId: string;
  photoUrl?: string;
}

export interface ClassItem {
  classId: string;
  promotion: string;
  department?: string;
}

export interface DeleteResponse {
  message?: string;
  error?: string;
}

export interface SessionResponse {
  message?: string;
  sessionId?: string;
  error?: string;
}

export interface SessionRecord {
  sessionId: string;
  classId: string;
  subject: string;
  teacher?: string;
  date: string;
  IsActive?: boolean;
}

export interface AttendanceRecord {
  SessionId: string;
  StudentId: string;
  FullName: string;
  ClassId?: string;
  Timestamp: string;
  Status: 'PRESENT' | 'ABSENT';
  Subject?: string;
  Teacher?: string;
  proofUrl?: string;
}

export const processAttendance = async (
  imageSrc: string,
  sessionId: string
): Promise<AttendanceResponse> => {
  const response = await fetch(`${API_BASE}/recognize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageSrc,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to process attendance');
  }

  return response.json();
};

export const enrollStudent = async (
  imageSrc: string,
  studentId: string,
  studentName: string,
  classId: string,
  promotion: string
): Promise<EnrollResponse> => {
  const response = await fetch(`${API_BASE}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageSrc,
      student_id: studentId,
      student_name: studentName,
      class_id: classId,
      promotion: promotion
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to enroll student');
  }

  return response.json();
};

export const getStudents = async (classId?: string): Promise<Student[]> => {
  const url = classId ? `${API_BASE}/students?classId=${classId}` : `${API_BASE}/students`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to fetch students');
  }

  return response.json();
};

export const deleteStudent = async (faceId: string): Promise<DeleteResponse> => {
  const response = await fetch(`${API_BASE}/students`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      face_id: faceId,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to delete student');
  }

  return response.json();
};

export const createSession = async (
  classId: string,
  subject: string,
  teacher: string
): Promise<SessionResponse> => {
  const response = await fetch(`${API_BASE}/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      class_id: classId,
      subject: subject,
      teacher: teacher
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create session');
  }

  return response.json();
};

export const getSessions = async (): Promise<SessionRecord[]> => {
  const response = await fetch(`${API_BASE}/session`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to fetch sessions');
  }

  return response.json();
};

// Use /details for attendance record fetching as per user's list
export const getAttendance = async (sessionId: string): Promise<AttendanceRecord[]> => {
  const response = await fetch(`${API_BASE}/session/details?sessionId=${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to fetch attendance');
  }

  return response.json();
};

export const getAttendanceByStudent = async (studentId: string, classId: string): Promise<AttendanceRecord[]> => {
  const response = await fetch(`${API_BASE}/students/details?studentId=${studentId}&classId=${classId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to fetch student attendance history');
  }

  return response.json();
};

// Use /classes for creation
export const createClass = async (classId: string, promotion: string): Promise<any> => {
  const response = await fetch(`${API_BASE}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      class_id: classId,
      promotion: promotion
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create class');
  }

  return response.json();
};

// Note: assuming GET /classes might exist or we handle its absence in UI
export const getClasses = async (): Promise<ClassItem[]> => {
  const response = await fetch(`${API_BASE}/classes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Fallback or error if GET not supported
    return [];
  }

  return response.json();
};

export const markAttendanceManual = async (
  _sessionId: string,
  _student: Student,
  _status: 'PRESENT' | 'ABSENT'
): Promise<any> => {
  console.warn("markAttendanceManual: placeholder...");
  return { success: true };
};
