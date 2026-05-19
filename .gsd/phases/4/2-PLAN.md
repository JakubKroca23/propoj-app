---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: Počasí a Geolokace (Open-Meteo API)

## Objective
Implementovat modul **Počasí** s využitím bezplatného a veřejného **Open-Meteo API** (bez nutnosti registrace či API klíčů) a browser **Geolocation API** pro automatickou detekci polohy uživatele. Vybudovat detailní aplikaci Počasí s předpovědí na 5 dní, vyhledáváním měst a plně oživit Bento Weather panel na ploše.

## Context
- [.gsd/SPEC.md](file:///home/jakub/github/propoj-app/.gsd/SPEC.md) (REQ-18)
- [.gsd/DECISIONS.md](file:///home/jakub/github/propoj-app/.gsd/DECISIONS.md) (Fáze 4 Rozhodnutí)
- [src/shell/Desktop/Desktop.tsx](file:///home/jakub/github/propoj-app/src/shell/Desktop/Desktop.tsx)
- [src/data/apps.ts](file:///home/jakub/github/propoj-app/src/data/apps.ts)

## Tasks

<task type="auto">
  <name>Zustand weatherStore a Geolocation integrace</name>
  <files>
    <file>src/stores/weatherStore.ts</file>
  </files>
  <action>
    1. Vytvořit Zustand store `src/stores/weatherStore.ts`:
       - Definovat typy pro `WeatherData` (aktuální teplota, pocitová teplota, vlhkost, vítr, kód počasí, popis, název města) a `ForecastDay` (datum, kód počasí, max/min teplota).
       - Implementovat metodu `fetchWeather(lat, lon, cityName?)` volající Open-Meteo forecast API:
         `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
       - Implementovat metodu `detectLocationAndFetch()` využívající `navigator.geolocation` pro získání souřadnic, s plynulým fallbackem na Prahu `(50.0755, 14.4378)` v případě zamítnutí práv či offline režimu.
       - Mapovat číselné WMO kódy počasí na české popisy (např. 0 = Jasno, 1-3 = Polojasno, 61-65 = Déšť, 71-75 = Sněžení) a odpovídající emoji/SVG ikony.
       - Podporovat robustní mock data jako okamžitý fallback při chybách sítě.
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Zustand store existuje, typy jsou kompletní, geolokace a REST volání fungují bez kompilačních chyb.
  </done>
</task>

<task type="auto">
  <name>Aplikace Počasí a integrace widgetu na ploše</name>
  <files>
    <file>src/apps/Weather/Weather.tsx</file>
    <file>src/apps/Weather/Weather.css</file>
    <file>src/shell/Desktop/Desktop.tsx</file>
    <file>src/data/apps.ts</file>
  </files>
  <action>
    1. Vytvořit aplikaci `src/apps/Weather/Weather.tsx` v češtině (cs-CZ):
       - Zobrazit aktuální stav: Velká ikona, teplota, název detekovaného/hledaného města, detaily (pocitová teplota, vlhkost, vítr).
       - Zobrazit 5denní předpověď v podobě horizontální časové osy nebo elegantního seznamu s denními min/max teplotami a českým popiskem.
       - Vyhledávací pole pro ruční změnu města pomocí Open-Meteo Geocoding API:
         `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=cs`
         Výběr města z dropdownu okamžitě načte nová data a uloží vybrané město do storu.
    2. Vytvořit glassmorphic CSS styly v `src/apps/Weather/Weather.css` s plynulým prolínáním barev a podporou dark/light schémat.
    3. Zaregistrovat aplikaci `Weather` v `src/data/apps.ts` importem komponenty a jejím namontováním do pole `APPS` (id: 'weather').
    4. Refaktorovat `src/shell/Desktop/Desktop.tsx`:
       - Nahradit statické hodnoty v Bento Weather widgetu voláním `useWeatherStore` storu.
       - Spustit `detectLocationAndFetch()` při načtení plochy.
       - Vykreslovat live data o počasí a 3denní zjednodušenou předpověď. Kliknutí na widget otevře aplikaci Počasí.
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Aplikace Počasí umožňuje vyhledávat města, kreslí předpověď a bento widget na ploše zobrazuje živá, reálná data podle polohy uživatele.
  </done>
</task>

## Success Criteria
- [ ] Aplikace Počasí stahuje reálná data z Open-Meteo API bez nutnosti zadávat jakékoliv API klíče.
- [ ] Geolocation API úspěšně detekuje polohu uživatele v prohlížeči, s plynulým fallbackem na Prahu při zamítnutí.
- [ ] Uživatel může ručně vyhledávat města v aplikaci (např. Brno, Ostrava) a počasí se přepne.
- [ ] Bento Weather widget na ploše zobrazuje reálné aktuální počasí a malou 3denní předpověď.
- [ ] Produkční sestavení (`npm run build`) proběhne úspěšně a bez chyb.
