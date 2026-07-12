'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useWishlist } from '../context/WishlistContext';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const { getCartCount, isLoaded } = useCart();
  const { toggleSidebar, isAdminLoggedIn } = useApp();
  const { user, isAuthLoaded, logout } = useAuth();
  const { lang, t, setLang } = useTranslation();
  const { getWishlistCount, isLoaded: isWishlistLoaded } = useWishlist();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Close user menu on outside click
    const handleClick = (e) => {
      if (!e.target.closest('[data-user-menu]')) setUserMenuOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const cartCount = mounted && isLoaded ? getCartCount() : 0;
  const wishlistCount = mounted && isWishlistLoaded ? getWishlistCount() : 0;
  const isLoggedIn = mounted && isAuthLoaded && !!user;
  const initials = isLoggedIn
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : '';

  return (
    <header className={`${styles.headerContainer} ${scrolled ? styles.scrolled : ''}`}>
      <div className="container">
        <div className={styles.headerContent}>
          {/* Logo */}
          <Link href="/" className={styles.logoLink} onClick={() => setMenuOpen(false)}>
            <span className={styles.logoText}>
              BAYA <span className={styles.logoSubtext}>SHOP</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>{t.home}</Link>

            <Link href="/wishlist" className={styles.navLink} style={{ position: 'relative' }}>
              ❤️ {t.wishlist}
              {wishlistCount > 0 && (
                <span className={styles.wishlistBadge}>{wishlistCount}</span>
              )}
            </Link>

            <Link href="/cart" className={`${styles.navLink} ${styles.cartNavLink}`}>
              🛒 {t.cart}
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>

            {mounted && isAdminLoggedIn && (
              <Link href="/admin" className={`${styles.navLink} ${styles.adminNavLink}`}>
                ⚙️ {t.admin}
              </Link>
            )}

            {/* Auth area */}
            {isLoggedIn ? (
              <div className={styles.userMenuWrapper} data-user-menu>
                <button
                  className={styles.userAvatarBtn}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  id="user-menu-btn"
                  aria-label={t.userMenuBtn}
                >
                  <span className={styles.avatarInitials}>{initials}</span>
                  <span className={styles.userNameShort}>{user.firstName}</span>
                  <span className={`${styles.chevron} ${userMenuOpen ? styles.chevronUp : ''}`}>▾</span>
                </button>

                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropAvatar}>{initials}</div>
                      <div>
                        <div className={styles.dropName}>{user.firstName} {user.lastName}</div>
                        <div className={styles.dropEmail}>{user.email}</div>
                      </div>
                    </div>
                    <div className={styles.dropDivider} />
                    <Link
                      href="/dashboard"
                      className={styles.dropItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      🏠 {t.myDashboard}
                    </Link>
                    <Link
                      href="/dashboard?tab=orders"
                      className={styles.dropItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      📦 {t.myOrders}
                    </Link>
                    <Link
                      href="/dashboard?tab=loyalty"
                      className={styles.dropItem}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      ✨ {t.vipProgram}
                    </Link>
                    <div className={styles.dropDivider} />
                    <button
                      className={`${styles.dropItem} ${styles.dropLogout}`}
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                    >
                      🚪 {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authBtns}>
                <Link href="/login" className={styles.loginBtn} id="header-login-btn">
                  {t.login}
                </Link>
                <Link href="/register" className={styles.registerBtn} id="header-register-btn">
                  {t.register}
                </Link>
              </div>
            )}

            {/* Admin sidebar trigger — visible only for admins */}
            {mounted && isAdminLoggedIn && (
              <button onClick={toggleSidebar} className={styles.accountBtn} id="open-sidebar-btn">
                ⚙️ {t.adminAccount}
              </button>
            )}

            {/* Langue toggle */}
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className={styles.langToggleBtn}
              title={lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
            >
              {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>
          </nav>

          {/* Mobile: panier + hamburger */}
          <div className={styles.mobileRight}>
            <Link href="/cart" className={styles.mobileCartBtn}>
              🛒
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <span className={`${styles.hLine} ${menuOpen ? styles.hLineOpen1 : ''}`} />
              <span className={`${styles.hLine} ${menuOpen ? styles.hLineOpen2 : ''}`} />
              <span className={`${styles.hLine} ${menuOpen ? styles.hLineOpen3 : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
            🏠 {t.home}
          </Link>
          <Link href="/wishlist" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
            ❤️ {t.wishlist} {wishlistCount > 0 && `(${wishlistCount})`}
          </Link>
          <Link href="/cart" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
            🛒 {t.cart} {cartCount > 0 && `(${cartCount})`}
          </Link>
          {mounted && isAdminLoggedIn && (
            <Link href="/admin" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
              ⚙️ {t.admin}
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
                🏠 {t.myDashboard}
              </Link>
              <Link href="/dashboard?tab=orders" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
                📦 {t.myOrders}
              </Link>
              <Link href="/dashboard?tab=loyalty" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
                ✨ {t.vipProgram}
              </Link>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className={`${styles.mobileMenuLink} ${styles.mobileLogout}`}
                style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
              >
                🚪 {t.logout}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
                🔐 {t.login}
              </Link>
              <Link href="/register" className={`${styles.mobileMenuLink} ${styles.mobileRegisterLink}`} onClick={() => setMenuOpen(false)}>
                ✨ {t.register}
              </Link>
            </>
          )}
          {mounted && isAdminLoggedIn && (
            <button
              onClick={() => { toggleSidebar(); setMenuOpen(false); }}
              className={styles.mobileMenuLink}
              style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ⚙️ {t.adminArea}
            </button>
          )}

          {/* Langue toggle en version mobile */}
          <button
            onClick={() => { setLang(lang === 'fr' ? 'en' : 'fr'); setMenuOpen(false); }}
            className={styles.mobileMenuLink}
            style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%', color: 'var(--primary)' }}
          >
            🌐 {lang === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
          </button>
        </div>
      )}
    </header>
  );
}
