import { Page, Locator } from '@playwright/test';
import { config } from '@config/environment.config';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly errorBanner: Locator;
  protected readonly errorBannerTitle: Locator;
  protected readonly errorBannerDescription: Locator;

  constructor(page: Page) {
    this.page = page;
    this.errorBanner = this.page.locator('.ErrorBanner__errorBannerWrapper');
    this.errorBannerTitle = this.page.locator('.ErrorBanner__title');
    this.errorBannerDescription = this.page.locator('.ErrorBanner__description');
  }

  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: config.timeouts.navigation,
    });
  }

  async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'visible',
      timeout: timeout || config.timeouts.default,
    });
  }

  async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'hidden',
      timeout: timeout || config.timeouts.default,
    });
  }

  async clickElement(locator: Locator, options?: { force?: boolean; timeout?: number }): Promise<void> {
    await this.waitForVisible(locator, options?.timeout);
    await locator.click({ 
      force: options?.force,
      timeout: options?.timeout || config.timeouts.default,
    });
  }

  async getTextContent(locator: Locator): Promise<string> {
    await this.waitForVisible(locator);
    const text = await locator.textContent();
    return text?.trim() || '';
  }

  async isVisible(locator: Locator, timeout?: number): Promise<boolean> {
    try {
      await this.waitForVisible(locator, timeout || config.timeouts.short);
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  async getAllElements(locator: Locator): Promise<Locator[]> {
    await locator.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    const count = await locator.count();
    const elements: Locator[] = [];
    
    for (let i = 0; i < count; i++) {
      elements.push(locator.nth(i));
    }
    
    return elements;
  }

  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async isErrorBannerVisible(): Promise<boolean> {
    try {
      return await this.errorBanner.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  async getErrorBannerMessage(): Promise<{ title: string; description: string } | null> {
    if (await this.isErrorBannerVisible()) {
      const title = await this.errorBannerTitle.textContent() || '';
      const description = await this.errorBannerDescription.textContent() || '';
      return { title: title.trim(), description: description.trim() };
    }
    return null;
  }
}
