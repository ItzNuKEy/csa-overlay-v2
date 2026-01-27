import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { fetchUsers, createUser, updateUser, deleteUser } from "../services/api";
import type { User } from "../types";
import { UserFilters } from "./UserFilters";
import { AddUserForm } from "./AddUserForm";
import { UserTable } from "./UserTable";

interface UsersTabProps {
  onError: (error: string | null) => void;
}

export interface UsersTabRef {
  refresh: () => void;
}

export const UsersTab = forwardRef<UsersTabRef, UsersTabProps>(({ onError }, ref) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [filterAdmins, setFilterAdmins] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    onError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      console.error("[UsersTab] Failed to fetch users:", err);
      onError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useImperativeHandle(ref, () => ({
    refresh: loadUsers,
  }));

  const handleAddUser = async (discordId: string, username?: string) => {
    setAddingUser(true);
    onError(null);
    try {
      await createUser(discordId, username);
      await loadUsers();
    } catch (err: any) {
      console.error("[UsersTab] Failed to add user:", err);
      onError(err.message || "Failed to add user");
    } finally {
      setAddingUser(false);
    }
  };

  const handleToggleActive = async (discordId: string, isActive: boolean) => {
    try {
      onError(null);
      await updateUser(discordId, { is_active: !isActive });
      await loadUsers();
    } catch (err: any) {
      console.error("[UsersTab] Failed to update user:", err);
      onError(err.message || "Failed to update user");
    }
  };

  const handleToggleManagement = async (discordId: string, canManage: boolean) => {
    try {
      onError(null);
      await updateUser(discordId, { can_manage_users: !canManage });
      await loadUsers();
    } catch (err: any) {
      console.error("[UsersTab] Failed to update management permission:", err);
      onError(err.message || "Failed to update management permission");
    }
  };

  const handleDelete = async (discordId: string) => {
    if (!confirm(`Are you sure you want to delete user ${discordId}?`)) return;

    try {
      onError(null);
      await deleteUser(discordId);
      await loadUsers();
    } catch (err: any) {
      console.error("[UsersTab] Failed to delete user:", err);
      onError(err.message || "Failed to delete user");
    }
  };

  // Filter users based on active filters
  const filteredUsers = users.filter((user) => {
    if (filterAdmins && !user.can_manage_users) return false;
    if (filterActive && !user.is_active) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/80 text-sm tracking-wide">Loading users...</div>
      </div>
    );
  }

  return (
    <>
      <UserFilters
        filterAdmins={filterAdmins}
        filterActive={filterActive}
        onToggleAdmins={() => setFilterAdmins(!filterAdmins)}
        onToggleActive={() => setFilterActive(!filterActive)}
      />
      <AddUserForm onSubmit={handleAddUser} isSubmitting={addingUser} />
      <UserTable
        users={users}
        filteredUsers={filteredUsers}
        onToggleActive={handleToggleActive}
        onToggleManagement={handleToggleManagement}
        onDelete={handleDelete}
      />
    </>
  );
});

UsersTab.displayName = "UsersTab";
