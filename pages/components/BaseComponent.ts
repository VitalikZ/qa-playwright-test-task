import type { Page, Locator } from '@playwright/test';

export abstract class BaseComponent {
  protected readonly page: Page;
  protected readonly root: Locator;

  protected constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
  }

  async waitForVisible(timeout = 5000): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout });
  }

  async waitForHidden(timeout = 5000): Promise<void> {
    await this.root.waitFor({ state: 'hidden', timeout });
  }

  async isVisible(timeout = 2000): Promise<boolean> {
    try {
      await this.root.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
}

