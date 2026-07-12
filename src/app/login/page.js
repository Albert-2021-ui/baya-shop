'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError(t.fillAllFields || 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      login(form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Left decorative panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftInner}>
          <div className={styles.brandLogoLarge}>
            BAYA <span>SHOP</span>
          </div>
          <h2 className={styles.leftHeading} style={{ whiteSpace: 'pre-line' }}>
            {t.welcomeBack || 'Ravis de vous\nrevoir ! 👋'}
          </h2>
          <p className={styles.leftSub}>
            {t.loginDesc || 'Connectez-vous pour accéder à votre espace client, suivre vos commandes et profiter de vos avantages fidélité.'}
          </p>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>10+</span>
              <span className={styles.statLabel}>{t.productsStat || 'Produits'}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>4</span>
              <span className={styles.statLabel}>{t.paymentStat || 'Modes paiement'}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>24h</span>
              <span className={styles.statLabel}>{t.shippingStat || 'Livraison'}</span>
            </div>
          </div>

          <div className={styles.leftDecoCircle1} />
          <div className={styles.leftDecoCircle2} />
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>{t.loginTitle || 'Connexion'}</h1>
            <p className={styles.formSubtitle}>
              {t.noAccountYet || 'Pas encore de compte ?'}{' '}
              <Link href="/register" className={styles.switchLink}>
                {t.registerFree || 'S\'inscrire gratuitement'}
              </Link>
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="login-email">
                {t.emailAddressLabel || 'Adresse e-mail'}
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                className={styles.input}
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="login-password">
                  {t.passwordLabel || 'Mot de passe'}
                </label>
                <span className={styles.forgotLink}>{t.forgotPassword || 'Mot de passe oublié ?'}</span>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className={styles.input}
                  placeholder={t.passwordPlaceholder || 'Votre mot de passe'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label="Afficher/masquer mot de passe"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className={styles.rememberRow}>
              <label className={styles.rememberLabel}>
                <input type="checkbox" className={styles.checkbox} />
                <span>{t.rememberMe || 'Se souvenir de moi'}</span>
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <span className={styles.btnSpinner} />
              ) : (
                <>
                  <span>{t.loginTitle || 'Se connecter'}</span>
                  <span className={styles.btnArrow}>→</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span>{t.orLabel || 'ou'}</span>
          </div>

          <Link href="/" className={styles.backHome}>
            {t.backToShop || '← Retour à la boutique'}
          </Link>
        </div>
      </div>
    </div>
  );
}
