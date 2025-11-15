import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Welcome = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark overflow-x-hidden">
      <div className="@container">
        <div className="@[480px]:p-4">
          <div
            className="flex min-h-screen flex-col gap-8 bg-cover bg-center bg-no-repeat items-center justify-between p-6"
            style={{
              backgroundImage: `linear-gradient(rgba(16, 25, 34, 0.8) 0%, rgba(16, 25, 34, 1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuA6Hy9zvmP5CmY8QODPjznGHrlJT9evQFpwz8OjgHWCw4WNGON315JZuKDjUNe1A4J72taFzOZud0v6gBkcpMFq18wyUUl_T4bxpqy-X81NTPujX-Eg-Bp-wLTuhM3UdMaYdgaydWK5YNltTPFsHctG3xwJcz6SP_VFdO-ssm6labHDqlRQ-6a_2xo5E8QVwusu0MykSXdB62qM9X4EiTNrEnDnFkK9Xv-Pl4NsIa-4s4LJSCTzkxbnRBs7vfMFaXE1bHA9SoFU")`
            }}
          >
            {/* Logo */}
            <div className="flex flex-col items-center text-center gap-1">
              <span className="material-symbols-outlined text-primary text-5xl">sports_soccer</span>
              <h3 className="text-white text-xl font-bold tracking-tight">SOCCER SQUAD</h3>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-8 w-full max-w-sm">
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">
                  Your Ultimate Soccer Team Awaits!
                </h1>
              </div>

              <div className="flex flex-col gap-4 text-left">
                <div className="flex items-center gap-4 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">style</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-white">Collect Your Heroes</h3>
                    <p className="text-sm text-white/70">Find and collect cards of your favorite players.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-white">Build Your Dream Squad</h3>
                    <p className="text-sm text-white/70">Create the perfect lineup for any challenge.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">emoji_events</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-white">Challenge Friends & Rivals</h3>
                    <p className="text-sm text-white/70">Compete against others to prove your skills.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              <button
                onClick={() => navigate('/register')}
                className="flex min-w-[84px] w-full max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
              >
                <span className="truncate">GET STARTED</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex min-w-[84px] w-full max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-white/10 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-colors"
              >
                <span className="truncate">Already have an account? Log In</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
