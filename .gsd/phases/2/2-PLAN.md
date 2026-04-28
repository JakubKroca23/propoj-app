---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: HUD Contact Form

## Objective
Implement a functional contact form with HUD aesthetics that saves messages to Appwrite.

## Context
- .gsd/SPEC.md
- src/lib/appwrite.ts

## Tasks

<task type="auto">
  <name>Implement Contact Section</name>
  <files>src/components/sections/Contact.tsx, src/App.tsx</files>
  <action>
    - Vytvořit sekci `Contact.tsx` s formulářem (Jméno, Email, Zpráva).
    - Použít HUD styly pro inputy (neonové okraje, mono fonty).
    - Integrovat do `App.tsx` na konec stránky.
  </action>
  <verify>Ruční testování polí formuláře.</verify>
  <done>Formulář je vizuálně integrovaný do JARVIS UI.</done>
</task>

<task type="auto">
  <name>Appwrite Form Integration</name>
  <files>src/components/sections/Contact.tsx</files>
  <action>
    - Implementovat odesílání dat do Appwrite Database (kolekce 'messages').
    - Přidat stavy pro odesílání (loading) a úspěch/chybu (success/error toast).
  </action>
  <verify>Odeslání testovací zprávy a kontrola síťového požadavku.</verify>
  <done>Zprávy se úspěšně ukládají do Appwrite.</done>
</task>

## Success Criteria
- [ ] Formulář je plně funkční a responzivní.
- [ ] Zprávy jsou uloženy v Appwrite databázi.
