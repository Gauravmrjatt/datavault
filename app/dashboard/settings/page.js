"use client";

import { useEffect, useState } from 'react';
import { GaiaBadge, GaiaButton, GaiaCard, GaiaInput } from '@/components/gaia/primitives';
import { GaiaThemeSwitcher } from '@/components/gaia/theme-switcher';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/api-client';

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [botToken, setBotToken] = useState('');
  const [storageChatId, setStorageChatId] = useState('');
  const [configured, setConfigured] = useState(false);
  const [source, setSource] = useState('none');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    apiRequest('/api/drive/telegram-config', { token })
      .then((payload) => {
        setConfigured(payload.configured);
        setSource(payload.source || 'none');
        setStorageChatId(payload.storageChatId || '');
      })
      .catch((error) => setMessage(error.message));
  }, [token]);

  const saveConfig = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = await apiRequest('/api/drive/telegram-config', {
        token,
        method: 'PUT',
        body: {
          botToken,
          storageChatId
        }
      });
      setConfigured(payload.configured);
      setSource('user');
      setBotToken('');
      setMessage('Telegram credentials saved securely for this account.');
    } catch (error) {
      setMessage(error.message || 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[var(--font-space)] text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-[hsl(var(--gaia-muted))]">Account, Telegram connectivity, security, and theme controls.</p>
      </div>

      <GaiaCard>
        <p className="text-sm font-semibold">Account</p>
        <p className="mt-1 text-sm">{user?.name}</p>
        <p className="text-xs text-[hsl(var(--gaia-muted))]">{user?.email}</p>
      </GaiaCard>

      <GaiaCard className="space-y-2">
        <p className="text-sm font-semibold">Telegram storage connection</p>
        <GaiaInput
          value={botToken}
          onChange={(event) => setBotToken(event.target.value)}
          placeholder="Bot token (e.g. 123456:ABC...)"
          type="password"
        />
        <GaiaInput
          value={storageChatId}
          onChange={(event) => setStorageChatId(event.target.value)}
          placeholder="Storage chat/channel (e.g. @mychannel or -100123...)"
        />
        <div className="flex items-center gap-2">
          <GaiaBadge>{configured ? `Configured (${source})` : 'Not configured'}</GaiaBadge>
          <GaiaButton onClick={saveConfig} disabled={saving || !botToken || !storageChatId}>
            {saving ? 'Saving...' : 'Save credentials'}
          </GaiaButton>
        </div>
        {message ? <p className="text-xs text-[hsl(var(--gaia-muted))]">{message}</p> : null}
      </GaiaCard>

      <GaiaCard className="md:hidden">
        <p className="mb-3 text-sm font-semibold">Appearance</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[hsl(var(--gaia-muted))]">Switch between light and dark mode</span>
          <GaiaThemeSwitcher />
        </div>
      </GaiaCard>

      <GaiaCard>
        <p className="text-sm font-semibold">Security</p>
        <ul className="mt-2 space-y-1 text-xs text-[hsl(var(--gaia-muted))]">
          <li>JWT authentication with 30-day expiry</li>
          <li>Per-route rate limiting and helmet hardening</li>
          <li>Share links with token + optional expiry</li>
          <li>Telegram bot token encrypted at rest</li>
        </ul>
      </GaiaCard>
    </div>
  );
}
