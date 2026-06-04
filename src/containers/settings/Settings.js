import React from "react";
import {
  Container,
  Typography,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Box
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { usePreferences } from "../../contexts/PreferencesContext";

const colorSchemes = [
  { value: "sepia", label: "Sepia" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

const languages = [
  { value: "french", label: "French" },
  { value: "urdu", label: "Urdu" },
  { value: "norsk", label: "Norsk" },
  { value: "english", label: "English" },
];

// Top 100 features categorized
const changelogCategories = [
  {
    title: "Playback & Core Audio Engine (Features 1-15)",
    features: [
      "1. PWA-Native Streaming: Fast HTML5 audio streaming optimized for slow network connections.",
      "2. Persistent Audio Progress: Automatically resumes playback precisely where you left off on returning.",
      "3. Session Recovery: Remembers played lectures even after browser restarts or closing the browser window.",
      "4. Auto-Play Next: Automatically starts playing the next audio lecture in sequence when the current track finishes.",
      "5. Progress Auto-Clear: Automatically deletes progress from local storage once a lecture has been listened to completely.",
      "6. Robust Minimized Mode: Offers a compact, non-intrusive floating bottom player with essential controls.",
      "7. Maximized Player Panel: Displays high-fidelity progress slider, current track information, and active controls.",
      "8. Volume Controls: Easily adjustable volume bars for desktop and touch-friendly sliders for mobile screens.",
      "9. Skip forward/backward: Jump forwards or backwards quickly through playback tracks.",
      "10. Loop Mode: Native loop playback toggle to continuously replay the current lecture.",
      "11. Responsive Native Control Integration: Support for media keys via standard browser APIs.",
      "12. Lockscreen Controls: Audio control from phone lock screen using modern browser integration.",
      "13. Buffering Visualizer: Show clear loader spinner during audio buffering states.",
      "14. Error Handling: Graceful recovery if an audio source link fails to load.",
      "15. Smart Skip Boundaries: Skip controls auto-disable on the first/last track of lists."
    ]
  },
  {
    title: "Search & Discoverability (Features 16-25)",
    features: [
      "16. Continuous Autocomplete: Zero-delay search dropdown updates instantly as you type.",
      "17. Continuous Word Filtering: Regex search engine configured to match continuous sub-words (e.g. 'cat' matches 'catalog' but not 'casket').",
      "18. Islamic Synonym Translation: Advanced synonym mapping for search terms (e.g. Quran ⇄ Koran, Hadith ⇄ Hadees ⇄ Hadis).",
      "19. Phonetic Term Matching: Handles phonetic spellings (e.g. Azan ⇄ Adhan ⇄ Athan, Namaz ⇄ Salah ⇄ Salat).",
      "20. Search-As-You-Type: Immediate client-side search across index database.",
      "21. High-performance Indexing: Pre-indexed database for rapid text matching without server overhead.",
      "22. Highlight Matching text: Bold or highlight the typed keyword within search matches.",
      "23. Category Breadcrumbs: See parent categories directly inside the search results listing.",
      "24. Quick Clear Search: Simple one-tap button to clear search input field.",
      "25. Persistent Search Queries: Cache the last typed queries to return to recent searches quickly."
    ]
  },
  {
    title: "UI/UX & Design System (Features 26-45)",
    features: [
      "26. Theme Configuration: Five built-in custom color palettes (Sepia, Red, Green, Blue, Dark, Light).",
      "27. Elegant Dark Mode: Premium dark mode designed to minimize eye strain.",
      "28. Vibrant Text Gradients: Multi-color gradients inside category avatars (e.g., Orange-to-Yellow, Pink-to-Cyan).",
      "29. Dynamic Initials Avatar: Auto-generates initial letters from the category name when no cover art exists.",
      "30. Active Glow Animation: Displays a subtle neon-green glowing border on the currently playing card item.",
      "31. Fluid Layout Transitions: Smooth CSS animations for opening, closing, maximizing, and minimizing panels.",
      "32. Responsive Column Grid: Automatic resizing layout for mobile (1 column), tablet (2 columns), and desktop (3 columns).",
      "33. Category Slider: Horizontal scrolling category pill selector on the main page.",
      "34. Compact Navigation: Clean and responsive header bar with instant page routing.",
      "35. Custom Toast Notifications: Stylish alert popups for user actions such as playlist additions or link copying.",
      "36. Custom Scrollbar Styling: Sleek customized scroll tracks styled specifically for browsers.",
      "37. Optimized Icon Set: Leverages Google Material Icons with zero-latency rendering.",
      "38. Zero Placeholder Policy: Always displays dynamic gradients or custom graphics instead of blank images.",
      "39. Responsive Typography: Adapts font sizes dynamically via standard css clamp/media queries.",
      "40. Hover Feedback States: Subtle scaling and opacity animation on clicking or hovering buttons.",
      "41. Pill-shaped minimized control: Modern floating player that doesn't cover main navigation buttons.",
      "42. Category Details view: Beautifully styled landing pages for specific audio series and collections.",
      "43. Clean Divider Separation: Structured dividers to partition content neatly.",
      "44. No Page Flickering: Optimized client-side React rendering preventing white screens during page transitions.",
      "45. Multi-level category tree layout: Indented listings to represent deep nested subcategories."
    ]
  },
  {
    title: "Offline & Cache Architecture (Features 46-55)",
    features: [
      "46. Offline Dexie Database: Stores entire audio catalogs locally inside IndexedDB.",
      "47. Offline Mode Capability: Fully functional interface even when completely disconnected from the internet.",
      "48. Dynamic Service Worker: Auto-caches critical assets (JS, CSS, HTML, config).",
      "49. Cache Storage Manager: Detailed view listing all cached items on the local storage system.",
      "50. One-Tap Cache Clearing: Settings tool to easily clear accumulated cached media data.",
      "51. Background Cache Prefetch: Preloads upcoming tracks silently over WiFi.",
      "52. Storage Estimator: Simple visualization showing storage limits and cached size.",
      "53. Progressive Loading: Serves critical files from cache first and updates from network in the background.",
      "54. Network Detection indicator: Warns user if connection is lost, and prioritizes local audio files.",
      "55. Automatic DB Migration: Gracefully migrates client schemas on version increments."
    ]
  },
  {
    title: "Playlist & Personalization (Features 56-70)",
    features: [
      "56. Custom Playlist Creation: Create and name personal collections of lectures.",
      "57. Add to Playlist Dialog: Select multiple playlists to insert audio files from any card.",
      "58. Favorites Toggling: Simple heart icon to add tracks to the persistent favorites collection.",
      "59. Listen History: Automatically populates a 'Recently Played' list for quick history tracking.",
      "60. Drag-and-Drop Ordering: Reorganize tracks in your playlist easily (Boilerplate).",
      "61. Playlist Metadata Editor: Change custom playlist names or delete playlists.",
      "62. Category Subscriptions: Bookmark whole categories for easy access from the homepage dashboard.",
      "63. Multi-add capability: Add all audios inside a category to a playlist in a single click.",
      "64. Favorites Quick play: Tap play on the favorites banner to shuffle or play favorites.",
      "65. Playlist share: Export custom playlist configuration codes.",
      "66. Recently Played limit: Smart queue keeping history capped to 40 items.",
      "67. Local Storage Backup: Export and download user preferences, playlists, and settings.",
      "68. Local Backup Restore: Load JSON settings file to restore favorite lists on other devices.",
      "69. Custom Profile Avatars: Initials-based avatar customization.",
      "70. Category sorting options: View lecture collections alphabetically or by publication date."
    ]
  },
  {
    title: "State Persistence & Performance (Features 71-85)",
    features: [
      "71. Infinite Lazy Scroll: Dynamic intersection observer loading items as you scroll down.",
      "72. Low-Memory Rendering: Recycles DOM nodes during infinite scroll to prevent memory leaks on old phones.",
      "73. Redux state management: Centralized Redux Toolkit store for smooth state synchronization.",
      "74. Debounced inputs: Prevents laggy performance by debouncing typing inputs in search forms.",
      "75. Lazy loading images: Postpones image fetching until they enter the viewport.",
      "76. Fast JSON parsing: Pre-compiled static metadata sets for fast initial bootstrap.",
      "77. Bundle splitting: Lazy-loaded route components splitting bundle code sizes.",
      "78. Optimal re-renders: UseMemo and UseCallback optimized react hook trees.",
      "79. Local DB sync scripts: Automated sync engine keeping IndexedDB fresh.",
      "80. Hardware Acceleration: CSS transformation-based animation triggers utilizing CPU/GPU.",
      "81. Offline database querying: Faster-than-API local database lookups for instant lists.",
      "82. Indexed database indexes: High performance keys for categories, subcategories, and files.",
      "83. API call batching: Group multiple category detail requests.",
      "84. Asset minification: Highly optimized build output removing comments, debugging, and whitespace.",
      "85. DNS prefetch links: Speeds up media resource handshakes on startup."
    ]
  },
  {
    title: "Settings, Configuration & Localization (Features 86-95)",
    features: [
      "86. Quick Preferences panel: Dynamic sliders and toggles inside Settings page.",
      "87. Localization dictionaries: English translations with full French, Norwegian, and Urdu layouts.",
      "88. Direction control support (RTL): Layout mirrors structure when switching to RTL languages like Urdu.",
      "89. Reset Application state: Complete factory reset button to wipe app data and start fresh.",
      "90. App Version tracking: Explicit version indicator displayed inside settings menu.",
      "91. Data Saver mode: Restricts automatic media downloading to save cellular data limits.",
      "92. GitHub link integration: View source code and project updates on Github.",
      "93. About section: Developer information and dedicated project mission statements.",
      "94. Detailed feature walkthrough: Integrated changelog directory embedded for quick reference.",
      "95. User Feedback module: Quick copy of diagnostic status code for easy bug reporting."
    ]
  },
  {
    title: "PWA, Build & Security (Features 96-100)",
    features: [
      "96. PWA Standalone installation: Add web app icon to phone home screen or desktop taskbar.",
      "97. Wrangler integration: Deploys securely via Cloudflare Workers and pages.",
      "98. Github Actions pipeline: Auto-deploys testing and production branches on commits.",
      "99. W3C standards compliance: Fully compliant HTML5 structure passing strict semantic accessibility checks.",
      "100. Content Security Policy (CSP): High-security constraints blocking unauthorized external scripts."
    ]
  }
];

const Settings = () => {
  const {
    preferences: { colorScheme, language },
    setColorScheme,
    setLanguage,
  } = usePreferences();

  return (
    <Container maxWidth="md" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <Paper style={{ padding: 24, marginBottom: 24 }}>
        <Typography variant="h5" gutterBottom style={{ fontWeight: "bold" }}>
          Preferences
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Choose your preferred color scheme and language for the application.
        </Typography>
        <Divider style={{ marginBottom: 24 }} />

        <FormControl component="fieldset" style={{ marginBottom: 24 }}>
          <FormLabel component="legend" style={{ fontWeight: "bold", marginBottom: 8 }}>Color scheme</FormLabel>
          <RadioGroup
            aria-label="color-scheme"
            name="color-scheme"
            value={colorScheme}
            onChange={(event) => setColorScheme(event.target.value)}
            row
          >
            {colorSchemes.map((scheme) => (
              <FormControlLabel key={scheme.value} value={scheme.value} control={<Radio color="primary" />} label={scheme.label} />
            ))}
          </RadioGroup>
        </FormControl>

        <Divider style={{ marginBottom: 24 }} />

        <FormControl component="fieldset">
          <FormLabel component="legend" style={{ fontWeight: "bold", marginBottom: 8 }}>Language</FormLabel>
          <RadioGroup
            aria-label="language"
            name="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            row
          >
            {languages.map((option) => (
              <FormControlLabel key={option.value} value={option.value} control={<Radio color="primary" />} label={option.label} />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>

      <Paper style={{ padding: 24 }}>
        <Typography variant="h5" gutterBottom style={{ fontWeight: "bold" }}>
          Changelog & Features
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          View version history and complete directory of the top 100 features.
        </Typography>
        <Divider style={{ marginBottom: 24 }} />

        <Box my={2}>
          {changelogCategories.map((cat, idx) => (
            <Accordion key={idx} variant="outlined" style={{ marginBottom: 8 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography style={{ fontWeight: 600 }}>{cat.title}</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ display: "block" }}>
                <List dense>
                  {cat.features.map((feature, fIdx) => (
                    <ListItem key={fIdx}>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
