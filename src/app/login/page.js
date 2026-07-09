'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

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
      setError('Veuillez remplir tous les champs.');
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
          <h2 className={styles.leftHeading}>
            Ravis de vous<br />revoir ! 👋
          </h2>
          <p className={styles.leftSub}>
            Connectez-vous pour accéder à votre espace client, suivre vos commandes et profiter de vos avantages fidélité.
          </p>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>10+</span>
              <span className={styles.statLabel}>Produits</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>4</span>
              <span className={styles.statLabel}>Modes paiement</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>24h</span>
              <span className={styles.statLabel}>Livraison</span>
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
            <h1 className={styles.formTitle}>Connexion</h1>
            <p className={styles.formSubtitle}>
              Pas encore de compte ?{' '}
              <Link href="/register" className={styles.switchLink}>
                S&apos;inscrire gratuitement
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
                Adresse e-mail
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
                  Mot de passe
                </label>
                <span className={styles.forgotLink}>Mot de passe oublié ?</span>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Votre mot de passe"
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
                <span>Se souvenir de moi</span>
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
                  <span>Se connecter</span>
                  <span className={styles.btnArrow}>→</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span>ou</span>
          </div>

          <Link href="/" className={styles.backHome}>
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
