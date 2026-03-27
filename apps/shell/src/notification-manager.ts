/**
 * Notification manager — renders toast notifications from any module.
 *
 * Modules publish Notification events via event bus → shell renders them.
 * Also handles ShowNotification commands.
 */

export interface NotificationOptions {
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  durationMs?: number;
}

export class NotificationManager {
  private container: HTMLElement | null = null;

  /** Initialize — creates the notification container in DOM. */
  init(): void {
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
  }

  /** Show a notification toast. */
  show(options: NotificationOptions): void {
    if (!this.container) return;

    const el = document.createElement('div');
    el.className = `notification notification-${options.level}`;
    el.innerHTML = `<span class="notification-message">${options.message}</span>`;

    this.container.appendChild(el);

    const duration = options.durationMs ?? 4000;
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      el.style.transition = 'all 0.2s ease';
      setTimeout(() => el.remove(), 200);
    }, duration);
  }

  /** Cleanup. */
  destroy(): void {
    this.container?.remove();
    this.container = null;
  }
}
