'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Header.module.css';

// ── Translations ────────────────────────────────────────
const translations = {
  fr: {
    home: 'Accueil',
    catalogue: 'Catalogue',
    contact: 'Contact',
    wishlist: 'Favoris',
    cart: 'Panier',
    admin: 'Admin',
    account: 'Mon Compte',
  },
  en: {
    home: 'Home',
    catalogue: 'Catalogue',
    contact: 'Contact',
    wishlist: 'Wishlist',
    cart: 'Cart',
    admin: 'Admin',
    account: 'My Account',
  },
};

export default function Header() {
  const { getCartCount, isLoaded } = useCart();
  const { toggleSidebar, isAdminLoggedIn } = useApp();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState('fr');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langRef = useRef(null);

  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
    // Load saved language preference
    const savedLang = localStorage.getItem('baya_shop_lang');
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLang = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('baya_shop_lang', newLang);
    setLangDropdownOpen(false);
  }, []);

  const cartCount = mounted && isLoaded ? getCartCount() : 0;

  // Try to read wishlist count
  let wishlistCount = 0;
  if (mounted) {
    try {
      const saved = localStorage.getItem('baya_shop_wishlist');
      if (saved) wishlistCount = JSON.parse(saved).length;
    } catch {}
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* ── LOGO ─────────────────────────────────────────── */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>B</div>
          <span className={styles.logoWord}>
            BAYA <span className={styles.logoAccent}>SHOP</span>
          </span>
        </Link>

        {/* ── NAV LINKS ──────────────────────────────────────── */}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link href="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {t.home}
          </Link>

          <a
            href="#catalogue"
            className={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            {t.catalogue}
          </a>

          <Link href="/contact" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            {t.contact}
          </Link>

          {/* Séparateur mobile */}
          <div className={styles.mobileDivider} />

          {/* ── FAVORIS (bouton rose/outline avec cœur) */}
          <Link href="/wishlist" className={styles.btnWishlist} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {t.wishlist}
            {wishlistCount > 0 && (
              <span className={styles.wishlistBadge} key={wishlistCount}>
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* ── PANIER (bouton vert) */}
          <Link href="/cart" className={styles.btnCart} onClick={() => setMenuOpen(false)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {t.cart}
            {cartCount > 0 && (
              <span className={styles.cartBadge} key={cartCount}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* ── ADMIN (bouton rouge) — visible uniquement si connecté */}
          {mounted && isAdminLoggedIn && (
            <Link href="/admin" className={styles.btnAdmin} onClick={() => setMenuOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {t.admin}
            </Link>
          )}

          {/* ── MON COMPTE */}
          <button onClick={() => { toggleSidebar(); setMenuOpen(false); }} className={styles.btnAccount}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {t.account}
          </button>
        </nav>

        {/* ── RIGHT SIDE: Language + Hamburger ────────────── */}
        <div className={styles.rightControls}>

          {/* ── LANGUAGE SWITCHER ──────────────────────────── */}
          <div className={styles.langSwitcher} ref={langRef}>
            <button
              className={styles.langBtn}
              onClick={() => setLangDropdownOpen((v) => !v)}
              aria-label="Change language"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className={styles.langLabel}>{lang.toUpperCase()}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`${styles.chevron} ${langDropdownOpen ? styles.chevronOpen : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {langDropdownOpen && (
              <div className={styles.langDropdown}>
                <button
                  className={`${styles.langOption} ${lang === 'fr' ? styles.langOptionActive : ''}`}
                  onClick={() => switchLang('fr')}
                >
                  <span className={styles.langFlag}>🇫🇷</span>
                  Français
                </button>
                <button
                  className={`${styles.langOption} ${lang === 'en' ? styles.langOptionActive : ''}`}
                  onClick={() => switchLang('en')}
                >
                  <span className={styles.langFlag}>🇬🇧</span>
                  English
                </button>
              </div>
            )}
          </div>

          {/* ── HAMBURGER (mobile) ────────────────────────────── */}
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Barre de progression verte/rouge en bas du header */}
      <div className={styles.headerAccentLine} />
    </header>
  );
}
