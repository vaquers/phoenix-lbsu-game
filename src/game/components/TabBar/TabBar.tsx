import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TabBar.css';

import gameIcon from '../../../../assets/symbols/gamecontroller.svg';
import gameIconFill from '../../../../assets/symbols/gamecontroller.fill.svg';
import pixelIcon from '../../../../assets/symbols/pencil.tip.crop.circle.svg';
import pixelIconFill from '../../../../assets/symbols/pencil.tip.crop.circle.fill.svg';
import trophyIcon from '../../../../assets/symbols/trophy copy.svg';
import trophyIconFill from '../../../../assets/symbols/trophy.fill copy.svg';
import cartIcon from '../../../../assets/symbols/cart copy.svg';
import cartIconFill from '../../../../assets/symbols/cart.fill copy.svg';

const TABS = [
  {
    id: 'game',
    label: 'Игра',
    icon: gameIcon,
    iconActive: gameIconFill,
    path: '/game',
  },
  {
    id: 'pixel-board',
    label: 'Доска',
    icon: pixelIcon,
    iconActive: pixelIconFill,
    path: '/pixel-board',
  },
  {
    id: 'leaderboard',
    label: 'Рейтинг',
    icon: trophyIcon,
    iconActive: trophyIconFill,
    path: '/leaderboard',
  },
  {
    id: 'shop',
    label: 'Магазин',
    icon: cartIcon,
    iconActive: cartIconFill,
    path: '/shop',
  },
] as const;

export const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeIndex = useMemo(() => {
    const idx = TABS.findIndex((t) => location.pathname.startsWith(t.path));
    return idx >= 0 ? idx : 0;
  }, [location.pathname]);

  return (
    <div className="tabbar-wrapper">
      <nav className="tabbar-pill" aria-label="Main navigation">
        <div
          className="tabbar-active-indicator"
          style={{
            width: `calc((100% - 8px) / ${TABS.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={tab.id}
              type="button"
              className={`tabbar-item${isActive ? ' active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-current={isActive ? 'page' : undefined}
            >
              <img
                src={isActive ? tab.iconActive : tab.icon}
                alt=""
                className="tabbar-icon"
              />
              <span className="tabbar-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
