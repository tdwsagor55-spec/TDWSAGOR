import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
    signIn,
    signUp,
    googleSignIn,
    sendResetCode,
    verifyResetCode,
  } = useAuth();
  const { t, language } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authModalMode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) setError(res.error || 'Failed to sign in');
      } else if (authModalMode === 'signup') {
        const res = await signUp(name, email, password);
        if (!res.success) setError(res.error || 'Failed to create account');
      } else if (authModalMode === 'forgot') {
        if (!email) {
          setError(language === 'bn' ? 'অনুগ্রহ করে ইমেইল লিখুন' : 'Please enter your email');
          setLoading(false);
          return;
        }
        await sendResetCode(email);
        setSuccessMsg(language === 'bn' ? 'রিসেট কোড পাঠানো হয়েছে! ডেমো কোড: 123456' : 'Reset code sent! Demo code: 123456');
        setTimeout(() => setAuthModalMode('reset'), 1200);
      } else if (authModalMode === 'reset') {
        const valid = await verifyResetCode(resetCode, newPassword);
        if (valid) {
          setSuccessMsg(language === 'bn' ? 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে! লগইন করুন।' : 'Password updated successfully! Please sign in.');
          setTimeout(() => setAuthModalMode('signin'), 1000);
        } else {
          setError(language === 'bn' ? 'ভুল কোড! ডেমো কোড হিসেবে 123456 লিখুন।' : 'Invalid code! Use demo code: 123456');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#11101d] border border-purple-800/40 rounded-2xl shadow-2xl shadow-purple-900/30 overflow-hidden">
        {/* Top glowing ambient gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400" />
        
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1.5px] mb-3 shadow-lg shadow-purple-600/30">
              <div className="w-full h-full bg-[#11101d] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {authModalMode === 'signin' && t.welcomeBack}
              {authModalMode === 'signup' && t.createAccount}
              {authModalMode === 'forgot' && t.forgotPassword}
              {authModalMode === 'reset' && t.resetPassword}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'bn'
                ? 'ম্যাজিক ফটো ও ভিডিও এডিটরের সব প্রিমিয়াম ফিচার আনলক করুন'
                : 'Unlock all premium tools, cloud saves & HD exports'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.fullName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম' : 'e.g. Alex Morgan'}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {(authModalMode === 'signin' || authModalMode === 'signup' || authModalMode === 'forgot') && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {(authModalMode === 'signin' || authModalMode === 'signup') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    {t.password}
                  </label>
                  {authModalMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setAuthModalMode('forgot')}
                      className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {t.forgotPassword}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {authModalMode === 'reset' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t.enterCode}
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm tracking-widest text-center focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t.newPassword}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span>{t.loading}</span>
              ) : (
                <>
                  <span>
                    {authModalMode === 'signin' && t.signIn}
                    {authModalMode === 'signup' && t.signUp}
                    {authModalMode === 'forgot' && t.sendResetLink}
                    {authModalMode === 'reset' && t.resetPassword}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign In */}
          {(authModalMode === 'signin' || authModalMode === 'signup') && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#11101d] px-2 text-slate-500 font-semibold tracking-wider">
                    {language === 'bn' ? 'অথবা' : 'Or continue with'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={googleSignIn}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2.5 transition-colors active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t.googleSignIn}</span>
              </button>
            </>
          )}

          {/* Toggle mode footer */}
          <div className="mt-5 text-center text-xs text-slate-400">
            {authModalMode === 'signin' && (
              <p>
                {language === 'bn' ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalMode('signup')}
                  className="text-purple-400 font-semibold hover:underline"
                >
                  {t.signUp}
                </button>
              </p>
            )}
            {authModalMode === 'signup' && (
              <p>
                {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalMode('signin')}
                  className="text-purple-400 font-semibold hover:underline"
                >
                  {t.signIn}
                </button>
              </p>
            )}
            {(authModalMode === 'forgot' || authModalMode === 'reset') && (
              <button
                type="button"
                onClick={() => setAuthModalMode('signin')}
                className="text-purple-400 font-semibold hover:underline"
              >
                {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Sign In'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
