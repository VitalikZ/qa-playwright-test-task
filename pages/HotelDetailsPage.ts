import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HotelDetailsPage extends BasePage {
  private readonly verderButton = this.page.locator('.ProgressbarNavigation__summaryButton button');

  constructor(page: Page) {
    super(page);
  }

  async waitForLoaded(): Promise<void> {
    await this.waitForPageLoad();
    await this.verderButton.waitFor({ state: 'visible' });
  }

  async clickVerder(): Promise<void> {
    await this.clickElement(this.verderButton);
  }
}
