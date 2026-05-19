# Summary — Plan 4.2: Počasí a Geolokace (Open-Meteo API)

## Objective
Implementovat modul **Počasí** s využitím bezplatného a veřejného **Open-Meteo API** (bez nutnosti registrace či API klíčů) a browser **Geolocation API** pro automatickou detekci polohy uživatele. Vybudovat detailní aplikaci Počasí s předpovědí na 5 dní, vyhledáváním měst a plně oživit Bento Weather panel na ploše.

## Co bylo implementováno

### 1. Datová vrstva & Zustand Store (`src/stores/weatherStore.ts`)
- **Stavový management**: Vytvořen robustní Zustand store spravující aktuální počasí (`WeatherData`), 5denní předpověď (`ForecastDay`), stav načítání, název města a přesné souřadnice.
- **REST Integrace**: Implementována metoda `fetchWeather(lat, lon, cityName)` volající Open-Meteo API.
- **Geolocation & Fallback**: Metoda `detectLocationAndFetch()` zjišťuje polohu přes `navigator.geolocation`. V případě úspěchu provádí zpětný překlad souřadnic na název obce přes bezplatnou službu OpenStreetMap Nominatim. V případě odmítnutí práv či offline stavu provede plynulý fallback na Prahu.
- **Překlad WMO kódů**: Implementována česká lokalizace a mapování všech číselných standardních WMO kódů na textové popisy (např. *Jasno*, *Zataženo*, *Slabý déšť*, *Mírná bouřka*) a příslušné Emoji ikony.
- **Mock Fallback**: Při jakékoliv chybě sítě či výpadku API se store automaticky přepne na bezproblémová simulovaná data.

### 2. Aplikace Počasí (`src/apps/Weather/`)
- **`Weather.tsx`**: Elegantní uživatelské rozhraní v češtině. Zobrazuje:
  - Aktuální stav: Emoji ikona, teplota, český popis a název detekované lokality.
  - Podrobnou mřížku: Pocitová teplota, vlhkost vzduchu v % a rychlost větru v km/h.
  - Předpověď na 5 dní: Horizontální timeline s datem, dnem v týdnu, emoji, textovým popiskem a denním minimem/maximem.
  - Vyhledávání měst: Integrovaná geokódovací vyhledávací služba využívající `geocoding-api.open-meteo.com`. Po zadání (např. *Brno*, *Ostrava*) se zobrazí dropdown s nalezenými regiony a státy pro přesný výběr.
- **`Weather.css`**: Nádherný glassmorphic layout s plynulými barevnými přechody, animací a adaptabilitou na dark/light mode.
- **`src/data/apps.ts`**: Aplikace byla úspěšně registrována a namontována v systému pod ID `weather`.

### 3. Integrace Bento Widgetu na Ploše
- **`src/shell/Desktop/Desktop.tsx`**:
  - Bento Weather panel byl plně propojen se storem `useWeatherStore`.
  - Při startu OS se automaticky asynchronně spustí detekce polohy a stáhne se aktuální počasí.
  - Widget na ploše zobrazuje aktuální teplotu, ikonu, popis počasí, název města a zjednodušenou 3denní předpověď.
  - Kliknutím na widget se okamžitě spouští plnohodnotná aplikace Počasí.

## Ověření a Verifikace
Kompilace a typová kontrola:
```bash
npx tsc --noEmit
npm run build
```
Ověřeno: Projekt je bez kompilačních chyb a plně zkompilovaný do produkční verze.
