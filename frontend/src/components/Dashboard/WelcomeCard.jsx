import { useAuth } from '../../context/AuthContext';

export default function WelcomeCard() {
  const { user, ROLE_LABELS, currentRole } = useAuth();

  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-card">
      <p className="text-sm text-primary-600 font-medium mb-1">{greeting}</p>
      <h2 className="text-xl font-bold text-gray-800 mb-1">
        Welcome back, {user.name.split(' ')[0]}
      </h2>
      <p className="text-sm text-gray-500">
        Logged in as <span className="text-primary-600 font-medium">{ROLE_LABELS[currentRole]}</span> at{' '}
        <span className="text-gray-700 font-medium">{user.school}</span>
      </p>
    </div>
  );
}
