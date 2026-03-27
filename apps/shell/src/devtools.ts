/**
 * Platform DevTools — real-time architecture visibility.
 *
 * Shows what's happening under the hood:
 * - Event bus traffic (events, commands)
 * - Module lifecycle (load, mount, unmount, errors)
 * - Data source calls
 * - Feature flag changes
 *
 * Features:
 * - Drag-to-resize from top edge
 * - Floating toggle button when panel is hidden
 * - Controlled by devtools_enabled feature flag
 */

export interface DevLogEntry {
  readonly timestamp: number;
  readonly category: 'event' | 'command' | 'module' | 'data' | 'flags' | 'error';
  readonly message: string;
  readonly detail?: string;
}

const CATEGORY_COLORS: Record<DevLogEntry['category'], string> = {
  event: 'var(--color-primary)',
  command: '#8b5cf6',
  module: 'var(--color-success)',
  data: 'var(--color-warning)',
  flags: '#ec4899',
  error: 'var(--color-error)',
};

const CATEGORY_LABELS: Record<DevLogEntry['category'], string> = {
  event: 'Event',
  command: 'Cmd',
  module: 'Module',
  data: 'Data',
  flags: 'Flags',
  error: 'Error',
};

const MAX_ENTRIES = 100;
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 280;

export class DevTools {
  private entries: DevLogEntry[] = [];
  private container: HTMLElement | null = null;
  private logList: HTMLElement | null = null;
  private resizeHandle: HTMLElement | null = null;
  private toggleBtn: HTMLElement | null = null;
  private visible = false;
  private disabled = false;
  private height = DEFAULT_HEIGHT;

  /** Initialize — creates the devtools panel + floating toggle button. */
  init(): void {
    this.createPanel();
    this.createToggleButton();
  }

  private createPanel(): void {
    this.container = document.createElement('div');
    this.container.id = 'platform-devtools';
    this.container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: ${this.height}px;
      background: #0f172a;
      color: #e2e8f0;
      font-family: var(--font-mono, monospace);
      font-size: 12px;
      z-index: 9999;
      display: none;
      flex-direction: column;
    `;

    // Resize handle — draggable top edge
    this.resizeHandle = document.createElement('div');
    this.resizeHandle.style.cssText = `
      height: 4px;
      background: var(--color-primary);
      cursor: ns-resize;
      flex-shrink: 0;
      transition: background 0.15s;
    `;
    this.resizeHandle.addEventListener('mouseenter', () => {
      this.resizeHandle!.style.background = '#38bdf8';
    });
    this.resizeHandle.addEventListener('mouseleave', () => {
      this.resizeHandle!.style.background = 'var(--color-primary)';
    });
    this.initResize();

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      flex-shrink: 0;
    `;
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-weight:600;color:#38bdf8">Platform DevTools</span>
        <span style="color:#64748b">Real-time architecture visibility</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <button id="devtools-clear" style="background:none;border:1px solid #475569;color:#94a3b8;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px">Clear</button>
        <button id="devtools-close" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;line-height:1">✕</button>
      </div>
    `;

    // Log list
    this.logList = document.createElement('div');
    this.logList.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    `;

    this.container.appendChild(this.resizeHandle);
    this.container.appendChild(header);
    this.container.appendChild(this.logList);
    document.body.appendChild(this.container);

    header.querySelector('#devtools-clear')?.addEventListener('click', () => {
      this.clear();
    });
    header.querySelector('#devtools-close')?.addEventListener('click', () => {
      this.hide();
    });
  }

  private createToggleButton(): void {
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.id = 'devtools-toggle';
    this.toggleBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20V10M18 20V4M6 20v-4"/>
      </svg>
    `;
    this.toggleBtn.title = 'Platform DevTools';
    this.toggleBtn.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #0f172a;
      color: #38bdf8;
      border: 2px solid #334155;
      cursor: pointer;
      z-index: 9998;
      display: none;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.15s, border-color 0.15s;
    `;
    this.toggleBtn.addEventListener('mouseenter', () => {
      this.toggleBtn!.style.transform = 'scale(1.1)';
      this.toggleBtn!.style.borderColor = '#38bdf8';
    });
    this.toggleBtn.addEventListener('mouseleave', () => {
      this.toggleBtn!.style.transform = 'scale(1)';
      this.toggleBtn!.style.borderColor = '#334155';
    });
    this.toggleBtn.addEventListener('click', () => {
      this.show();
    });

    document.body.appendChild(this.toggleBtn);
  }

