# Daily Reminder 📝

A minimalist web application that acts as a persistent daily note/reminder pad. Perfect for jotting down thoughts, reminders, and notes that persist across browser sessions.

## Features

### Core Features

- **Full-screen textarea** - Distraction-free writing experience
- **Auto-save** - Content automatically saves to localStorage as you type
- **Persistent storage** - Your notes are always there when you return
- **Clear function** - Reset notes with confirmation dialog
- **Offline support** - Works completely offline as a PWA (Progressive Web App)
- **No backend required** - Everything runs client-side

### Enhanced Features

- **Theme support** - Light/dark/system preference themes
- **Mobile responsive** - Works great on phones and tablets
- **Keyboard shortcuts** - Quick actions via keyboard
- **Character/word count** - Real-time statistics
- **Auto-focus** - Cursor ready for typing immediately
- **Tab support** - Insert tabs in textarea for formatting

## Usage

### Basic Usage

1. Open `index.html` in your browser
2. Start typing your notes/reminders
3. Content saves automatically as you type
4. Return anytime to find your notes exactly as you left them

### Keyboard Shortcuts

- **Ctrl/Cmd + K** - Clear all content (with confirmation)
- **Ctrl/Cmd + T** - Toggle theme (light/dark)
- **Tab** - Insert 4 spaces for indentation
- **Escape** - Close modal dialogs

### Installing as PWA

1. Open the app in Chrome/Edge/Safari
2. Click the install button in the address bar
3. The app will be installed like a native app
4. Access from your desktop/home screen

## Technical Details

### File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # CSS with theme support
├── script.js           # JavaScript functionality
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline support
└── README.md          # This file
```

### Browser Compatibility

- **Chrome/Chromium** - Full support
- **Firefox** - Full support
- **Safari** - Full support
- **Edge** - Full support
- **Mobile browsers** - Full support

### Storage

- Uses `localStorage` for data persistence
- No external dependencies or servers required
- Data stays on your device for privacy

## Customization

### Themes

The app supports three theme modes:

- **Light** - Clean white background
- **Dark** - Easy on the eyes dark mode
- **System** - Follows your device's theme preference

### Styling

Edit `styles.css` to customize:

- Colors and fonts
- Layout and spacing
- Responsive breakpoints
- Animations and transitions

### Functionality

Modify `script.js` to add features like:

- Export to different formats
- Cloud backup integration
- Encryption for privacy
- Multi-note support

## Development

### Local Development

1. Clone this repository
2. Open `index.html` in a browser
3. No build process required!

### Adding Features

The code is modular and well-commented. Key areas:

- `DailyReminderApp` class in `script.js` - Main application logic
- CSS custom properties in `styles.css` - Theme system
- Service worker in `sw.js` - Offline functionality

## License

This project is open source. Feel free to use, modify, and distribute as needed.

## Contributing

Contributions welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.
