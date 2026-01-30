import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, UserCog, Shield, ShieldCheck, User } from 'lucide-react';
import { format } from 'date-fns';

type AppRole = 'super_admin' | 'admin' | 'team_member';

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: AppRole | null;
}

const roleColors: Record<AppRole, string> = {
  super_admin: 'bg-destructive/20 text-destructive border-destructive/30',
  admin: 'bg-primary/20 text-primary border-primary/30',
  team_member: 'bg-muted text-muted-foreground border-muted',
};

const roleIcons: Record<AppRole, typeof Shield> = {
  super_admin: ShieldCheck,
  admin: Shield,
  team_member: User,
};

export default function Team() {
  const { userRole } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isSuperAdmin = userRole === 'super_admin';

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const membersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.id)?.role || null,
      }));

      setMembers(membersWithRoles);
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: AppRole) => {
    if (!isSuperAdmin) {
      toast.error('Only super admins can change roles');
      return;
    }

    try {
      // Check if user already has a role
      const existingMember = members.find(m => m.id === userId);
      
      if (existingMember?.role) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (error) throw error;
      }

      setMembers(members.map(m => 
        m.id === userId ? { ...m, role: newRole } : m
      ));
      toast.success('Role updated');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const getInitials = (email: string, name?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const filteredMembers = members.filter(member =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const columns: Column<TeamMember>[] = [
    {
      header: 'Member',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.avatar_url || ''} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {getInitials(row.email, row.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.full_name || 'No name'}</p>
            <p className="text-sm text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => {
        const role = row.role || 'team_member';
        const RoleIcon = roleIcons[role];
        
        if (isSuperAdmin) {
          return (
            <Select
              value={role}
              onValueChange={(value) => updateRole(row.id, value as AppRole)}
            >
              <SelectTrigger className="w-40">
                <div className="flex items-center gap-2">
                  <RoleIcon className="h-4 w-4" />
                  <span className="capitalize">{role.replace('_', ' ')}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Super Admin
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="team_member">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Team Member
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          );
        }

        return (
          <Badge variant="outline" className={roleColors[role]}>
            <RoleIcon className="h-3 w-3 mr-1" />
            {role.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      header: 'Joined',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            <p className="text-muted-foreground">
              Manage team members and roles
              {!isSuperAdmin && ' (View only - contact super admin to change roles)'}
            </p>
          </div>
        </motion.div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredMembers}
          loading={loading}
          emptyMessage="No team members found"
        />

        {!isSuperAdmin && (
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="flex items-start gap-3">
              <UserCog className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Role Management</p>
                <p className="text-sm text-muted-foreground">
                  Only super administrators can modify user roles. Contact a super admin if you need role changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