  private initResize(): void {
    if (!this.resizeHandle) return;

    let startY = 0;
    let startHeight = 0;
    let dragging = false;

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging || !this.container) return;
      const delta = startY - e.clientY;
      const newHeight = Math.min(Math.max(startHeight + delta, MIN_HEIGHT), MAX_HEIGHT);
      this.height = newHeight;
      this.container.style.height = `${newHeight}px`;
      this.updateMainPadding();
    };

    const onMouseUp = () => {
      dragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    this.resizeHandle.addEventListener('mousedown', (e: MouseEvent) => {
      dragging = true;
      startY = e.clientY;
      startHeight = this.height;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  /** Log an entry. */
  log(category: DevLogEntry['category'], message: string, detail?: string): void {
    const entry: DevLogEntry = {
      timestamp: Date.now(),
      category,
      message,
      detail,
    };

    this.entries.push(entry);
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.shift();
    }

    this.renderEntry(entry);

    const prefix = `[${CATEGORY_LABELS[category]}]`;
    if (detail) {
      console.log(`%c${prefix}%c ${message} %c${detail}`, `color:${CATEGORY_COLORS[category]};font-weight:bold`, 'color:inherit', 'color:#64748b');
    } else {
      console.log(`%c${prefix}%c ${message}`, `color:${CATEGORY_COLORS[category]};font-weight:bold`, 'color:inherit');
    }
  }

  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show(): void {
    if (!this.container) return;
    this.container.style.display = 'flex';
    this.visible = true;
    this.updateMainPadding();

    // Hide toggle button when panel is visible
    if (this.toggleBtn) {
      this.toggleBtn.style.display = 'none';
    }
  }

  hide(): void {
    if (!this.container) return;
    this.container.style.display = 'none';
    this.visible = false;
    document.querySelector('.shell-main')?.setAttribute('style', '');

    // Show toggle button when panel is hidden (but only if not disabled)
    if (this.toggleBtn && !this.disabled) {
      this.toggleBtn.style.display = 'flex';
    }
  }

  /** Disable completely — hides panel AND toggle button. Feature flag off. */
  disable(): void {
    this.disabled = true;
    if (this.container) {
      this.container.style.display = 'none';
    }
    if (this.toggleBtn) {
      this.toggleBtn.style.display = 'none';
    }
    this.visible = false;
    document.querySelector('.shell-main')?.setAttribute('style', '');
  }

  /** Enable — restores toggle button. Feature flag on. */
  enable(): void {
    this.disabled = false;
    this.show();
  }

  isVisible(): boolean {
    return this.visible;
  }

  private updateMainPadding(): void {
    const main = document.querySelector('.shell-main') as HTMLElement | null;
    if (main) {
      main.style.paddingBottom = `${this.height + 10}px`;
    }
  }

  private clear(): void {
    this.entries = [];
    if (this.logList) {
      this.logList.innerHTML = '';
    }
  }

  private renderEntry(entry: DevLogEntry): void {
    if (!this.logList) return;

    const el = document.createElement('div');
    el.style.cssText = `
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 3px 12px;
      border-bottom: 1px solid #1e293b;
    `;

    const time = new Date(entry.timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    el.innerHTML = `
      <span style="color:#475569;flex-shrink:0;width:85px">${time}</span>
      <span style="color:${CATEGORY_COLORS[entry.category]};font-weight:600;flex-shrink:0;width:52px">${CATEGORY_LABELS[entry.category]}</span>
      <span style="color:#e2e8f0">${entry.message}</span>
      ${entry.detail ? `<span style="color:#64748b;margin-left:auto">${entry.detail}</span>` : ''}
    `;

    this.logList.appendChild(el);
    this.logList.scrollTop = this.logList.scrollHeight;
  }
}
