'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
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

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      register(form);
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
            Bienvenue dans<br />votre espace client
          </h2>
          <p className={styles.leftSub}>
            Créez votre compte gratuit et profitez d'une expérience shopping premium — suivi de commandes, programme fidélité et bien plus.
          </p>
          <div className={styles.leftFeatures}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📦</span>
              <span>Suivi de vos commandes en temps réel</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✨</span>
              <span>Programme fidélité &amp; points VIP</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🔒</span>
              <span>Paiements sécurisés &amp; protégés</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>⚡</span>
              <span>Commander en 1 clic grâce à votre profil</span>
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
            <h1 className={styles.formTitle}>Créer un compte</h1>
            <p className={styles.formSubtitle}>
              Déjà inscrit ?{' '}
              <Link href="/login" className={styles.switchLink}>
                Se connecter
              </Link>
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="firstName">
                  Prénom <span className={styles.required}>*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={styles.input}
                  placeholder="Jean"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="lastName">
                  Nom <span className={styles.required}>*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={styles.input}
                  placeholder="Dupont"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="reg-email">
                Adresse e-mail <span className={styles.required}>*</span>
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className={styles.input}
                placeholder="jean.dupont@mail.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="phone">
                Téléphone (WhatsApp)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={styles.input}
                placeholder="+229 97 00 00 00"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="city">
                  Ville
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className={styles.input}
                  placeholder="Cotonou"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="address">
                  Adresse
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className={styles.input}
                  placeholder="Rue des Jardins"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="reg-password">
                Mot de passe <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Minimum 6 caractères"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="confirmPassword">
                Confirmer le mot de passe <span className={styles.required}>*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPass ? 'text' : 'password'}
                className={styles.input}
                placeholder="Répétez le mot de passe"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className={styles.termsCheck}>
              <input type="checkbox" id="terms" required className={styles.checkbox} />
              <label htmlFor="terms" className={styles.termsLabel}>
                J'accepte les{' '}
                <span className={styles.termsLink}>Conditions Générales d'Utilisation</span> de BAYA SHOP
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? (
                <span className={styles.btnSpinner} />
              ) : (
                <>
                  <span>Créer mon compte</span>
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
