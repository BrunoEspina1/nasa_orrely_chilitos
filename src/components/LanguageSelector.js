// src/components/LanguageSelector.js
import React from 'react';

function LanguageSelector({ language, setLanguage }) {
  const languages = [
    { code: 'english', label: 'English' },
    { code: 'spanish', label: 'Español' },
    { code: 'zapoteco', label: 'Zapoteco' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 2,
      }}
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          style={{
            marginRight: '5px',
            padding: '8px 12px',
            backgroundColor: language === lang.code ? '#1B3262' : '#ffffff',
            color: language === lang.code ? '#ffffff' : '#000000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

export default LanguageSelector;
