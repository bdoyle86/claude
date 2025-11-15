import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/home');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display bg-background-dark text-white overflow-x-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div
            className="w-full h-full bg-center bg-no-repeat bg-cover"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuATM9_KeNRCy-bYvxeyx1zj0nN6CdFR-4fEQzCtAUG20W5tk2rvOZTbXgGGgfYOAlnjQtX8qYBr6i19hNvPa-oI49LQhbCEcrmEzw4HfHSRnZb2ndwuufdvzU_oeNSpkH_9hWeVRIh6Hd3jseGGg6isBwYN3allL1IWpSZavOkPOEHFYumYvEtzzxA4OYAzDVSUtsqIGyqk7MuKObuzXlbXASwYqYBIaeFbbWWCwJiYmb-hSLQa5oXl8HSM0kvPUfYDSqgVJReC")',
              opacity: 0.3
            }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 flex w-full grow flex-col justify-between p-6 sm:p-8">
        {/* Header section with Logo */}
        <header className="flex flex-col items-center pt-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '40px' }}>
              sports_soccer
            </span>
            <h2 className="font-bangers text-4xl tracking-wider text-white">SQUADZ</h2>
          </div>
        </header>

        {/* Main form section */}
        <main className="flex flex-col items-center w-full max-w-md mx-auto grow justify-center pb-8">
          <h1 className="text-white tracking-wider text-[48px] font-bangers leading-none text-center pb-8 text-glow">
            CREATE YOUR SQUAD
          </h1>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {localError && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {localError}
              </div>
            )}

            <label className="flex flex-col w-full">
              <p className="text-[#BCCCDC] text-base font-medium leading-normal pb-2">Username</p>
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <div className="text-[#BCCCDC] flex border-none bg-white/10 items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white/10 h-14 placeholder:text-[#BCCCDC]/60 p-4 pl-3 text-base font-normal leading-normal"
                  placeholder="Enter your username"
                />
              </div>
            </label>

            <label className="flex flex-col w-full">
              <p className="text-[#BCCCDC] text-base font-medium leading-normal pb-2">Email</p>
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <div className="text-[#BCCCDC] flex border-none bg-white/10 items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined">email</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white/10 h-14 placeholder:text-[#BCCCDC]/60 p-4 pl-3 text-base font-normal leading-normal"
                  placeholder="Enter your email"
                />
              </div>
            </label>

            <label className="flex flex-col w-full">
              <p className="text-[#BCCCDC] text-base font-medium leading-normal pb-2">Password</p>
              <div className="flex w-full flex-1 items-stretch rounded-lg">
                <div className="text-[#BCCCDC] flex border-none bg-white/10 items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white/10 h-14 placeholder:text-[#BCCCDC]/60 p-4 pl-3 rounded-r-lg"
                  placeholder="Enter your password (min 6 characters)"
                />
              </div>
            </label>

            <div className="w-full pt-8 pb-5">
              <button
                type="submit"
                disabled={loading}
                className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 bg-primary text-[#0A1931] text-lg font-bold leading-normal tracking-widest shadow-[0_4px_20px_rgba(0,255,133,0.3)] hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="truncate">{loading ? 'REGISTERING...' : 'REGISTER'}</span>
              </button>
            </div>

            <p className="text-center text-[#BCCCDC] text-sm font-normal">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-white hover:text-primary transition-colors">
                Log In
              </Link>
            </p>
          </form>
        </main>

        {/* Footer section */}
        <footer className="w-full max-w-md mx-auto text-center pb-4">
          <p className="text-[#BCCCDC]/50 text-xs">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Register;
