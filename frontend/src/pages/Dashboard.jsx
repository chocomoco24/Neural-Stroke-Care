import { useAuth } from '../context/AuthContext';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.user_type === 'doctor') return <DoctorDashboard />;
  return <PatientDashboard />;
}
