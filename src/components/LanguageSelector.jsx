import { useTranslation } from '../i18n';

export default function LanguageSelector() {
  const { lang, setLang, supportedLanguages } = useTranslation();

  const handleChange = (e) => {
    setLang(e.target.value);
  };

  return (
    <div className="language-selector">
      <select
        value={lang}
        onChange={handleChange}
        className="pixel-select"
        aria-label="Select language"
      >
        {supportedLanguages.map(language => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}
