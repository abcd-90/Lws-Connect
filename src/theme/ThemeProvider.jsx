import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState({
    brand_name: 'LWS Direct',
    tagline: 'The direct line to Learn With Sami',
    primary_color: '#0F172A',
    secondary_color: '#0284C7',
    accent_color: '#10B981',
    bg_color: '#090D16',
    surface_color: '#111827',
    text_color: '#F9FAFB',
    font_family: 'Plus Jakarta Sans, sans-serif',
    button_radius: '8px',
    card_radius: '12px',
    hero_headline: 'Connect Directly with Learn With Sami',
    hero_subheadline: 'A private, secure platform for the LWS community to ask questions, receive feedback, and collaborate directly with Sami.',
    hero_cta_text: 'Start a Conversation',
    footer_text: '© 2026 Learn With Sami. All rights reserved.'
  });

  const [loading, setLoading] = useState(true);

  const applyThemeToDOM = (config) => {
    if (!config) return;
    const root = document.documentElement;
    if (config.primary_color) root.style.setProperty('--primary', config.primary_color);
    if (config.secondary_color) root.style.setProperty('--secondary', config.secondary_color);
    if (config.accent_color) root.style.setProperty('--accent', config.accent_color);
    if (config.bg_color) root.style.setProperty('--bg', config.bg_color);
    if (config.surface_color) root.style.setProperty('--surface', config.surface_color);
    if (config.text_color) root.style.setProperty('--text', config.text_color);
    if (config.font_family) root.style.setProperty('--font-family', config.font_family);
    if (config.button_radius) root.style.setProperty('--button-radius', config.button_radius);
    if (config.card_radius) root.style.setProperty('--card-radius', config.card_radius);
  };

  const fetchActiveTheme = async () => {
    try {
      const res = await apiFetch('/config/active-theme');
      if (res.active_version && res.active_version.config) {
        setTheme(res.active_version.config);
        applyThemeToDOM(res.active_version.config);
      } else if (res.brand) {
        const merged = { ...theme, ...res.brand };
        setTheme(merged);
        applyThemeToDOM(merged);
      }
    } catch (err) {
      console.warn('Using default fallback theme:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyThemeToDOM, fetchActiveTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
