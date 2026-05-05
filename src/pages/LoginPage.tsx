// src/pages/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, signup, isLoggedIn } = useAuth();

  const from = (location.state as any)?.from || '/profile';

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isLoggedIn) navigate(from, { replace: true });
  }, [isLoggedIn]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Welcome back! 🌿');
        navigate(from, { replace: true });
      } else {
        await signup({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        });
        await login(formData.email, formData.password);
        toast.success('Welcome to Rastlina! 🌱');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg =
        err?.email?.[0] ||
        err?.password?.[0] ||
        err?.detail ||
        err?.non_field_errors?.[0] ||
        'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex pt-20 lg:pt-0" style={{ fontFamily: "'Lora', Georgia, serif" }}>
      {/* Left decorative panel — hidden on mobile */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] relative overflow-hidden p-10 pt-32"
        style={{ background: 'linear-gradient(160deg, #2d4a2d 0%, #1a3320 50%, #0f2418 100%)' }}
      >
        {/* Botanical texture overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cellipse cx='20' cy='20' rx='3' ry='8' transform='rotate(-30 20 20)'/%3E%3Cellipse cx='60' cy='10' rx='2' ry='6' transform='rotate(20 60 10)'/%3E%3Cellipse cx='100' cy='30' rx='3' ry='9' transform='rotate(-50 100 30)'/%3E%3Cellipse cx='10' cy='70' rx='2' ry='7' transform='rotate(40 10 70)'/%3E%3Cellipse cx='50' cy='80' rx='3' ry='10' transform='rotate(-20 50 80)'/%3E%3Cellipse cx='90' cy='90' rx='2' ry='6' transform='rotate(60 90 90)'/%3E%3Cellipse cx='110' cy='60' rx='3' ry='8' transform='rotate(-70 110 60)'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px',
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-white font-bold text-xl tracking-wide">Rastlina</span>
          </div>
          <p className="text-emerald-200/60 text-sm">Plants & Nature, Delivered</p>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-white/80 text-2xl leading-relaxed font-light italic">
            "In every walk with nature, one receives far more than he seeks."
          </blockquote>
          <p className="text-emerald-300/60 text-sm">— John Muir</p>
        </div>

        <div className="relative z-10">
          <div className="flex gap-2 items-center">
            {['🌿', '🪴', '🌱', '🌸', '🍃'].map((emoji, i) => (
              <span
                key={i}
                className="text-2xl opacity-70"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
          <p className="text-emerald-200/40 text-xs mt-3">Bringing nature indoors since 2024</p>
        </div>
      </div>

      {/* Right — form panel */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12 lg:pt-32" 
        style={{ background: '#faf9f6' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-200" />
            </div>
            <span className="font-bold text-emerald-900 text-lg">Rastlina</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">
              {isLogin ? 'Welcome back' : 'Join Rastlina'}
            </h1>
            <p className="text-stone-500 text-sm">
              {isLogin
                ? 'Sign in to your account to continue'
                : 'Create an account and bring nature home'}
            </p>
          </div>

          {/* Toggle tabs */}
          <div className="flex mb-8 border border-stone-200 rounded-xl overflow-hidden" style={{ background: '#f0ede6' }}>
            {['Sign In', 'Sign Up'].map((label, idx) => (
              <button
                key={label}
                onClick={() => setIsLogin(idx === 0)}
                className="flex-1 py-2.5 text-sm font-semibold transition-all duration-200"
                style={{
                  background: (isLogin ? idx === 0 : idx === 1) ? '#2d4a2d' : 'transparent',
                  color: (isLogin ? idx === 0 : idx === 1) ? '#fff' : '#78716c',
                  borderRadius: '10px',
                  margin: '3px',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">First Name</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Priya"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2d4a2d] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Sharma"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 transition"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Phone (optional)</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 pr-11 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repeat your password"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 pr-11 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/40 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              style={{
                background: isLoading ? '#6b7c6b' : '#2d4a2d',
                color: '#fff',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[10px] text-stone-400 uppercase tracking-widest" style={{ background: '#faf9f6' }}>
                or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <GoogleLoginButton
            onSuccess={async (code: string) => {
              setIsLoading(true);
              try {
                await googleLogin(code);
                toast.success('Signed in with Google! 🌿');
                navigate(from, { replace: true });
              } catch {
                toast.error('Google sign-in failed. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }}
          />

          <p className="text-center text-xs text-stone-500 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold hover:underline"
              style={{ color: '#2d4a2d' }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleLoginButton({ onSuccess }: { onSuccess: (code: string) => void }) {
  const googleLogin = useGoogleLogin({
    onSuccess: (res: any) => {
      if (res?.code) {
        onSuccess(res.code);
      } else {
        toast.error('Google login failed: No code received');
      }
    },
    onError: () => toast.error('Google login failed'),
    flow: 'auth-code',
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      className="w-full flex items-center justify-center gap-3 border border-stone-200 rounded-xl py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition bg-white"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}