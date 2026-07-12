'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { formatPrice } from '../../utils/formatPrice';
import styles from './dashboard.module.css';

// Inner component that uses useSearchParams
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthLoaded, logout, updateProfile, changePassword, getUserOrders, getLoyaltyPoints } = useAuth();
  const { lang } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  const [orders, setOrders] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', phone: '', city: '', address: '' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Translation dictionary localized for Dashboard
  const translations = {
    fr: {
      loading: 'Chargement...',
      hello: 'Bonjour, {name} 👋',
      welcome: 'Bienvenue dans votre espace client BAYA SHOP',
      orders: 'Commandes',
      totalSpent: 'Total dépensé',
      loyaltyPoints: 'Points fidélité',
      memberLevel: 'Niveau membre',
      memberBadge: 'Membre {level}',
      cardHolder: 'Titulaire',
      points: 'Points',
      currentLevel: 'Niveau actuel :',
      nextLevel: 'Prochain palier :',
      progressHint: '1 point = 1 000 FCFA d\'achat. Vos points débloquent des remises exclusives !',
      recentOrders: 'Commandes récentes',
      seeAll: 'Voir tout →',
      noOrdersYet: 'Aucune commande pour le moment.',
      discoverProducts: 'Découvrir les produits',
      totalOrdersCount: '{count} commande{plural} au total',
      noOrdersAtAll: 'Vous n\'avez pas encore passé de commande.',
      startShopping: 'Commencer mes achats',
      vipProgramTitle: 'Programme VIP ✨',
      vipProgramSubtitle: 'Gagnez des points et débloquez des avantages exclusifs',
      nextTierHint: 'Il vous faut <strong>{points} points</strong> pour atteindre le palier suivant.',
      bronzeTier: 'Bronze 🥉',
      silverTier: 'Argent 🥈',
      goldTier: 'Or 🌟',
      perkAcc: 'Accès aux ventes privées',
      perkNews: 'Newsletter exclusive',
      perkDis5: '5% de remise cumulée',
      perkShip: 'Livraison prioritaire',
      perkDis10: '10% de remise',
      perkDed: 'Service client dédié',
      perkFree: 'Livraison gratuite',
      perkDis15: '15% de remise',
      perkNewAcc: 'Accès VIP aux nouveautés',
      perkEx: 'Cadeaux exclusifs',
      profileTitle: 'Mon Profil',
      profileSubtitle: 'Mettez à jour vos informations personnelles',
      profileUpdated: '✅ Profil mis à jour avec succès !',
      joinedDate: 'Membre depuis {date}',
      saveChanges: 'Enregistrer les modifications',
      securityTitle: 'Sécurité',
      securitySubtitle: 'Gérez votre mot de passe et la sécurité du compte',
      updatePassword: 'Modifier le mot de passe',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmNewPassword: 'Confirmer le nouveau mot de passe',
      updatePasswordBtn: 'Mettre à jour le mot de passe',
      securityTips: '🛡️ Conseils de sécurité',
      tip1: 'Utilisez un mot de passe unique d\'au moins 8 caractères',
      tip2: 'Mélangez lettres, chiffres et symboles',
      tip3: 'Ne partagez jamais votre mot de passe',
      tip4: 'Déconnectez-vous après chaque session sur un appareil partagé',
      passwordMinChar: 'Minimum 6 caractères',
      passwordMismatch: 'Les mots de passe ne correspondent pas.',
      passwordSuccess: 'Mot de passe mis à jour avec succès !',
      tabDashboard: 'Tableau de bord',
      tabOrders: 'Mes Commandes',
      tabVip: 'Programme VIP',
      tabProfile: 'Mon Profil',
      tabSecurity: 'Sécurité',
      logout: 'Déconnexion',
      backToShop: 'Retour à la boutique',
      statusDelivered: 'Livré',
      statusShipped: 'Expédié',
      statusPending: 'En attente',
      statusCanceled: 'Annulé',
      statusProcessing: 'En cours',
      momoLabel: '📱 Mobile Money',
      transferLabel: '💸 Transfert Direct',
      cardLabel: '💳 Carte',
    },
    en: {
      loading: 'Loading...',
      hello: 'Hello, {name} 👋',
      welcome: 'Welcome to your BAYA SHOP client area',
      orders: 'Orders',
      totalSpent: 'Total spent',
      loyaltyPoints: 'Loyalty points',
      memberLevel: 'Member level',
      memberBadge: 'Member {level}',
      cardHolder: 'Holder',
      points: 'Points',
      currentLevel: 'Current level:',
      nextLevel: 'Next level:',
      progressHint: '1 point = 1,000 FCFA. Your points unlock exclusive discounts!',
      recentOrders: 'Recent orders',
      seeAll: 'View all →',
      noOrdersYet: 'No orders yet.',
      discoverProducts: 'Discover products',
      totalOrdersCount: '{count} order{plural} in total',
      noOrdersAtAll: 'You have not placed any orders yet.',
      startShopping: 'Start shopping',
      vipProgramTitle: 'VIP Program ✨',
      vipProgramSubtitle: 'Earn points and unlock exclusive rewards',
      nextTierHint: 'You need <strong>{points} points</strong> to reach the next tier.',
      bronzeTier: 'Bronze 🥉',
      silverTier: 'Silver 🥈',
      goldTier: 'Gold 🌟',
      perkAcc: 'Access to private sales',
      perkNews: 'Exclusive newsletter',
      perkDis5: '5% cumulative discount',
      perkShip: 'Priority shipping',
      perkDis10: '10% discount',
      perkDed: 'Dedicated customer service',
      perkFree: 'Free shipping',
      perkDis15: '15% discount',
      perkNewAcc: 'VIP access to new items',
      perkEx: 'Exclusive gifts',
      profileTitle: 'My Profile',
      profileSubtitle: 'Update your personal information',
      profileUpdated: '✅ Profile updated successfully!',
      joinedDate: 'Member since {date}',
      saveChanges: 'Save changes',
      securityTitle: 'Security',
      securitySubtitle: 'Manage your password and account security',
      updatePassword: 'Change password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmNewPassword: 'Confirm new password',
      updatePasswordBtn: 'Update password',
      securityTips: '🛡️ Security Tips',
      tip1: 'Use a unique password of at least 8 characters',
      tip2: 'Mix letters, numbers, and symbols',
      tip3: 'Never share your password',
      tip4: 'Log out after each session on a shared device',
      passwordMinChar: 'Minimum 6 characters',
      passwordMismatch: 'Passwords do not match.',
      passwordSuccess: 'Password updated successfully!',
      tabDashboard: 'Dashboard',
      tabOrders: 'My Orders',
      tabVip: 'VIP Program',
      tabProfile: 'My Profile',
      tabSecurity: 'Security',
      logout: 'Logout',
      backToShop: 'Back to Shop',
      statusDelivered: 'Delivered',
      statusShipped: 'Shipped',
      statusPending: 'Pending',
      statusCanceled: 'Canceled',
      statusProcessing: 'Processing',
      momoLabel: '📱 Mobile Money',
      transferLabel: '💸 Direct Transfer',
      cardLabel: '💳 Card',
    }
  };

  const dt = translations[lang] || translations.fr;

  useEffect(() => {
    if (isAuthLoaded && !user) {
      router.push('/login');
    }
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        address: user.address || '',
      });
      setOrders(getUserOrders());
      setLoyaltyPoints(getLoyaltyPoints());
    }
  }, [isAuthLoaded, user]);

  if (!isAuthLoaded || !user) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>{dt.loading}</p>
      </div>
    );
  }

  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const loyaltyLevel = loyaltyPoints >= 500 ? dt.goldTier : loyaltyPoints >= 100 ? dt.silverTier : dt.bronzeTier;
  const nextLevel = loyaltyPoints >= 500 ? 1000 : loyaltyPoints >= 100 ? 500 : 100;
  const progress = Math.min(100, (loyaltyPoints / nextLevel) * 100);
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || '?';

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (passwordForm.next.length < 6) return setPasswordMsg({ type: 'error', text: dt.passwordMinChar });
    if (passwordForm.next !== passwordForm.confirm) return setPasswordMsg({ type: 'error', text: dt.passwordMismatch });
    try {
      changePassword(passwordForm.current, passwordForm.next);
      setPasswordMsg({ type: 'success', text: dt.passwordSuccess });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    }
  };

  const statusLabel = (s) => ({ delivered: dt.statusDelivered, shipped: dt.statusShipped, pending: dt.statusPending, canceled: dt.statusCanceled }[s] || dt.statusProcessing);
  const statusClass = (s) => ({ delivered: styles.statusDelivered, shipped: styles.statusShipped, pending: styles.statusPending, canceled: styles.statusCanceled }[s] || styles.statusPending);

  const tabs = [
    { id: 'overview', label: dt.tabDashboard, icon: '🏠' },
    { id: 'orders', label: dt.tabOrders, icon: '📦', count: orders.length },
    { id: 'loyalty', label: dt.tabVip, icon: '✨' },
    { id: 'profile', label: dt.tabProfile, icon: '👤' },
    { id: 'security', label: dt.tabSecurity, icon: '🔒' },
  ];

  const formatJoinedDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.dashWrapper}>
      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.avatarCircle}>{initials}</div>
          <div className={styles.sidebarUserInfo}>
            <span className={styles.sidebarName}>{user.firstName} {user.lastName}</span>
            <span className={styles.sidebarEmail}>{user.email}</span>
            <span className={styles.sidebarBadge}>{dt.memberBadge.replace('{level}', loyaltyLevel)}</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`${styles.navBtn} ${activeTab === t.id ? styles.navActive : ''}`}
            >
              <span className={styles.navIcon}>{t.icon}</span>
              <span className={styles.navLabel}>{t.label}</span>
              {t.count !== undefined && <span className={styles.navCount}>{t.count}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link href="/" className={styles.shopLink}>🛒 {dt.backToShop}</Link>
          <button onClick={() => { logout(); router.push('/'); }} className={styles.logoutBtn}>
            🚪 {dt.logout}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className={styles.mainContent}>
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{dt.hello.replace('{name}', user.firstName)}</h1>
              <p className={styles.pageSub}>{dt.welcome}</p>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📦</div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{orders.length}</span>
                  <span className={styles.statLabel}>{dt.orders}</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{formatPrice(totalSpent)}</span>
                  <span className={styles.statLabel}>{dt.totalSpent}</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>✨</div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{loyaltyPoints}</span>
                  <span className={styles.statLabel}>{dt.loyaltyPoints}</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🏆</div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{loyaltyLevel}</span>
                  <span className={styles.statLabel}>{dt.memberLevel}</span>
                </div>
              </div>
            </div>

            {/* VIP Card */}
            <div className={styles.vipCardWrapper}>
              <div className={styles.vipCard}>
                <div className={styles.vipCardTop}>
                  <span className={styles.vipBrand}>BAYA VIP CLUB</span>
                  <div className={styles.vipChip} />
                </div>
                <div className={styles.vipCardNumber}>8888 7777 0000 {String(loyaltyPoints).padStart(4, '0')}</div>
                <div className={styles.vipCardBottom}>
                  <div>
                    <div className={styles.vipCardLabel}>{dt.cardHolder}</div>
                    <div className={styles.vipCardVal}>{`${user.firstName} ${user.lastName}`.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.vipCardLabel}>{dt.points}</div>
                    <div className={styles.vipCardVal}>{loyaltyPoints} PTS</div>
                  </div>
                </div>
              </div>

              <div className={styles.loyaltyProgress}>
                <div className={styles.progressHeader}>
                  <span>{dt.currentLevel} <strong>{loyaltyLevel}</strong></span>
                  <span>{dt.nextLevel} <strong>{nextLevel} pts</strong></span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.progressHint}>{dt.progressHint}</p>
              </div>
            </div>

            {/* Recent orders */}
            <div className={styles.recentSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{dt.recentOrders}</h2>
                <button onClick={() => setActiveTab('orders')} className={styles.seeAllBtn}>{dt.seeAll}</button>
              </div>
              {orders.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>🛍️</span>
                  <p>{dt.noOrdersYet}</p>
                  <Link href="/" className={styles.shopNowBtn}>{dt.discoverProducts}</Link>
                </div>
              ) : (
                <div className={styles.ordersList}>
                  {orders.slice(0, 3).map((o) => (
                    <div key={o.id} className={styles.orderRow}>
                      <div className={styles.orderRowLeft}>
                        <span className={styles.orderRef}>#{o.payment?.reference || o.id}</span>
                        <span className={styles.orderDate}>{new Date(o.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</span>
                      </div>
                      <div className={styles.orderRowRight}>
                        <span className={`${styles.statusBadge} ${statusClass(o.status)}`}>{statusLabel(o.status)}</span>
                        <span className={styles.orderAmount}>{formatPrice(o.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{dt.tabOrders}</h1>
              <p className={styles.pageSub}>
                {dt.totalOrdersCount
                  .replace('{count}', orders.length)
                  .replace('{plural}', orders.length !== 1 ? (lang === 'fr' ? 'es' : 's') : '')}
              </p>
            </div>
            {orders.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <p>{dt.noOrdersAtAll}</p>
                <Link href="/" className={styles.shopNowBtn}>{dt.startShopping}</Link>
              </div>
            ) : (
              <div className={styles.ordersGrid}>
                {orders.map((o) => (
                  <div key={o.id} className={styles.orderCard}>
                    <div className={styles.orderCardHead}>
                      <div>
                        <div className={styles.orderCardRef}>#{o.payment?.reference || o.id}</div>
                        <div className={styles.orderCardDate}>{new Date(o.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                      <span className={`${styles.statusBadge} ${statusClass(o.status)}`}>{statusLabel(o.status)}</span>
                    </div>
                    <div className={styles.orderCardItems}>
                      {(o.items || []).map((item, i) => (
                        <div key={i} className={styles.orderItemLine}>
                          <span>{item.name} × {item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.orderCardFoot}>
                      <span className={styles.orderCardTotal}>{formatPrice(o.total)}</span>
                      <span className={styles.orderPayMethod}>
                        {o.payment?.method === 'fedapay' ? '💳 FedaPay' : o.payment?.method === 'cinetpay' ? '💳 CinetPay' : o.payment?.method === 'direct_transfer' ? dt.transferLabel : dt.cardLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOYALTY */}
        {activeTab === 'loyalty' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{dt.vipProgramTitle}</h1>
              <p className={styles.pageSub}>{dt.vipProgramSubtitle}</p>
            </div>

            <div className={styles.vipCardLarge}>
              <div className={styles.vipCard}>
                <div className={styles.vipCardTop}>
                  <span className={styles.vipBrand}>BAYA VIP CLUB</span>
                  <div className={styles.vipChip} />
                </div>
                <div className={styles.vipCardNumber}>8888 7777 0000 {String(loyaltyPoints).padStart(4, '0')}</div>
                <div className={styles.vipCardBottom}>
                  <div>
                    <div className={styles.vipCardLabel}>{dt.cardHolder}</div>
                    <div className={styles.vipCardVal}>{`${user.firstName} ${user.lastName}`.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.vipCardLabel}>{dt.points}</div>
                    <div className={styles.vipCardVal}>{loyaltyPoints} PTS</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.loyaltyDetails}>
              <div className={styles.loyaltyProgressBlock}>
                <div className={styles.progressHeader}>
                  <span>{dt.currentLevel} <strong>{loyaltyLevel}</strong></span>
                  <span>{dt.nextLevel} <strong>{nextLevel} pts</strong></span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.progressHint} dangerouslySetInnerHTML={{ __html: dt.nextTierHint.replace('{points}', Math.max(0, nextLevel - loyaltyPoints)) }}></p>
              </div>

              <div className={styles.tiersGrid}>
                {[
                  { level: dt.bronzeTier, min: 0, max: 99, perks: [dt.perkAcc, dt.perkNews, dt.perkDis5] },
                  { level: dt.silverTier, min: 100, max: 499, perks: [dt.perkShip, dt.perkDis10, dt.perkDed] },
                  { level: dt.goldTier, min: 500, max: '∞', perks: [dt.perkFree, dt.perkDis15, dt.perkNewAcc, dt.perkEx] },
                ].map((tier) => (
                  <div key={tier.level} className={`${styles.tierCard} ${loyaltyLevel === tier.level ? styles.tierActive : ''}`}>
                    <div className={styles.tierName}>{tier.level}</div>
                    <div className={styles.tierRange}>{tier.min} – {tier.max} pts</div>
                    <ul className={styles.tierPerks}>
                      {tier.perks.map((p) => (
                        <li key={p}><span className={styles.checkMark}>✓</span> {p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{dt.profileTitle}</h1>
              <p className={styles.pageSub}>{dt.profileSubtitle}</p>
            </div>
            <div className={styles.profileCard}>
              <div className={styles.profileAvatarSection}>
                <div className={styles.profileAvatar}>{initials}</div>
                <div>
                  <div className={styles.profileAvatarName}>{user.firstName} {user.lastName}</div>
                  <div className={styles.profileAvatarEmail}>{user.email}</div>
                  <div className={styles.profileJoinDate}>{dt.joinedDate.replace('{date}', formatJoinedDate(user.createdAt))}</div>
                </div>
              </div>

              {profileSaved && (
                <div className={styles.successBanner}>{dt.profileUpdated}</div>
              )}

              <form onSubmit={handleProfileSave} className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.fGroup}>
                    <label className={styles.fLabel}>{lang === 'fr' ? 'Prénom' : 'First Name'}</label>
                    <input className={styles.fInput} value={profileForm.firstName} onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))} placeholder={lang === 'fr' ? 'Prénom' : 'First Name'} />
                  </div>
                  <div className={styles.fGroup}>
                    <label className={styles.fLabel}>{lang === 'fr' ? 'Nom' : 'Last Name'}</label>
                    <input className={styles.fInput} value={profileForm.lastName} onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))} placeholder={lang === 'fr' ? 'Nom' : 'Last Name'} />
                  </div>
                </div>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>{lang === 'fr' ? 'E-mail' : 'Email Address'}</label>
                  <input className={styles.fInput} type="email" value={profileForm.email} onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} placeholder="email@exemple.com" />
                </div>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>{lang === 'fr' ? 'Téléphone' : 'Phone'}</label>
                  <input className={styles.fInput} type="tel" value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+229 97 00 00 00" />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.fGroup}>
                    <label className={styles.fLabel}>{lang === 'fr' ? 'Ville' : 'City'}</label>
                    <input className={styles.fInput} value={profileForm.city} onChange={(e) => setProfileForm(p => ({ ...p, city: e.target.value }))} placeholder={lang === 'fr' ? 'Ville' : 'City'} />
                  </div>
                  <div className={styles.fGroup}>
                    <label className={styles.fLabel}>{lang === 'fr' ? 'Adresse' : 'Address'}</label>
                    <input className={styles.fInput} value={profileForm.address} onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))} placeholder={lang === 'fr' ? 'Adresse' : 'Address'} />
                  </div>
                </div>
                <button type="submit" className={styles.saveBtn}>{dt.saveChanges}</button>
              </form>
            </div>
          </div>
        )}

        {/* SECURITY */}
        {activeTab === 'security' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{dt.securityTitle}</h1>
              <p className={styles.pageSub}>{dt.securitySubtitle}</p>
            </div>
            <div className={styles.securityCard}>
              <h2 className={styles.secCardTitle}>{dt.updatePassword}</h2>

              {passwordMsg.text && (
                <div className={passwordMsg.type === 'success' ? styles.successBanner : styles.errorBanner}>
                  {passwordMsg.type === 'success' ? '✅' : '⚠️'} {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordSave} className={styles.profileForm}>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>{dt.currentPassword}</label>
                  <input className={styles.fInput} type="password" value={passwordForm.current} onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>{dt.newPassword}</label>
                  <input className={styles.fInput} type="password" value={passwordForm.next} onChange={(e) => setPasswordForm(p => ({ ...p, next: e.target.value }))} placeholder={dt.passwordMinChar} />
                </div>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>{dt.confirmNewPassword}</label>
                  <input className={styles.fInput} type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} placeholder={dt.confirmPasswordPlaceholder || 'Confirmer le mot de passe'} />
                </div>
                <button type="submit" className={styles.saveBtn}>{dt.updatePasswordBtn}</button>
              </form>

              <div className={styles.securityInfo}>
                <h3 className={styles.secInfoTitle}>{dt.securityTips}</h3>
                <ul className={styles.secTips}>
                  <li>{dt.tip1}</li>
                  <li>{dt.tip2}</li>
                  <li>{dt.tip3}</li>
                  <li>{dt.tip4}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Wrap in Suspense for useSearchParams (required by Next.js)
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
