'use client';

export default function NewsletterForm() {
  return (
    <form style={{ display: 'flex', gap: '8px' }} onSubmit={(e) => { e.preventDefault(); alert('Merci pour votre inscription !'); }}>
      <input type="email" placeholder="Votre adresse email" required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', flex: 1, outline: 'none', fontSize: '0.9rem' }} />
      <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
        S'inscrire
      </button>
    </form>
  );
}
