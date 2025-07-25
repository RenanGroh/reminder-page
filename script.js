/**
 * Daily Reminder App
 * A minimalist note-taking application with localStorage persistence
 */

class DailyReminderApp {
  constructor() {
    this.textarea = document.getElementById("reminder-textarea");
    this.saveStatus = document.getElementById("save-status");
    this.charCount = document.getElementById("char-count");
    this.clearBtn = document.getElementById("clear-btn");
    this.themeToggle = document.getElementById("theme-toggle");
    this.modal = document.getElementById("confirmation-modal");
    this.confirmClear = document.getElementById("confirm-clear");
    this.cancelClear = document.getElementById("cancel-clear");
    this.customPlaceholder = document.getElementById("custom-placeholder");

    this.STORAGE_KEY = "daily-reminder-content";
    this.THEME_KEY = "daily-reminder-theme";
    this.saveTimeout = null;
    this.SAVE_DELAY = 500; // milliseconds

    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.loadContent();
    this.loadTheme();
    this.bindEvents();
    this.updateCharCount();
    this.updatePlaceholderVisibility();
    this.registerServiceWorker();

    // Focus on textarea after everything loads
    setTimeout(() => {
      this.textarea.focus();
      this.textarea.setSelectionRange(
        this.textarea.value.length,
        this.textarea.value.length
      );
    }, 100);
  }

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Textarea events
    this.textarea.addEventListener("input", this.handleInput.bind(this));
    this.textarea.addEventListener("keydown", this.handleKeydown.bind(this));

    // Button events
    this.clearBtn.addEventListener(
      "click",
      this.showClearConfirmation.bind(this)
    );
    this.themeToggle.addEventListener("click", this.toggleTheme.bind(this));

    // Modal events
    this.confirmClear.addEventListener("click", this.clearContent.bind(this));
    this.cancelClear.addEventListener(
      "click",
      this.hideClearConfirmation.bind(this)
    );
    this.modal.addEventListener("click", this.handleModalClick.bind(this));

    // Keyboard shortcuts
    document.addEventListener("keydown", this.handleGlobalKeydown.bind(this));

    // Window events
    window.addEventListener("beforeunload", this.handleBeforeUnload.bind(this));
    window.addEventListener("focus", this.handleWindowFocus.bind(this));

    // Prevent accidental navigation
    window.addEventListener("beforeunload", (e) => {
      // Only show warning if there's unsaved content
      if (this.textarea.value.trim() && !this.isContentSaved()) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }

  /**
   * Handle textarea input with debounced saving
   */
  handleInput() {
    this.updateCharCount();
    this.updatePlaceholderVisibility();
    this.setSaveStatus("saving");

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout for saving
    this.saveTimeout = setTimeout(() => {
      this.saveContent();
    }, this.SAVE_DELAY);
  }

  /**
   * Update placeholder visibility based on textarea content
   */
  updatePlaceholderVisibility() {
    if (this.customPlaceholder) {
      if (this.textarea.value.trim() === '') {
        this.customPlaceholder.style.opacity = '0.6';
        this.customPlaceholder.style.pointerEvents = 'none';
        this.textarea.classList.remove('has-content');
      } else {
        this.customPlaceholder.style.opacity = '0';
        this.customPlaceholder.style.pointerEvents = 'none';
        this.textarea.classList.add('has-content');
      }
    }
  }

  /**
   * Handle special keyboard shortcuts in textarea
   */
  handleKeydown(e) {
    // Tab key support (insert 4 spaces)
    if (e.key === "Tab") {
      e.preventDefault();
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      const value = this.textarea.value;

      this.textarea.value =
        value.substring(0, start) + "    " + value.substring(end);
      this.textarea.setSelectionRange(start + 4, start + 4);

      // Trigger input event to save
      this.textarea.dispatchEvent(new Event("input"));
    }
  }

  /**
   * Handle global keyboard shortcuts
   */
  handleGlobalKeydown(e) {
    // Ctrl/Cmd + K to clear (with confirmation)
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      this.showClearConfirmation();
    }

    // Ctrl/Cmd + T to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === "t") {
      e.preventDefault();
      this.toggleTheme();
    }

