import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { HotelDetails } from '@types';

export class ResultsPage extends BasePage {
  private readonly resultsContainer = this.page.locator('[data-test-id="search-results-list"]');
  private readonly hotelItems = this.page.locator('section.ResultListItemV2__resultItem');

  constructor(page: Page) {
    super(page);
  }

  async waitForLoaded(): Promise<void> {
    await this.waitForPageLoad();
    await this.resultsContainer.waitFor({ state: 'visible' });
    await this.hotelItems.first().waitFor({ state: 'visible' });
  }

  private async getHotelName(hotelItem: Locator): Promise<string> {
    const hotelNameLocator = hotelItem.locator('[data-test-id="hotel-name"] span').first();
    const name = await hotelNameLocator.textContent();
    return name ? name.trim() : '';
  }

  private async clickDiscoverButton(hotelItem: Locator): Promise<void> {
    const discoverButtons = await hotelItem.locator('[data-test-id="continue-button"]').all();
    
    for (const button of discoverButtons) {
      if (await button.isVisible()) {
        await button.click();
        return;
      }
    }
    
    throw new Error('No visible ONTDEK button found');
  }

  private async getPricePerPerson(hotelItem: Locator): Promise<string> {
    const currency = await hotelItem.locator('[data-test-id="per-person-price-currency"]').first().textContent();
    const value = await hotelItem.locator('[data-test-id="per-person-price-value"]').first().textContent();
    return `${currency}${value}`;
  }

  private async getBoardType(hotelItem: Locator): Promise<string> {
    const boardTypeLocator = hotelItem.locator('.ResultListItemV2__boardType').first();
    const boardType = await boardTypeLocator.textContent();
    return boardType ? boardType.replace(/[()]/g, '').trim() : '';
  }

  private async getRating(hotelItem: Locator): Promise<string> {
    const ratingLocator = hotelItem.locator('.ResultListItemV2__ratingNumber').first();
    const rating = await ratingLocator.textContent();
    return rating || '';
  }

  private async getHotelByIndex(index: number): Promise<Locator> {
    await this.waitForVisible(this.hotelItems.first());
    const hotels = await this.hotelItems.all();
    
    if (index >= hotels.length) {
      throw new Error(`Hotel index ${index} out of range. Only ${hotels.length} hotels available.`);
    }
    
    const hotel = hotels[index];
    if (!hotel) {
      throw new Error(`Hotel at index ${index} is undefined`);
    }
    
    return hotel;
  }

  async getHotelDetailsByIndex(index: number): Promise<HotelDetails> {
    const hotel = await this.getHotelByIndex(index);
    
    const name = await this.getHotelName(hotel);
    const price = await this.getPricePerPerson(hotel);
    const boardType = await this.getBoardType(hotel);
    const rating = await this.getRating(hotel);

    return { name, price, boardType, rating, index };
  }

  async selectHotelByIndex(index: number): Promise<string> {
    await this.waitForLoaded();
    const hotel = await this.getHotelByIndex(index);
    const hotelName = await this.getHotelName(hotel);
    
    await this.clickDiscoverButton(hotel);
    
    return hotelName;
  }
}
