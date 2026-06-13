import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { BRAND_LOGO_FULL, BRAND_LOGO_ICON } from './brandAssets';

const TABS = ['Home', 'Activities', 'Events', 'About', 'Team', 'Contact', 'Dashboard', 'Gamification'];

function ThemeToggle({ theme, onToggle }) {
  const { t } = useTranslation();
  return (
    <button
      className="ns-theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'dark' ? t('nav.switch_light', 'Switch to light mode') : t('nav.switch_dark', 'Switch to dark mode')}
      title={theme === 'dark' ? t('nav.light_mode', 'Light mode') : t('nav.dark_mode', 'Dark mode')}
    >
      {theme === 'dark' ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      className="ns-lang-toggle"
      onClick={toggleLanguage}
      aria-label={`Switch to ${currentLang === 'en' ? 'Hindi' : 'English'}`}
      title={`Switch to ${currentLang === 'en' ? 'Hindi' : 'English'}`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--bdr)',
        borderRadius: '50px',
        padding: '6px 12px',
        color: 'var(--t2)',
        fontSize: '0.8rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 600,
        height: '32px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--c1)';
        e.currentTarget.style.color = 'var(--t1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--bdr)';
        e.currentTarget.style.color = 'var(--t2)';
      }}
    >
      <Globe size={14} aria-hidden="true" />
      <span>{currentLang.toUpperCase()}</span>
    </button>
  );
}

export default function Navbar({ activeTab, onTabChange, onToggleTheme, theme, onApply, onJoin }) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 20);
    const r = () => {
      const isMobile = window.innerWidth <= 768;
      setMobile(isMobile);
      if (!isMobile) setMenuOpen(false);
    };

    window.addEventListener('scroll', s, { passive: true });
    window.addEventListener('resize', r, { passive: true });
    return () => {
      window.removeEventListener('scroll', s);
      window.removeEventListener('resize', r);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleTab = tab => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen(prev => !prev);

  if (mobile) return (
    <nav className="ns-navbar-mobile">
      <div className="ns-mobile-top">
        <div className="ns-mobile-logo-group">
          <img src={BRAND_LOGO_ICON} alt="NexaSphere" className="ns-mobile-logo-ns"/>
          <span className="ns-mobile-brand"><span>NexaSphere</span></span>
        </div>

        <div className="ns-mobile-top-actions">
          <LanguageToggle />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            className="ns-mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label={menuOpen ? t('nav.close_menu', 'Close menu') : t('nav.open_menu', 'Open menu')}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={`ns-mobile-drawer${menuOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label={t('nav.menu', 'Navigation menu')}>
        <div className="ns-mobile-drawer-header">
          <span>{t('nav.menu', 'Menu')}</span>
          <button className="ns-mobile-drawer-close" onClick={closeMenu} aria-label={t('nav.close_menu', 'Close menu')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ns-mobile-drawer-links">
          {TABS.map(tName => (
            <button
              key={tName}
              className={`ns-mobile-drawer-link${activeTab === tName ? ' active' : ''}`}
              onClick={() => handleTab(tName)}
            >
              {t(`nav.${tName.toLowerCase()}`)}
            </button>
          ))}
        </div>

        <div className="ns-mobile-drawer-actions">
          <button className="ns-mobile-tab ns-mobile-cta" onClick={() => { onJoin(); closeMenu(); }} aria-label={t('nav.join_tooltip')}>{t('nav.join')}</button>
          <button className="ns-mobile-tab ns-mobile-cta ns-mobile-cta-apply" onClick={() => { onApply(); closeMenu(); }} aria-label={t('nav.apply_tooltip')}>{t('nav.apply')}</button>
        </div>
      </div>

      {menuOpen && <div className="ns-mobile-backdrop" onClick={closeMenu} />}
    </nav>
  );

  return (
    <nav className={`ns-navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <div className="ns-nav-logos">
          <img src={BRAND_LOGO_FULL} alt="NexaSphere" className="ns-nav-logo-ns ns-nav-logo-icon"/>
          <div className="ns-nav-divider"/>
          <span className="ns-nav-brand">NexaSphere</span>
        </div>

        <ul className="ns-nav-tabs">
          {TABS.map(tName => (
            <li key={tName}>
              <button
                className={`ns-nav-tab${activeTab === tName ? ' active' : ''}${tName === 'Contact' ? ' contact-nav-tab' : ''}`}
                onClick={() => handleTab(tName)}
              >
                {t(`nav.${tName.toLowerCase()}`)}
              </button>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifySelf: 'end' }}>
          <div className="ns-nav-ctas">
            <button className="btn btn-sm btn-outline ns-nav-cta-btn" onClick={onJoin} aria-label={t('nav.join_tooltip')}>{t('nav.join')}</button>
            <button className="btn btn-sm btn-primary ns-nav-cta-btn" onClick={onApply} aria-label={t('nav.apply_tooltip')}>{t('nav.apply')}</button>
          </div>
          <LanguageToggle />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </nav>
  );
}