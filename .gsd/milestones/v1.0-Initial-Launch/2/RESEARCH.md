# Phase 2 Research: Dynamic UI & Appwrite Integration

## Objective
Verify the integration pattern for Appwrite Database and Auth within the JARVIS-style HUD.

## Findings

### Appwrite Integration
- SDK is already initialized in `src/lib/appwrite.ts`.
- `databases` and `account` instances are exported.
- Usage pattern: `databases.listDocuments(databaseId, collectionId, [Query...])`.

### Data Structure (Assumed)
For the portfolio to work, we need a `projects` collection:
- `title` (string)
- `description` (string/text)
- `thumbnail` (string/URL)
- `tags` (string[])
- `link` (string/URL)

### HUD Component Patterns
- `HudButton` is ready for interaction.
- Need a `HudCard` component for projects that matches the slanted/scifi aesthetic of `HudButton`.
- Need a `ContactForm` component with HUD-style inputs.

## Decisions
1. **State Management**: Use React's `useState` and `useEffect` for fetching projects. Since this is a simple portfolio, a global state (Redux/Zustand) is not needed yet.
2. **Visuals**: Projects will be displayed in a grid below the Hero section.
3. **Contact Form**: Use Appwrite's `createDocument` to save messages to a `messages` collection.
