import { useState, useEffect } from "react";
import { fetchAccessRequests, approveAccessRequest, denyAccessRequest } from "../services/api";
import type { AccessRequest } from "../types";
import { AccessRequestsTable } from "./AccessRequestsTable";

interface RequestsTabProps {
  onError: (error: string | null) => void;
  onUsersUpdate?: () => void;
}

export function RequestsTab({ onError, onUsersUpdate }: RequestsTabProps) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    onError(null);
    try {
      const data = await fetchAccessRequests("pending");
      setRequests(data);
    } catch (err: any) {
      console.error("[RequestsTab] Failed to fetch requests:", err);
      onError(err.message || "Failed to fetch access requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (discordId: string) => {
    if (!confirm(`Are you sure you want to approve access request for ${discordId}?`)) return;

    try {
      onError(null);
      await approveAccessRequest(discordId);
      // Refresh requests list and notify parent to refresh users
      await loadRequests();
      if (onUsersUpdate) {
        onUsersUpdate();
      }
    } catch (err: any) {
      console.error("[RequestsTab] Failed to approve request:", err);
      onError(err.message || "Failed to approve access request");
    }
  };

  const handleDeny = async (discordId: string) => {
    if (!confirm(`Are you sure you want to deny access request for ${discordId}?`)) return;

    try {
      onError(null);
      await denyAccessRequest(discordId);
      // Refresh requests list
      await loadRequests();
    } catch (err: any) {
      console.error("[RequestsTab] Failed to deny request:", err);
      onError(err.message || "Failed to deny access request");
    }
  };

  return (
    <AccessRequestsTable
      requests={requests}
      loading={loading}
      onRefresh={loadRequests}
      onApprove={handleApprove}
      onDeny={handleDeny}
    />
  );
}
