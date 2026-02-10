"use client";

import { useEffect, useState } from 'react';
import { GaiaBadge, GaiaButton, GaiaCard } from '@/components/gaia/primitives';
import { apiRequest } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

export default function TrashPage() {
  const { token } = useAuth();
  const [files, setFiles] = useState([]);

  const fetchTrash = async () => {
    const payload = await apiRequest('/api/drive/items?includeTrashed=true', { token });
    setFiles((payload.files || []).filter((file) => file.isTrashed));
  };

  useEffect(() => {
    if (token) fetchTrash();
  }, [token]);

  const restore = async (id) => {
    await apiRequest(`/api/drive/files/${id}/restore`, { token, method: 'POST' });
    fetchTrash();
  };

  const removeForever = async (id) => {
    await apiRequest(`/api/drive/files/${id}/permanent`, { token, method: 'DELETE' });
    fetchTrash();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[var(--font-space)] text-2xl font-semibold">Trash</h1>
        <p className="text-sm text-[hsl(var(--gaia-muted))]">Restore files or permanently delete Telegram chunks.</p>
      </div>

      {files.map((file) => (
        <GaiaCard key={file._id} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">{file.name}</p>
            <GaiaBadge>{new Date(file.trashedAt || file.updatedAt).toLocaleString()}</GaiaBadge>
          </div>
          <div className="flex gap-2">
            <GaiaButton variant="ghost" onClick={() => restore(file._id)}>Restore</GaiaButton>
            <GaiaButton variant="danger" onClick={() => removeForever(file._id)}>Delete forever</GaiaButton>
          </div>
        </GaiaCard>
      ))}

      {!files.length ? <GaiaCard>Trash is empty.</GaiaCard> : null}
    </div>
  );
}
