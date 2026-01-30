// Utility functions for user data handling

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

// Helper to find user by ID from profiles array
export const findUserById = (profiles: UserProfile[], userId: string | null): UserProfile | null => {
  if (!userId || !profiles) return null;
  return profiles.find(profile => profile.id === userId) || null;
};

// Helper to get user display name
export const getUserDisplayName = (profile: UserProfile | null): string => {
  if (!profile) return 'Unknown User';
  return profile.full_name || profile.email || 'Unknown User';
};

// Helper to get user initials for avatar
export const getUserInitials = (profile: UserProfile | null): string => {
  if (!profile) return 'U';
  
  if (profile.full_name) {
    const names = profile.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }
  
  return profile.email[0].toUpperCase();
};