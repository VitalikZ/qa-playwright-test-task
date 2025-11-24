import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FlightsSelectionPage extends BasePage {
  private readonly flightsContainer = this.page.locator('.YourFlights__yourFlightComponent');
  private readonly boekNuButton = this.page.locator('.ProgressbarNavigation__summaryButton button');

  constructor(page: Page) {
    super(page);
  }

  async waitForLoaded(): Promise<void> {
    await this.waitForPageLoad();
    
    const timeout = 10000;
    
    try {
      await Promise.race([
        this.flightsContainer.waitFor({ state: 'visible', timeout }),
        this.errorBanner.waitFor({ state: 'visible', timeout }),
      ]);
    } catch (error) {
      throw new Error('FlightsSelectionPage: neither flights nor error banner became visible within timeout');
    }
    
    const hasError = await this.isErrorBannerVisible();
    if (!hasError) {
      await this.boekNuButton.waitFor({ state: 'visible', timeout: 5000 });
      console.log('FlightsSelectionPage loaded');
    }
  }

  async clickBoekNu(): Promise<void> {
    await this.clickElement(this.boekNuButton);
  }
}
