import { useAuth } from '@/contexts/AuthContext';
import { VolunteerDashboard } from './VolunteerDashboard';
import { HostDashboard } from './HostDashboard';

export function Dashboard() {
  const { user } = useAuth();

  // Render appropriate dashboard based on user type
  if (user?.user_type === 'host') {
    return <HostDashboard />;
  }

  // Default to volunteer dashboard
  return <VolunteerDashboard />;
}