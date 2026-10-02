import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, switchUser, users } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          showToast(res.message, 'success');
          onClose();
        } else {
          showToast(res.message, 'error');
        }
      } else {
        if (!name) {
          showToast('Please provide your full name', 'warning');
          setLoading(false);
          return;
        }
        const res = await register(name, email, password);
        if (res.success) {
          showToast(res.message, 'success');
          onClose();
        } else {
          showToast(res.message, 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    const target = users.find((u) => u.id === userId);
    showToast(`Switched account to ${target?.name} (${target?.role})`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#181c23]/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-[#ffffff] rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 border border-[#dec0b7]/40 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#dfe2ec]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9f3c16] text-[24px]">auto_stories</span>
            <div>
              <h2 className="font-headline-sm text-[#181c23] leading-none">
                {mode === 'login' ? 'Welcome to BookNest' : 'Join the Reading Circle'}
              </h2>
              <span className="font-label-sm text-[#57423b] text-[11px] mt-0.5 block">
                {mode === 'login' ? 'Access your orders, library & reservations' : 'Curated editions & member privileges'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#ebeef7] flex items-center justify-center text-[#57423b] transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-[#ebeef7] p-1 rounded-xl my-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login' ? 'bg-[#ffffff] text-[#9f3c16] shadow-sm' : 'text-[#57423b] hover:text-[#181c23]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register' ? 'bg-[#ffffff] text-[#9f3c16] shadow-sm' : 'text-[#57423b] hover:text-[#181c23]'
            }`}
          >
            Register Reader
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="font-label-sm text-[#57423b] uppercase tracking-wider block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Gabriel Garcia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 bg-[#f1f3fd] rounded-xl text-sm text-[#181c23] focus:outline-none focus:bg-[#ffffff] focus:ring-1 focus:ring-[#9f3c16] transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="font-label-sm text-[#57423b] uppercase tracking-wider block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="reader@booknest.press"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#f1f3fd] rounded-xl text-sm text-[#181c23] focus:outline-none focus:bg-[#ffffff] focus:ring-1 focus:ring-[#9f3c16] transition-colors"
              required
            />
          </div>

          <div>
            <label className="font-label-sm text-[#57423b] uppercase tracking-wider block mb-1">
              {mode === 'login' ? 'Password or Passcode' : 'Create Secure Password'}
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#f1f3fd] rounded-xl text-sm text-[#181c23] focus:outline-none focus:bg-[#ffffff] focus:ring-1 focus:ring-[#9f3c16] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#9f3c16] hover:bg-[#bf542c] text-[#ffffff] font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">login</span>
            )}
            <span>{mode === 'login' ? 'Enter Reading Parlor' : 'Create Account'}</span>
          </button>
        </form>

        {/* Quick Demo Switcher Section */}
        <div className="mt-5 pt-4 border-t border-[#dfe2ec]">
          <span className="font-label-sm text-[#8a726a] text-[10px] uppercase tracking-wider block mb-2 font-bold text-center">
            Instant Test Persona Switch
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('usr-8902')}
              className="p-2 rounded-xl bg-[#f1f3fd] hover:bg-[#dfe2ec] text-left transition-colors border border-[#dfe2ec]/60"
            >
              <div className="font-semibold text-xs text-[#181c23]">Elena Rostova</div>
              <div className="text-[10px] text-[#9f3c16]">Curator's Circle VIP</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('usr-admin')}
              className="p-2 rounded-xl bg-[#ffdbcf]/40 hover:bg-[#ffdbcf]/70 text-left transition-colors border border-[#dec0b7]"
            >
              <div className="font-semibold text-xs text-[#822801]">Admin / Curator</div>
              <div className="text-[10px] text-[#9f3c16]">Store Administrator</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('usr-8841')}
              className="p-2 rounded-xl bg-[#f1f3fd] hover:bg-[#dfe2ec] text-left transition-colors border border-[#dfe2ec]/60"
            >
              <div className="font-semibold text-xs text-[#181c23]">Marcus Aurelius</div>
              <div className="text-[10px] text-[#57423b]">Collector Reader</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('usr-1004')}
              className="p-2 rounded-xl bg-[#f1f3fd] hover:bg-[#dfe2ec] text-left transition-colors border border-[#dfe2ec]/60"
            >
              <div className="font-semibold text-xs text-[#181c23]">Clara Moreau</div>
              <div className="text-[10px] text-[#904d00]">Staff Curator</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
