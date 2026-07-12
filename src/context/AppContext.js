'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [clientProfile, setClientProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [lang, setLangState] = useState('fr');
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les données de session au démarrage
  useEffect(() => {
    // 1. Session Administrateur
    const adminSession = sessionStorage.getItem('baya_admin_session');
    if (adminSession === 'active') {
      setIsAdminLoggedIn(true);
    }

    // 2. Profil Client
    const savedProfile = localStorage.getItem('baya_client_profile');
    if (savedProfile) {
      try {
        setClientProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Erreur lors du chargement du profil client:', e);
      }
    }

    // 3. Commandes et Fidélité
    const savedOrders = localStorage.getItem('baya_customer_orders_history');
    if (savedOrders) {
      try {
        const ordersList = JSON.parse(savedOrders);
        const sortedOrders = ordersList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setCustomerOrders(sortedOrders);

        // Fidélité : 1 point pour chaque 1 000 FCFA dépensé
        const totalSpent = sortedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        setLoyaltyPoints(Math.floor(totalSpent / 1000));
      } catch (e) {
        console.error('Erreur lors du chargement de l\'historique des commandes:', e);
      }
    }

    // 4. Langue
    const savedLang = localStorage.getItem('baya_lang');
    if (savedLang) {
      setLangState(savedLang);
    }

    setIsLoaded(true);
  }, []);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Charger/Rafraîchir les données clients
  const loadClientData = () => {
    const savedProfile = localStorage.getItem('baya_client_profile');
    if (savedProfile) {
      try {
        setClientProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error(e);
      }
    }

    const savedOrders = localStorage.getItem('baya_customer_orders_history');
    if (savedOrders) {
      try {
        const ordersList = JSON.parse(savedOrders);
        const sortedOrders = ordersList.sort((a, b) => new Date(b.date) - new Date(a.date));
        setCustomerOrders(sortedOrders);
        
        const totalSpent = sortedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        setLoyaltyPoints(Math.floor(totalSpent / 1000));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Enregistrer le profil client
  const saveClientProfile = (profileData) => {
    localStorage.setItem('baya_client_profile', JSON.stringify(profileData));
    setClientProfile(profileData);
    loadClientData();
  };

  // Connecter l'administrateur
  const loginAdmin = () => {
    sessionStorage.setItem('baya_admin_session', 'active');
    setIsAdminLoggedIn(true);
  };

  // Déconnecter l'administrateur
  const logoutAdmin = () => {
    sessionStorage.removeItem('baya_admin_session');
    setIsAdminLoggedIn(false);
  };

  // Changer de langue
  const setLang = (newLang) => {
    localStorage.setItem('baya_lang', newLang);
    setLangState(newLang);
  };

  return (
    <AppContext.Provider
      value={{
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        clientProfile,
        saveClientProfile,
        customerOrders,
        loyaltyPoints,
        loadClientData,
        lang,
        setLang,
        isLoaded
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé au sein de AppProvider');
  }
  return context;
}
