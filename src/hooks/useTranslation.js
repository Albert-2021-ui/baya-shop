import { useApp } from '../context/AppContext';

// Dictionnaire de traductions global
const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    catalogue: 'Catalogue',
    contact: 'Contact',
    wishlist: 'Favoris',
    cart: 'Panier',
    admin: 'Admin',
    account: 'Mon Compte',
    
    // Boutons
    addToCart: 'Ajouter au panier',
    addToWishlist: 'Ajouter aux favoris',
    removeFromWishlist: 'Retirer des favoris',
    buy: 'Acheter',
    viewDetails: 'Voir les détails',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    
    // Formulaires
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    city: 'Ville',
    message: 'Message',
    send: 'Envoyer',
    submit: 'Soumettre',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    
    // Messages
    success: 'Succès',
    error: 'Erreur',
    warning: 'Attention',
    info: 'Information',
    loading: 'Chargement...',
    noResults: 'Aucun résultat',
    emptyCart: 'Votre panier est vide',
    emptyWishlist: 'Votre liste de favoris est vide',
    
    // Pages
    homePage: 'Accueil',
    cataloguePage: 'Catalogue',
    contactPage: 'Contact',
    cartPage: 'Panier',
    wishlistPage: 'Favoris',
    adminPage: 'Administration',
    accountPage: 'Mon Compte',
    
    // Autres
    price: 'Prix',
    quantity: 'Quantité',
    total: 'Total',
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    tax: 'Taxe',
    discount: 'Réduction',
    language: 'Langue',
    french: 'Français',
    english: 'English',
  },
  en: {
    // Navigation
    home: 'Home',
    catalogue: 'Catalogue',
    contact: 'Contact',
    wishlist: 'Wishlist',
    cart: 'Cart',
    admin: 'Admin',
    account: 'My Account',
    
    // Buttons
    addToCart: 'Add to Cart',
    addToWishlist: 'Add to Wishlist',
    removeFromWishlist: 'Remove from Wishlist',
    buy: 'Buy',
    viewDetails: 'View Details',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Forms
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    message: 'Message',
    send: 'Send',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    
    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    loading: 'Loading...',
    noResults: 'No results',
    emptyCart: 'Your cart is empty',
    emptyWishlist: 'Your wishlist is empty',
    
    // Pages
    homePage: 'Home',
    cataloguePage: 'Catalogue',
    contactPage: 'Contact',
    cartPage: 'Cart',
    wishlistPage: 'Wishlist',
    adminPage: 'Administration',
    accountPage: 'My Account',
    
    // Other
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    discount: 'Discount',
    language: 'Language',
    french: 'Français',
    english: 'English',
  },
};

/**
 * Hook pour accéder à la langue actuelle et aux traductions
 * @returns {Object} { lang, t, setLang }
 * 
 * Utilisation:
 * const { lang, t, setLang } = useTranslation();
 * console.log(t.home); // Affiche "Accueil" ou "Home" selon la langue
 */
export function useTranslation() {
  const { lang, setLang } = useApp();
  const t = translations[lang] || translations.fr;

  return {
    lang,
    t,
    setLang,
    translations,
  };
}

