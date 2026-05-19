---
phase: 4
plan: 3
wave: 2
---

# Plan 4.3: E-mailový klient a Appwrite proxy funkce

## Objective
Implementovat plnohodnotného **E-mailového klienta** s podporou reálného **IMAP/SMTP** protokolu. K překonání CORS a raw TCP omezení v prohlížeči vytvořit zabezpečenou serverless proxy funkci v **Appwrite (Node.js)**. Integrovat správu e-mailového účtu v Nastavení OS a vybudovat dvoupanelové klientské rozhraní (čtení pošty, složky, vyhledávání, compose window s editorem) s robustním mock inbox fallbackem pro okamžité offline vyzkoušení.

## Context
- [.gsd/SPEC.md](file:///home/jakub/github/propoj-app/.gsd/SPEC.md) (REQ-17)
- [.gsd/DECISIONS.md](file:///home/jakub/github/propoj-app/.gsd/DECISIONS.md) (Fáze 4 Rozhodnutí)
- [src/apps/Settings/Settings.tsx](file:///home/jakub/github/propoj-app/src/apps/Settings/Settings.tsx)
- [src/data/apps.ts](file:///home/jakub/github/propoj-app/src/data/apps.ts)

## Tasks

<task type="auto">
  <name>Appwrite serverless Email proxy funkce a emailStore</name>
  <files>
    <file>src/stores/emailStore.ts</file>
    <file>scripts/emailProxyFunction.js</file>
  </files>
  <action>
    1. Vytvořit soubor `scripts/emailProxyFunction.js` obsahující Node.js kód pro serverless funkci v Appwrite:
       - Využít knihovny pro IMAP (`imapflow` nebo `node-imap`) a SMTP (`nodemailer`).
       - Funkce bude přijímat požadavky přes HTTP POST s JSON payloadem:
         - `action`: `listMessages` (stáhnout hlavičky a základní metadata emailů), `getMessage` (stáhnout celé tělo a přílohy konkrétního emailu) nebo `sendMessage` (odeslat email).
         - `config`: šifrované nebo předané přihlašovací údaje k IMAP a SMTP (host, port, secure, username, password).
         - Bezpečně se připojit, vykonat operaci, odpojit se a vrátit typovaný JSON výsledek.
    2. Vytvořit Zustand store `src/stores/emailStore.ts` v jádru OS:
       - Definovat typy pro `EmailMessage` (id, subject, from, to, date, body, read, folder), `EmailAccountConfig` (host, port, secure, username, password).
       - Spravovat globální stav: seznam zpráv, vybraná zpráva, aktivní složka (Doručené, Odeslané, Koš), stav připojení, chyby, a nastavení účtu.
       - Implementovat akce `loadMessages(userId)`, `fetchMessageBody(messageId, userId)`, `sendEmail(to, subject, textHtml, userId)`, `saveAccountConfig(config, userId)`.
       - Integrovat **kompletní mock inbox fallback**: Pokud nejsou v systému uloženy žádné přihlašovací údaje k reálnému e-mailu, store automaticky inicializuje nádhernou sadu fiktivních zpráv s perzistencí, což zaručí okamžité předvedení e-mailového rozhraní i bez funkčního mail serveru.
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    Serverless kód je napsán a připraven k nasazení, emailStore existuje, exportuje správné typy a mock fallback funguje bez kompilačních chyb.
  </done>
</task>

<task type="auto">
  <name>Aplikace E-mail a integrace do Nastavení OS</name>
  <files>
    <file>src/apps/Email/Email.tsx</file>
    <file>src/apps/Email/Email.css</file>
    <file>src/apps/Settings/sections/EmailSection.tsx</file>
    <file>src/apps/Settings/Settings.tsx</file>
    <file>src/data/apps.ts</file>
  </files>
  <action>
    1. Vytvořit novou sekci v Nastavení `src/apps/Settings/sections/EmailSection.tsx`:
       - Elegantní formulář pro zadání parametrů IMAP serveru (host, port, SSL/TLS, uživatelské jméno, heslo) a SMTP serveru (host, port, SSL/TLS, uživatelské jméno, heslo).
       - Tlačítko "Ověřit a připojit", které otestuje spojení přes naši Appwrite funkci.
       - Tlačítko pro odpojení / vymazání konfigurace.
       - Ukládat konfiguraci do kolekce `user_preferences` v Appwrite pod přihlášeným uživatelem.
    2. Namontovat `EmailSection` do hlavního otevíracího rozhraní Nastavení `src/apps/Settings/Settings.tsx` (přidat novou záložku "E-mailový účet" s ikonou 📧).
    3. Vybudovat e-mailového klienta v `src/apps/Email/Email.tsx` v češtině (cs-CZ):
       - Dvoupanelové rozhraní (split view):
         - Levý panel: Seznam složek (Doručená pošta, Odeslané, Koš), vyhledávací lišta, a seznam zpráv (zobrazující odesílatele, předmět, datum a kousek textu s indikátorem přečtenosti).
         - Pravý panel (Mail Reader): Plný detail vybrané zprávy, odesílatel, čas, HTML/text tělo zprávy, akční tlačítka (Odpovědět, Přeposlat, Smazat).
         - Pokud není vybrána žádná zpráva, zobrazit elegantní dashboard s celkovým počtem zpráv a tipem pro rychlé napsání mailu.
       - Nová zpráva overlay (Compose Modal):
         - Překryvné okno s poli pro Příjemce (`To`), Předmět (`Subject`), a textovým editorem pro obsah zprávy.
         - Validace vstupů a odeslání s live spinnerem.
    4. Vytvořit vanilla CSS styly v `src/apps/Email/Email.css`:
       - Stylové rozdělení panelů, plynulé hover efekty na zprávách, barevná odlišení pro nepřečtené emaily a moderní glassmorphismus.
    5. Zaregistrovat aplikaci `Email` v `src/data/apps.ts` importem komponenty a jejím namontováním do pole `APPS` (id: 'email').
  </action>
  <verify>
    npx tsc --noEmit && npm run build
  </verify>
  <done>
    E-mailový klient je plně integrován s Nastavením, umožňuje zadávat credentials, asynchronně stahuje a odesílá zprávy a v případě chybějící konfigurace hladce spouští mock inbox rozhraní.
  </done>
</task>

## Success Criteria
- [ ] V Nastavení přibyla funkční sekce pro konfiguraci e-mailového účtu s uložením do Appwrite.
- [ ] Aplikace E-mail nabízí plně lokalizované dvoupanelové klientské rozhraní pro čtení a správu složek pošty.
- [ ] Compose Modal umožňuje psát a odesílat e-maily.
- [ ] Bez konfigurace se klient spustí a perzistentně simuluje mock e-maily (lze číst, mazat a "odesílat" zkušební zprávy).
- [ ] Produkční sestavení (`npm run build`) proběhne úspěšně a bez chyb.
