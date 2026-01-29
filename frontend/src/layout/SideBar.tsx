import React from 'react';
import { Home, BarChart3, Network, Zap, ChevronLeft, ChevronRight, HelpCircle, User } from 'lucide-react';

interface SideBarProps {
  onSelectOption?: (option: string) => void;
}

const SideBar: React.FC<SideBarProps> = ({ onSelectOption }) => {
  const [activeOption, setActiveOption] = React.useState('home');
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleOptionClick = (option: string) => {
    setActiveOption(option);
    onSelectOption?.(option);
  };

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'redes-pases', label: 'Redes de Pases', icon: Network },
    { id: 'eventos', label: 'Eventos', icon: Zap },
  ];

  return (
    <aside className={`
      bg-slate-900 border-r border-slate-800 flex flex-col py-6 
      transition-all duration-300 ease-in-out relative
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-6 mb-6 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
          <img
            src="/app_logo.PNG"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        {!isCollapsed && (
          <h1 className="text-white font-bold text-xl whitespace-nowrap">LiveBall</h1>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full 
                   flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700
                   transition-colors duration-200 z-10"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Separator */}
      <div className="mx-6 mb-6 h-px bg-slate-800"></div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-2 px-3 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeOption === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleOptionClick(item.id)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg
                transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto px-3 pt-4 border-t border-slate-800">
        <div className="flex flex-col gap-2">
          {/* Help Button */}
          <button
            onClick={() => console.log('Ayuda')}
            className={`
              flex items-center gap-3 px-3 py-3 rounded-lg
              bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Ayuda' : undefined}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">Ayuda</span>
            )}
          </button>

          {/* User Button */}
          <button
            onClick={() => console.log('Usuario')}
            className={`
              flex items-center gap-3 px-3 py-3 rounded-lg
              bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Usuario' : undefined}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">Usuario</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
