---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Secure Iframe Sandbox & postMessage Handshake

## Objective
Implementovat vysoce bezpečný běh pluginů v přísně sandboxed `<iframe>` a vytvořit ověřovací postMessage handshake, který blokuje neautorizované zprávy z jiných zdrojů.

## Context
- [.gsd/phases/2/RESEARCH.md](file:///.gsd/phases/2/RESEARCH.md)
- [src/shell/WindowManager/Window.tsx](file:///home/jakub/github/propoj-app/src/shell/WindowManager/Window.tsx)
- [src/stores/windowStore.ts](file:///home/jakub/github/propoj-app/src/stores/windowStore.ts)

## Tasks

<task type="auto">
  <name>Generování relačních tokenů v WindowStore</name>
  <files>
    src/types/index.ts
    src/stores/windowStore.ts
  </files>
  <action>
    1. Uprav typ `AppWindow` v `src/types/index.ts` (nebo tam, kde je definován) tak, aby obsahoval volitelné vlastnosti `token?: string` a `url?: string`.
    2. Uprav `openWindow` akci v `src/stores/windowStore.ts`:
       - Pokud má otevíraná aplikace URL adresu (custom plugin), vygeneruj unikátní relační token pomocí `crypto.randomUUID()`.
       - Ulož vygenerovaný `token` do stavu okna v poli `windows`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Každé otevřené okno custom pluginu obdrží unikátní jednorázový session token.</done>
</task>

<task type="auto">
  <name>Sandboxed Iframe komponenta v Window.tsx</name>
  <files>
    src/shell/WindowManager/Window.tsx
    src/shell/WindowManager/IframeLoader.tsx
    src/shell/WindowManager/Window.css
  </files>
  <action>
    1. Vytvoř komponentu `src/shell/WindowManager/IframeLoader.tsx`:
       - Přijímá `url`, `windowId` a `token` jako props.
       - Renderuje `<iframe>` s nastaveným sandboxem: `sandbox="allow-scripts"`. **ABSENCE** `allow-same-origin` je kritická pro bezpečnost!
       - URL adresa v iframe bude sestavena jako: `${url}?origin=${encodeURIComponent(window.location.origin)}&windowId=${windowId}&token=${token}`.
       - Stylování: zabere 100 % šířky i výšky okna, bez okrajů (`border: none`).
    2. Uprav `src/shell/WindowManager/Window.tsx` — pokud má okno přiřazené `url` (nebo `appId` odpovídá custom registru), vyrenderuj `<IframeLoader url={win.url} windowId={win.id} token={win.token} />` namísto defaultního placeholderu.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Iframe s pluginem se úspěšně vykreslí se zabezpečeným sandboxem a předanými URL signaturami.</done>
</task>

## Success Criteria
- [ ] Otevíraná okna pluginů jsou spouštěna v iframech s atributem `sandbox="allow-scripts"`.
- [ ] Každému oknu je přiřazen bezpečný vygenerovaný UUID token.
- [ ] TypeScript kompilace proběhne bez chyb.
