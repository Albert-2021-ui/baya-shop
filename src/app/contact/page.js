'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Question',
    message: ''
  });
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setShowToast(true);
    setFormData({ name: '', email: '', phone: '', subject: 'Question', message: '' });
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className={`container ${styles.contactContainer}`}>
      {showToast && (
        <div className={styles.toastNotification}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Votre message a été envoyé avec succès !
        </div>
      )}

      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>Support Client</span>
        <h1 className={styles.sectionTitle}>Contactez-nous</h1>
        <p className={styles.sectionSubtitle}>
          Une question ? Un problème ? Notre équipe est là pour vous aider 24h/24 et 7j/7.
        </p>
      </div>

      <div className={styles.contactGrid}>
        {/* LEFT COLUMN: Contact Form */}
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Nom complet</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Adresse Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Téléphone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+229 XX XX XX XX"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="subject">Sujet</label>
                  <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
                    <option value="Question">Question générale</option>
                    <option value="Reclamation">Réclamation</option>
                    <option value="Partenariat">Partenariat</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Votre message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Comment pouvons-nous vous aider ?"
                ></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Envoyer le message
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Contact Info */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <div className={styles.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className={styles.infoText}>
                <h3>Téléphone / WhatsApp</h3>
                <p>+229 01 63 09 74 98</p>
                <p>+229 01 53 37 49 53</p>
                <span>Lun - Sam, 8h à 20h</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className={styles.infoText}>
                <h3>Email</h3>
                <p>eugenebaya6@gmail.com</p>
                <span>Nous répondons sous 24h</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className={styles.infoText}>
                <h3>Adresse</h3>
                <p>Cotonou, Bénin</p>
                <span>Siège social</span>
              </div>
            </div>

            <div className={styles.socialDivider}>Suivez-nous</div>
            <div className={styles.socialIcons}>
              <a href="https://facebook.com/bayashop" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://instagram.com/bayashop" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://wa.me/2290163097498" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="WhatsApp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.mapPlaceholder}>
             <div className={styles.mapContent}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                  <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
                <span>Carte interactive disponible prochainement</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
