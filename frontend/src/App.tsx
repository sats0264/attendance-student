import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Enrollment from './pages/Enrollment';
import Students from './pages/Students';
import Classes from './pages/Classes';
import History from './pages/History';
import ClassDetail from './pages/ClassDetail';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="enrollment" element={<Enrollment />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<Classes />} />
          <Route path="classes/:classId" element={<ClassDetail />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
      <AuthProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="enrollment" element={<ProtectedRoute requireAdmin={true}><Enrollment /></ProtectedRoute>} />
            <Route path="students" element={<ProtectedRoute requireAdmin={true}><Students /></ProtectedRoute>} />
            <Route path="classes" element={<Classes />} />
            <Route path="classes/:classId" element={<ClassDetail />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
