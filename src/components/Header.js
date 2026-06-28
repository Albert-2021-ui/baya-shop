'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const { getCartCount, isLoaded } = useCart();
  const { toggleSidebar, isAdminLoggedIn } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted && isLoaded ? getCartCount() : 0;

  return (
    <header className={styles.headerContainer}>
      <div className="container header-content">
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logoLink}>
            <span className={styles.logoText}>
              BAYA <span className={styles.logoSubtext}>SHOP</span>
            </span>
          </Link>

          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              Accueil
            </Link>
            <Link href="/cart" className={`${styles.navLink} ${styles.cartNavLink}`}>
              Panier
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
            {mounted && isAdminLoggedIn && (
              <Link href="/admin" className={`${styles.navLink} ${styles.adminNavLink}`}>
                Admin
              </Link>
            )}
            <button onClick={toggleSidebar} className={styles.accountBtn}>
              👤 Mon Compte
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
