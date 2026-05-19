---
phase: 2
level: 2
researched_at: 2026-05-19
---

# Phase 2 Research: Plugin Runtime & App Registry

## Questions Investigated
1. **Bezpečnost v Sandboxed Iframe**: Jak bezpečně komunikovat s iframe, který má `sandbox="allow-scripts"` a jehož origin je `"null"`?
2. **Appwrite Database Schema**: Jak navrhnout databázové kolekce pro pluginy a uživatelská nastavení Bento gridu?
3. **postMessage Bridge Protokol**: Jaké zprávy bude API bridge podporovat a jak zajistit typovou bezpečnost a spolehlivost?

---

## Findings

### 1. Bezpečný Iframe Sandbox ( postMessage Token Bridge )
Vzhledem k tomu, že sandbox bez `allow-same-origin` má origin rovný `"null"`, nelze ověřit původ zprávy standardně přes `event.origin === window.location.origin`.

**Doporučené řešení (Secret Token Pattern):**
- Při spuštění pluginu vygeneruje `windowStore` unikátní `iframeId` a kryptograficky bezpečný náhodný `secretToken` (pomocí `crypto.randomUUID()`).
- Tyto parametry předáme do iframe přes URL query parametry:
  `src="https://plugin-url.com/?windowId=win_123&token=uuid_abc_123"`
- Plugin si při startu tyto parametry uloží a každou zprávu posílanou rodičovskému oknu podepíše tímto tokenem a ID.
- Hostitel (Canvas OS) zprávu přijme, vyhledá aktivní okno podle `windowId` a porovná token. Pokud souhlasí, zprávu bezpečně zpracuje.

#### Ukázkový Kód (Host):
```typescript
window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  
  const { windowId, token, action, payload } = data;
  if (!windowId || !token || !action) return;

  const win = windowStore.windows.find(w => w.id === windowId);
  if (!win || win.token !== token) {
    console.warn('[Security] Neautorizovaná zpráva z iframe!');
    return;
  }

  handlePluginAction(action, payload, win);
});
```

---

### 2. Appwrite Database Schema
Pro správu pluginů a synchronizaci Bento gridu zavedeme dvě kolekce v Appwrite Database:

#### Kolekce: `plugins`
Uchovává seznam nainstalovaných pluginů.
- `id` (String): Unikátní identifikátor pluginu (např. `calculator`).
- `name` (String): Název aplikace.
- `description` (String): Krátký popis.
- `url` (String): URL adresa, kde je hostována index.html pluginu.
- `icon` (String): Emoji nebo URL ikony.
- `permissions` (String[]): Seznam požadovaných oprávnění (např. `['storage', 'notification']`).
- `category` (String): Kategorie aplikace.

#### Kolekce: `user_preferences`
Uchovává nastavení a rozložení Bento gridu pro konkrétního uživatele.
- `userId` (String): ID uživatele z Appwrite Auth.
- `gridLayout` (String / JSON): JSON řetězec obsahující uspořádání kachliček (např. `[{ id: 'notes', size: 'md', index: 0 }, ...]`).

**Doporučení:** 
Kolekce budeme líně inicializovat při prvním přihlášení uživatele (pokud neexistují), abychom se vyhnuli zdlouhavému ručnímu naklikávání v Appwrite konzoli a zajistili hladký bootstrap.

---

### 3. API Bridge Protocol (Canvas OS API)
Plugin a hostitelský systém budou komunikovat přes následující typované zprávy:

| Název Akce | Směr | Popis |
|------------|------|-------|
| `canvas-os:init` | Plugin -> OS | Inicializační handshake. OS odpoví nastavením tématu a barev. |
| `canvas-os:notification` | Plugin -> OS | Vyvolá systémovou toast notifikaci v hostiteli. |
| `canvas-os:openWindow` | Plugin -> OS | Otevře jiné okno systému (např. notes). |
| `canvas-os:closeWindow` | Plugin -> OS | Zavře okno, ve kterém plugin běží. |
| `canvas-os:storage:set` | Plugin -> OS | Uloží klíč-hodnotu do perzistentního úložiště uživatele. |
| `canvas-os:storage:get` | Plugin -> OS | Vyžádá si klíč-hodnotu z úložiště. |

---

## Decisions Made
| Rozhodnutí | Volba | Zdůvodnění |
|------------|-------|------------|
| **Bezpečnost iframe** | Varianta A + Secret Token | Maximální bezpečnost bez rizik kompromitace dat a tokenů systému Canvas OS. |
| **Bento Grid Sync** | Appwrite Database | Synchronizace rozložení plochy napříč zařízeními pod uživatelským účtem. |
| **Inicializace DB** | Auto-bootstrap v kódu | Odpadá nutnost manuální konfigurace Appwrite DB při každém nasazení. |

---

## Patterns to Follow
- **UUID Tokeny**: Vždy používat kryptografické tokeny pro ověřování zpráv (`crypto.randomUUID()`).
- **Sanitizace vstupů**: Všechna data obdržená přes `postMessage` sanitovat a validovat před uložením nebo zpracováním.
- **Cleanup listenerů**: useEffect naslouchající na `message` události musí mít vždy return cleanup funkci odebírající listener.

## Anti-Patterns to Avoid
- **Nepoužívat wildcards (`*`) v `postMessage`**: Při odesílání zpráv z hostitele do pluginu vždy uvést přesný targetOrigin (pokud je známý) pro zabránění odposlechu.
- **Neukládat hesla do URL**: Tokeny slouží pouze pro relaci daného okna, nikdy neukládat trvalé uživatelské tokeny nebo hesla do query parametrů.

## Dependencies Identified
| Balíček | Verze | Účel |
|---------|-------|------|
| `appwrite` | ^14.0.0 | Integrace s Appwrite Database a User Preferences. |

## Risks & Mitigations
- **Útok přes změnu URL iframe**: Pokud by útočník dokázal změnit `src` aktivního iframe, mohl by zachytit tajný token.
  - *Mitigace:* Nastavíme v `Window.tsx` elementu iframe `sandbox` atributy tak, aby nemohl modifikovat nadřazené okno (`allow-top-navigation` nebude povoleno).
- **Lagy v komunikaci postMessage**: 
  - *Mitigace:* Všechny storage requesty budou asynchronní a využijí Promise pattern s timeoutem (např. 2000ms), aby plugin nezůstal viset na čekání odpovědi.

## Ready for Planning
- [x] Otázky zodpovězeny
- [x] Přístup vybrán
- [x] Závislosti identifikovány
