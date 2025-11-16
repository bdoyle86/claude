import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: '/home',
      icon: 'home',
      label: 'Home'
    },
    {
      path: '/packs',
      icon: 'cards',
      label: 'Packs'
    },
    {
      path: '/collection',
      icon: 'collections_bookmark',
      label: 'Collection'
    },
    {
      path: '/store',
      icon: 'storefront',
      label: 'Store'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-dark/95 backdrop-blur-md border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
                active ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <span
                className={`material-symbols-outlined transition-all duration-200 ${
                  active ? 'text-2xl font-bold' : 'text-xl'
                }`}
                style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
              >
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
