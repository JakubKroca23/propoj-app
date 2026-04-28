---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: JARVIS Contact Panel

## Objective
Implement a sliding HUD panel for the contact form, integrated with Appwrite.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- src/lib/appwrite.ts

## Tasks

<task type="auto">
  <name>Create ContactPanel Component</name>
  <files>src/components/ui/ContactPanel.tsx</files>
  <action>
    - Vytvořit `ContactPanel.tsx`: Vysouvací panel obsahující formulář.
    - HUD styl pro inputy: Mono font, neonové focus ringy, skleněný efekt pozadí.
    - Pole: Jméno, Email, Zpráva.
  </action>
  <verify>Ruční kontrola vzhledu formuláře na různých zařízeních.</verify>
  <done>Kontaktní modul ladí se zbytkem JARVIS UI.</done>
</task>

<task type="auto">
  <name>Integrate Message Storage</name>
  <files>src/components/ui/ContactPanel.tsx</files>
  <action>
    - Implementovat odesílání do kolekce `messages`.
    - Automaticky přidat `timestamp` (new Date().toISOString()).
    - Přidat vizuální potvrzení o odeslání přímo v HUD panelu.
  </action>
  <verify>Odeslání testovací zprávy a kontrola v Appwrite Database.</verify>
  <done>Zprávy jsou úspěšně ukládány se všemi povinnými atributy.</done>
</task>

## Success Criteria
- [ ] Kontaktní formulář je plně funkční v rámci vysouvacího HUD panelu.
- [ ] Validace emailu a povinných polí je aktivní.