    // Escape to close modal
    if (e.key === "Escape" && !this.modal.classList.contains("hidden")) {
      this.hideClearConfirmation();
    }
  }

  /**
   * Handle modal backdrop clicks
   */
  handleModalClick(e) {
    if (e.target === this.modal) {
      this.hideClearConfirmation();
    }
  }

  /**
   * Handle window focus (reload content in case it was changed elsewhere)
   */
  handleWindowFocus() {
    this.loadContent();
  }

  /**
   * Handle before page unload
   */
  handleBeforeUnload() {
    // Force save any pending changes
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveContent();
    }
  }

  /**
   * Load content from localStorage
   */
  loadContent() {
    try {
      const savedContent = localStorage.getItem(this.STORAGE_KEY);
      if (savedContent !== null) {
        this.textarea.value = savedContent;
        this.updateCharCount();
        this.updatePlaceholderVisibility();
        this.setSaveStatus("saved");
      }
    } catch (error) {
      console.error("Failed to load content from localStorage:", error);
      this.setSaveStatus("error");
    }
  }

  /**
   * Save content to localStorage
   */
  saveContent() {
    try {
      const content = this.textarea.value;
      localStorage.setItem(this.STORAGE_KEY, content);
      this.setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save content to localStorage:", error);
      this.setSaveStatus("error");
    }
  }

  /**
   * Check if current content matches saved content
   */
  isContentSaved() {
    try {
      const savedContent = localStorage.getItem(this.STORAGE_KEY) || "";
      return this.textarea.value === savedContent;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all content
   */
  clearContent() {
    this.textarea.value = "";
    this.saveContent();
    this.updateCharCount();
    this.updatePlaceholderVisibility();
    this.hideClearConfirmation();
    this.textarea.focus();
  }

  /**
   * Show clear confirmation modal
   */
  showClearConfirmation() {
    if (this.textarea.value.trim()) {
      this.modal.classList.remove("hidden");
      this.confirmClear.focus();
    }
  }

  /**
   * Hide clear confirmation modal
   */
  hideClearConfirmation() {
    this.modal.classList.add("hidden");
    this.textarea.focus();
  }

  /**
   * Update character count display
   */
  updateCharCount() {
    const count = this.textarea.value.length;
    this.charCount.textContent = `${count.toLocaleString()} character${
      count !== 1 ? "s" : ""
    }`;

    // Add word count too if there's content
    if (count > 0) {
      const words = this.textarea.value
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      this.charCount.textContent += ` • ${words.toLocaleString()} word${
        words !== 1 ? "s" : ""
      }`;
    }
  }

  /**
   * Set save status indicator
   */
  setSaveStatus(status) {
    this.saveStatus.className = `save-status ${status}`;

    switch (status) {
      case "saving":
        this.saveStatus.textContent = "Saving...";
        break;
      case "saved":
        this.saveStatus.textContent = "Saved";
        break;
      case "error":
        this.saveStatus.textContent = "Error saving";
        break;
      default:
        this.saveStatus.textContent = "Ready";
    }
  }

  /**
   * Load and apply theme
   */
  loadTheme() {
    try {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      let theme = savedTheme;

      // If no saved theme, detect system preference
      if (!theme) {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }

      this.applyTheme(theme);

      // Listen for system theme changes
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (!localStorage.getItem(this.THEME_KEY)) {
            this.applyTheme(e.matches ? "dark" : "light");
          }
        });
    } catch (error) {
      console.error("Failed to load theme:", error);
      this.applyTheme("light");
    }
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.updateThemeToggle(theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = theme === "dark" ? "#1a1a1a" : "#ffffff";
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    this.applyTheme(newTheme);

    try {
      localStorage.setItem(this.THEME_KEY, newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  }

  /**
   * Update theme toggle button appearance
   */
  updateThemeToggle(theme) {
    this.themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    this.themeToggle.title = `Switch to ${
      theme === "dark" ? "light" : "dark"
    } theme`;
  }

  /**
   * Register service worker for PWA functionality
   */
  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js");
        console.log("Service Worker registered successfully:", registration);
      } catch (error) {
        console.log("Service Worker registration failed:", error);
      }
    }
  }

  /**
   * Export content as text file
   */
  exportContent() {
    const content = this.textarea.value;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `daily-reminder-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get app statistics
   */
  getStats() {
    const content = this.textarea.value;
    const lines = content.split("\n").length;
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, "").length;

    return {
      lines,
      words,
      characters,
      charactersNoSpaces,
    };
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.reminderApp = new DailyReminderApp();
});

// Expose some utility functions to global scope for debugging
window.reminderUtils = {
  exportContent: () => window.reminderApp?.exportContent(),
  getStats: () => window.reminderApp?.getStats(),
  clearAll: () => window.reminderApp?.clearContent(),
  toggleTheme: () => window.reminderApp?.toggleTheme(),
};
