'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useTranslation();

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
      setError(t.fillRequiredFields || 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (form.password.length < 6) {
      setError(t.passwordLengthError || 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t.passwordMismatchError || 'Les mots de passe ne correspondent pas.');
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
          <h2 className={styles.leftHeading} style={{ whiteSpace: 'pre-line' }}>
            {t.welcomeRegister || 'Bienvenue dans\nvotre espace client'}
          </h2>
          <p className={styles.leftSub}>
            {t.registerDesc || 'Créez votre compte gratuit et profitez d\'une expérience shopping premium — suivi de commandes, programme fidélité et bien plus.'}
          </p>
          <div className={styles.leftFeatures}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📦</span>
              <span>{t.registerFeature1 || 'Suivi de vos commandes en temps réel'}</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✨</span>
              <span>{t.registerFeature2 || 'Programme fidélité & points VIP'}</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🔒</span>
              <span>{t.registerFeature3 || 'Paiements sécurisés & protégés'}</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>⚡</span>
              <span>{t.registerFeature4 || 'Commander en 1 clic grâce à votre profil'}</span>
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
            <h1 className={styles.formTitle}>{t.registerTitle || 'Créer un compte'}</h1>
            <p className={styles.formSubtitle}>
              {t.alreadyRegistered || 'Déjà inscrit ?'}{' '}
              <Link href="/login" className={styles.switchLink}>
                {t.login || 'Se connecter'}
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
                  {t.firstName || 'Prénom'} <span className={styles.required}>*</span>
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
                  {t.lastName || 'Nom'} <span className={styles.required}>*</span>
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
                {t.emailAddressLabel || 'Adresse e-mail'} <span className={styles.required}>*</span>
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
                {t.phoneWhatsApp || 'Téléphone (WhatsApp)'}
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
                  {t.city || 'Ville'}
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
                  {t.address || 'Adresse'}
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
                {t.passwordLabel || 'Mot de passe'} <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className={styles.input}
                  placeholder={t.passwordMinChar || 'Minimum 6 caractères'}
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
                {t.confirmPasswordLabel || 'Confirmer le mot de passe'} <span className={styles.required}>*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPass ? 'text' : 'password'}
                className={styles.input}
                placeholder={t.confirmPasswordPlaceholder || 'Répétez le mot de passe'}
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className={styles.termsCheck}>
              <input type="checkbox" id="terms" required className={styles.checkbox} />
              <label htmlFor="terms" className={styles.termsLabel}>
                {t.acceptTerms || 'J\'accepte les'}{' '}
                <span className={styles.termsLink}>{t.termsOfUse || 'Conditions Générales d\'Utilisation'}</span> {t.ofBayaShop || 'de BAYA SHOP'}
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
                  <span>{t.createAccountBtn || 'Créer mon compte'}</span>
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
