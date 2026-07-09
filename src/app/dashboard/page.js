'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import styles from './dashboard.module.css';

// Inner component that uses useSearchParams
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthLoaded, logout, updateProfile, changePassword, getUserOrders, getLoyaltyPoints } = useAuth();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  const [orders, setOrders] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', phone: '', city: '', address: '' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

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
        <p>Chargement...</p>
      </div>
    );
  }

  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const loyaltyLevel = loyaltyPoints >= 500 ? 'Or 🌟' : loyaltyPoints >= 100 ? 'Argent 🥈' : 'Bronze 🥉';
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
    if (passwordForm.next.length < 6) return setPasswordMsg({ type: 'error', text: 'Minimum 6 caractères.' });
    if (passwordForm.next !== passwordForm.confirm) return setPasswordMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
    try {
      changePassword(passwordForm.current, passwordForm.next);
      setPasswordMsg({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    }
  };

  const statusLabel = (s) => ({ delivered: 'Livré', shipped: 'Expédié', pending: 'En attente', canceled: 'Annulé' }[s] || 'En cours');
  const statusClass = (s) => ({ delivered: styles.statusDelivered, shipped: styles.statusShipped, pending: styles.statusPending, canceled: styles.statusCanceled }[s] || styles.statusPending);

  const tabs = [
    { id: 'overview', label: 'Tableau de bord', icon: '🏠' },
    { id: 'orders', label: 'Mes Commandes', icon: '📦', count: orders.length },
    { id: 'loyalty', label: 'Programme VIP', icon: '✨' },
    { id: 'profile', label: 'Mon Profil', icon: '👤' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
  ];

  return (
    <div className={styles.dashWrapper}>
      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.avatarCircle}>{initials}</div>
          <div className={styles.sidebarUserInfo}>
            <span className={styles.sidebarName}>{user.firstName} {user.lastName}</span>
            <span className={styles.sidebarEmail}>{user.email}</span>
            <span className={styles.sidebarBadge}>Membre {loyaltyLevel}</span>
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
          <Link href="/" className={styles.shopLink}>🛒 Retour à la boutique</Link>
          <button onClick={() => { logout(); router.push('/'); }} className={styles.logoutBtn}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className={styles.mainContent}>
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Bonjour, {user.firstName} 👋</h1>
              <p className={styles.pageSub}>Bienvenue dans votre espace client BAYA SHOP</p>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📦</div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{orders.length}</span>
                  <span className={styles.statLabel}>Commandes</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{formatPrice(totalSpent)}</span>
                  <span className={styles.statLabel}>Total dépensé</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>✨</div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{loyaltyPoints}</span>
                  <span className={styles.statLabel}>Points fidélité</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🏆</div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{loyaltyLevel}</span>
                  <span className={styles.statLabel}>Niveau membre</span>
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
                    <div className={styles.vipCardLabel}>Titulaire</div>
                    <div className={styles.vipCardVal}>{`${user.firstName} ${user.lastName}`.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.vipCardLabel}>Points</div>
                    <div className={styles.vipCardVal}>{loyaltyPoints} PTS</div>
                  </div>
                </div>
              </div>

              <div className={styles.loyaltyProgress}>
                <div className={styles.progressHeader}>
                  <span>Niveau actuel : <strong>{loyaltyLevel}</strong></span>
                  <span>Prochain palier : <strong>{nextLevel} pts</strong></span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.progressHint}>1 point = 1 000 FCFA d'achat. Vos points débloquent des remises exclusives !</p>
              </div>
            </div>

            {/* Recent orders */}
            <div className={styles.recentSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Commandes récentes</h2>
                <button onClick={() => setActiveTab('orders')} className={styles.seeAllBtn}>Voir tout →</button>
              </div>
              {orders.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>🛍️</span>
                  <p>Aucune commande pour le moment.</p>
                  <Link href="/" className={styles.shopNowBtn}>Découvrir les produits</Link>
                </div>
              ) : (
                <div className={styles.ordersList}>
                  {orders.slice(0, 3).map((o) => (
                    <div key={o.id} className={styles.orderRow}>
                      <div className={styles.orderRowLeft}>
                        <span className={styles.orderRef}>#{o.payment?.reference || o.id}</span>
                        <span className={styles.orderDate}>{new Date(o.date).toLocaleDateString('fr-FR')}</span>
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
              <h1 className={styles.pageTitle}>Mes Commandes</h1>
              <p className={styles.pageSub}>{orders.length} commande{orders.length !== 1 ? 's' : ''} au total</p>
            </div>
            {orders.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <p>Vous n'avez pas encore passé de commande.</p>
                <Link href="/" className={styles.shopNowBtn}>Commencer mes achats</Link>
              </div>
            ) : (
              <div className={styles.ordersGrid}>
                {orders.map((o) => (
                  <div key={o.id} className={styles.orderCard}>
                    <div className={styles.orderCardHead}>
                      <div>
                        <div className={styles.orderCardRef}>#{o.payment?.reference || o.id}</div>
                        <div className={styles.orderCardDate}>{new Date(o.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
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
                        {o.payment?.method === 'momo' ? '📱 Mobile Money' : o.payment?.method === 'direct_transfer' ? '💸 Transfert Direct' : '💳 Carte'}
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
              <h1 className={styles.pageTitle}>Programme VIP ✨</h1>
              <p className={styles.pageSub}>Gagnez des points et débloquez des avantages exclusifs</p>
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
                    <div className={styles.vipCardLabel}>Titulaire</div>
                    <div className={styles.vipCardVal}>{`${user.firstName} ${user.lastName}`.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.vipCardLabel}>Points Baya</div>
                    <div className={styles.vipCardVal}>{loyaltyPoints} PTS</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.loyaltyDetails}>
              <div className={styles.loyaltyProgressBlock}>
                <div className={styles.progressHeader}>
                  <span>Niveau : <strong>{loyaltyLevel}</strong></span>
                  <span>Prochain : <strong>{nextLevel} pts</strong></span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.progressHint}>Il vous faut <strong>{Math.max(0, nextLevel - loyaltyPoints)} points</strong> pour atteindre le palier suivant.</p>
              </div>

              <div className={styles.tiersGrid}>
                {[
                  { level: 'Bronze 🥉', min: 0, max: 99, perks: ['Accès aux ventes privées', 'Newsletter exclusive', '5% de remise cumulée'] },
                  { level: 'Argent 🥈', min: 100, max: 499, perks: ['Livraison prioritaire', '10% de remise', 'Service client dédié'] },
                  { level: 'Or 🌟', min: 500, max: '∞', perks: ['Livraison gratuite', '15% de remise', 'Accès VIP aux nouveautés', 'Cadeaux exclusifs'] },
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
              <h1 className={styles.pageTitle}>Mon Profil</h1>
              <p className={styles.pageSub}>Mettez à jour vos informations personnelles</p>
            </div>
            <div className={styles.profileCard}>
              <div className={styles.profileAvatarSection}>
                <div className={styles.profileAvatar}>{initials}</div>
                <div>
                  <div className={styles.profileAvatarName}>{user.firstName} {user.lastName}</div>
                  <div className={styles.profileAvatarEmail}>{user.email}</div>
                  <div className={styles.profileJoinDate}>Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>

              {profileSaved && (
                <div className={styles.successBanner}>✅ Profil mis à jour avec succès !</div>
              )}

              <form onSubmit={handleProfileSave} className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.fGroup}>
                    <label className={styles.fLabel}>Prénom</label>
                    <input className={styles.fInput} value={profileForm.firstName} onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Prénom" />
                  </div>
                  <div className={styles.fGroup}>
                    <label className={styles.fLabel}>Nom</label>
                    <input className={styles.fInput} value={profileForm.lastName} onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Nom" />
                  </div>
                </div>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>E-mail</label>
                  <input className={styles.fInput} type="email" value={profileForm.email} onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} placeholder="email@exemple.com" />
                </div>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>Téléphone</label>
                  <input className={styles.fInput} type="tel" value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+229 97 00 00 00" />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.fGroup}>
                    <label className={styles.fLabel}>Ville</label>
                    <input className={styles.fInput} value={profileForm.city} onChange={(e) => setProfileForm(p => ({ ...p, city: e.target.value }))} placeholder="Cotonou" />
                  </div>
                  <div className={styles.fGroup}>
                    <label className={styles.fLabel}>Adresse</label>
                    <input className={styles.fInput} value={profileForm.address} onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))} placeholder="Rue des Jardins" />
                  </div>
                </div>
                <button type="submit" className={styles.saveBtn}>Enregistrer les modifications</button>
              </form>
            </div>
          </div>
        )}

        {/* SECURITY */}
        {activeTab === 'security' && (
          <div className={styles.tabContent}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Sécurité</h1>
              <p className={styles.pageSub}>Gérez votre mot de passe et la sécurité du compte</p>
            </div>
            <div className={styles.securityCard}>
              <h2 className={styles.secCardTitle}>Modifier le mot de passe</h2>

              {passwordMsg.text && (
                <div className={passwordMsg.type === 'success' ? styles.successBanner : styles.errorBanner}>
                  {passwordMsg.type === 'success' ? '✅' : '⚠️'} {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordSave} className={styles.profileForm}>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>Mot de passe actuel</label>
                  <input className={styles.fInput} type="password" value={passwordForm.current} onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>Nouveau mot de passe</label>
                  <input className={styles.fInput} type="password" value={passwordForm.next} onChange={(e) => setPasswordForm(p => ({ ...p, next: e.target.value }))} placeholder="Minimum 6 caractères" />
                </div>
                <div className={styles.fGroup}>
                  <label className={styles.fLabel}>Confirmer le nouveau mot de passe</label>
                  <input className={styles.fInput} type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Répéter le mot de passe" />
                </div>
                <button type="submit" className={styles.saveBtn}>Mettre à jour le mot de passe</button>
              </form>

              <div className={styles.securityInfo}>
                <h3 className={styles.secInfoTitle}>🛡️ Conseils de sécurité</h3>
                <ul className={styles.secTips}>
                  <li>Utilisez un mot de passe unique d'au moins 8 caractères</li>
                  <li>Mélangez lettres, chiffres et symboles</li>
                  <li>Ne partagez jamais votre mot de passe</li>
                  <li>Déconnectez-vous après chaque session sur un appareil partagé</li>
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
