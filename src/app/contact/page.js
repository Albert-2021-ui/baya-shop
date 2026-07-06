'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './page.module.css';

export default function ContactPage() {
  const { t, lang } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Question',
    message: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setToastType('success');
        setToastMessage(lang === 'fr' ? 'Votre message a été envoyé avec succès !' : 'Your message has been sent successfully!');
        setFormData({ name: '', email: '', phone: '', subject: 'Question', message: '' });
      } else {
        setToastType('error');
        setToastMessage(data.error || (lang === 'fr' ? 'Erreur lors de l\'envoi du message' : 'Error sending message'));
      }
    } catch (error) {
      setToastType('error');
      setToastMessage(lang === 'fr' ? 'Erreur de connexion' : 'Connection error');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const translations = {
    fr: {
      badge: 'Support Client',
      title: 'Contactez-nous',
      subtitle: 'Une question ? Un problème ? Notre équipe est là pour vous aider 24h/24 et 7j/7.',
      formTitle: 'Envoyez-nous un message',
      fullName: 'Nom complet',
      email: 'Adresse Email',
      phone: 'Téléphone',
      subject: 'Sujet',
      message: 'Votre message',
      generalQuestion: 'Question générale',
      complaint: 'Réclamation',
      partnership: 'Partenariat',
      other: 'Autre',
      messagePlaceholder: 'Comment pouvons-nous vous aider ?',
      submitBtn: 'Envoyer le message',
      phoneWhatsapp: 'Téléphone / WhatsApp',
      emailLabel: 'Email',
      address: 'Adresse',
      followUs: 'Suivez-nous',
      responseTime: 'Nous répondons sous 24h',
      businessHours: 'Lun - Sam, 8h à 20h',
      mapPlaceholder: 'Carte interactive disponible prochainement',
      headquarters: 'Siège social',
    },
    en: {
      badge: 'Customer Support',
      title: 'Contact Us',
      subtitle: 'Have a question? A problem? Our team is here to help you 24/7.',
      formTitle: 'Send us a message',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone',
      subject: 'Subject',
      message: 'Your message',
      generalQuestion: 'General question',
      complaint: 'Complaint',
      partnership: 'Partnership',
      other: 'Other',
      messagePlaceholder: 'How can we help you?',
      submitBtn: 'Send message',
      phoneWhatsapp: 'Phone / WhatsApp',
      emailLabel: 'Email',
      address: 'Address',
      followUs: 'Follow us',
      responseTime: 'We respond within 24 hours',
      businessHours: 'Mon - Sat, 8am to 8pm',
      mapPlaceholder: 'Interactive map coming soon',
      headquarters: 'Headquarters',
    }
  };

  const ct = translations[lang];

  return (
    <div className={`container ${styles.contactContainer}`}>
      {showToast && (
        <div className={`${styles.toastNotification} ${styles[toastType]}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {toastType === 'success' ? (
              <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </>
            )}
          </svg>
          {toastMessage}
        </div>
      )}

      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>{ct.badge}</span>
        <h1 className={styles.sectionTitle}>{ct.title}</h1>
        <p className={styles.sectionSubtitle}>
          {ct.subtitle}
        </p>
      </div>

      <div className={styles.contactGrid}>
        {/* LEFT COLUMN: Contact Form */}
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>{ct.formTitle}</h2>
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">{ct.fullName}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">{ct.email}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">{ct.phone}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+229 XX XX XX XX"
                    disabled={isLoading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="subject">{ct.subject}</label>
                  <select 
                    id="subject" 
                    name="subject" 
                    value={formData.subject} 
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="Question">{ct.generalQuestion}</option>
                    <option value="Reclamation">{ct.complaint}</option>
                    <option value="Partenariat">{ct.partnership}</option>
                    <option value="Autre">{ct.other}</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">{ct.message}</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder={ct.messagePlaceholder}
                  disabled={isLoading}
                ></textarea>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    {lang === 'fr' ? 'Envoi...' : 'Sending...'}
                  </>
                ) : (
                  <>
                    {ct.submitBtn}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </>
                )}
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
                <h3>{ct.phoneWhatsapp}</h3>
                <p>+229 01 63 09 74 98</p>
                <p>+229 01 53 37 49 53</p>
                <span>{ct.businessHours}</span>
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
                <h3>{ct.emailLabel}</h3>
                <p>eugenebaya6@gmail.com</p>
                <span>{ct.responseTime}</span>
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
                <h3>{ct.address}</h3>
                <p>Cotonou, Bénin</p>
                <span>{ct.headquarters}</span>
              </div>
            </div>

            <div className={styles.socialDivider}>{ct.followUs}</div>
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
                <span>{ct.mapPlaceholder}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

