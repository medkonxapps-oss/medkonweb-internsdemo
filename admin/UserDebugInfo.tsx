import { useAuth } from '@/hooks/useAuth';

export default function UserDebugInfo() {
  const { user, isAdmin, userRole } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 text-xs max-w-sm">
      <h3 className="font-semibold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Role:</strong> {userRole || 'None'}</p>
      </div>
    </div>
  );
}