"use client";

import { useEffect, useState } from 'react';
import { GaiaBadge, GaiaButton, GaiaCard, GaiaInput } from '@/components/gaia/primitives';
import { GaiaThemeSwitcher } from '@/components/gaia/theme-switcher';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/api-client';
import { SettingsSkeleton } from '../loading-skeletons/settings-skeleton';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [botToken, setBotToken] = useState('');
  const [storageChatId, setStorageChatId] = useState('');
  const [configured, setConfigured] = useState(false);
  const [source, setSource] = useState('none');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBotToken, setShowBotToken] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiRequest('/api/drive/telegram-config', { token })
      .then((payload) => {
        setConfigured(payload.configured);
        setSource(payload.source || 'none');
        setStorageChatId(payload.storageChatId || '');
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
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

  if (loading && !configured && source === 'none') {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-4 px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--gaia-text))]">Settings</h1>
        <p className="text-sm text-[hsl(var(--gaia-muted))] mt-1">Manage your account and preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <GaiaCard className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--gaia-accent)/0.1)] flex items-center justify-center">
              <Icon icon="lucide:user" className="w-6 h-6 text-[hsl(var(--gaia-accent))]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[hsl(var(--gaia-text))]">Account</p>
              <p className="text-sm truncate">{user?.name}</p>
              <p className="text-xs text-[hsl(var(--gaia-muted))] truncate">{user?.email}</p>
            </div>
          </div>
        </GaiaCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <GaiaCard className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Icon icon="lucide:send" className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--gaia-text))]">Telegram Storage</p>
              <p className="text-xs text-[hsl(var(--gaia-muted))]">Connect your bot for unlimited storage</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[hsl(var(--gaia-muted))] uppercase tracking-wider">
                Bot Token
              </label>
              <div className="relative">
                <GaiaInput
                  value={botToken}
                  onChange={(event) => setBotToken(event.target.value)}
                  placeholder="123456:ABC-DEF..."
                  type={showBotToken ? "text" : "password"}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowBotToken(!showBotToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-[hsl(var(--gaia-soft))] text-[hsl(var(--gaia-muted))] transition-colors"
                >
                  <Icon icon={showBotToken ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[hsl(var(--gaia-muted))] uppercase tracking-wider">
                Storage Chat ID
              </label>
              <GaiaInput
                value={storageChatId}
                onChange={(event) => setStorageChatId(event.target.value)}
                placeholder="@mychannel or -100123..."
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <GaiaBadge className={configured ? 'bg-green-500/10 text-green-500' : 'bg-[hsl(var(--gaia-soft))]'}>
                <Icon icon={configured ? "lucide:check-circle-2" : "lucide:circle"} className="w-3 h-3 mr-1" />
                {configured ? `Connected (${source})` : 'Not configured'}
              </GaiaBadge>
              <GaiaButton 
                onClick={saveConfig} 
                disabled={saving || !botToken || !storageChatId}
                className="flex-1 sm:flex-none shadow-lg shadow-[hsl(var(--gaia-accent)/0.3)]"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:save" className="w-4 h-4" />
                    <span>Save credentials</span>
                  </div>
                )}
              </GaiaButton>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-[hsl(var(--gaia-accent)/0.1)] border border-[hsl(var(--gaia-accent)/0.2)]"
              >
                <p className="text-xs text-[hsl(var(--gaia-text))] flex items-start gap-2">
                  <Icon icon="lucide:info" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{message}</span>
                </p>
              </motion.div>
            )}
          </div>
        </GaiaCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <GaiaCard className="md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--gaia-accent)/0.1)] flex items-center justify-center">
                <Icon icon="lucide:palette" className="w-5 h-5 text-[hsl(var(--gaia-accent))]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--gaia-text))]">Appearance</p>
                <p className="text-xs text-[hsl(var(--gaia-muted))]">Light or dark mode</p>
              </div>
            </div>
            <GaiaThemeSwitcher />
          </div>
        </GaiaCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <GaiaCard className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <Icon icon="lucide:shield-check" className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--gaia-text))]">Security</p>
              <p className="text-xs text-[hsl(var(--gaia-muted))]">Your data is protected</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-[hsl(var(--gaia-muted))]">
            <li className="flex items-start gap-2">
              <Icon icon="lucide:check" className="w-4 h-4 flex-shrink-0 text-green-500 mt-0.5" />
              <span>JWT authentication with 30-day expiry</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:check" className="w-4 h-4 flex-shrink-0 text-green-500 mt-0.5" />
              <span>Per-route rate limiting and helmet hardening</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:check" className="w-4 h-4 flex-shrink-0 text-green-500 mt-0.5" />
              <span>Share links with token + optional expiry</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:check" className="w-4 h-4 flex-shrink-0 text-green-500 mt-0.5" />
              <span>Telegram bot token encrypted at rest</span>
            </li>
          </ul>
        </GaiaCard>
      </motion.div>
    </div>
  );
}
