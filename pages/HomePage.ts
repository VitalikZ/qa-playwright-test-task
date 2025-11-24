import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { DropModalComponent } from './components/DropModalComponent';

export class HomePage extends BasePage {
  private readonly cookieBanner = this.page.locator('#cmBannerDescription[role="dialog"]');
  private readonly acceptCookiesButton = this.page.locator('#cmCloseBanner');

  private readonly durationSelect = this.page.locator('[data-test-id="duration-input"]');
  private readonly searchButton = this.page.locator('[data-test-id="search-button"]');

  private readonly airportModal: DropModalComponent;
  private readonly destinationModal: DropModalComponent;
  private readonly dateModal: DropModalComponent;
  private readonly roomsGuestsModal: DropModalComponent;

  private readonly airportModalRoot = this.page.locator('.DropModal__dropModalContent.dropModalScope_airports');
  private readonly destinationModalRoot = this.page.locator('.DropModal__dropModalContent.dropModalScope_destinations');
  private readonly dateModalRoot = this.page.locator('.DropModal__dropModalContent.dropModalScope_Departuredate');
  private readonly roomsGuestsModalRoot = this.page.locator('.DropModal__dropModalContent.dropModalScope_roomandguest');
  private readonly adultsSelect = this.roomsGuestsModalRoot.locator('.AdultSelector__adultSelector select');
  private readonly childrenSelect = this.roomsGuestsModalRoot.locator('.ChildrenSelector__childrenSelector select');
  private readonly childAgeSelects = this.roomsGuestsModalRoot.locator('.ChildrenAge__childAgeSelector select');

  constructor(page: Page) {
    super(page);

    this.airportModal = new DropModalComponent(
      page,
      this.airportModalRoot,
      {
        trigger: page.locator('[data-test-id="airport-input"]'),
        saveButtonSelector: 'button.DropModal__apply',
        itemsSelector: '.SelectAirports__childrenGroup ul li label',
      }
    );

    this.destinationModal = new DropModalComponent(
      page,
      this.destinationModalRoot,
      {
        trigger: page.locator('.Package__destinations .inputs__children span:has-text("Lijst")').first(),
        saveButtonSelector: 'button.DropModal__apply',
        itemsSelector: '.DestinationsList__destinationListStyle li a',
      }
    );

    this.dateModal = new DropModalComponent(
      page,
      this.dateModalRoot,
      {
        trigger: page.locator('[data-test-id="departure-date-input"]'),
        saveButtonSelector: 'button.DropModal__apply',
        itemsSelector: 'td.SelectLegacyDate__cell.SelectLegacyDate__available',
      }
    );

    this.roomsGuestsModal = new DropModalComponent(
      page,
      this.roomsGuestsModalRoot,
      {
        trigger: page.locator('[data-test-id="rooms-and-guest-input"]'),
        saveButtonSelector: 'button.DropModal__apply',
      }
    );
  }

  async isCookieBannerVisible(): Promise<boolean> {
    return await this.isVisible(this.cookieBanner, 5000);
  }

  async acceptCookies(): Promise<void> {
    await this.waitForVisible(this.cookieBanner);
    await this.clickElement(this.acceptCookiesButton);
    await this.waitForHidden(this.cookieBanner);
  }

  async selectRandomDepartureAirport(): Promise<string> {
    await this.airportModal.open();
    const selectedAirport = await this.airportModal.selectRandomItem({
      excludeTexts: ['Alle luchthavens'],
    });
    await this.airportModal.save();
    return selectedAirport;
  }

  async selectRandomDestination(): Promise<string> {
    await this.destinationModal.open();
    const selectedDestination = await this.destinationModal.selectRandomItem();
    await this.destinationModal.save();
    return selectedDestination;
  }

  async selectRandomDepartureDate(): Promise<string> {
    await this.dateModal.open();
    const selectedDate = await this.dateModal.selectRandomItem();
    await this.dateModal.save();
    return selectedDate;
  }

  async selectDuration(nights: number): Promise<void> {
    await this.durationSelect.selectOption({ label: `${nights} nachten` });
  }

  /**
   * Sets adults/children in the rooms modal. If childAge is missing and children > 0, uses random ages.
   * Returns the age used for the first child (0 if no children).
   */
  async configureRoomsAndGuests(adults: number = 2, children: number = 1, childAge?: number): Promise<number> {
    await this.roomsGuestsModal.open();
    
    await this.adultsSelect.selectOption({ value: adults.toString() });
    await this.childrenSelect.selectOption({ value: children.toString() });
    
    let selectedAge = 0;
    
    if (children > 0) {
      await this.waitForVisible(this.childAgeSelects.first());
      
      const ageSelects = await this.getAllElements(this.childAgeSelects);
      
      for (let i = 0; i < children; i++) {
        if (i < ageSelects.length) {
          const ageSelect = ageSelects[i];
          if (!ageSelect) continue;
          
          const age = childAge !== undefined ? childAge : Math.floor(Math.random() * 18);
          
          await ageSelect.selectOption({ value: age.toString() });
          
          if (i === 0) {
            selectedAge = age;
          }
        }
      }
    }
    
    await this.roomsGuestsModal.save();
    
    return selectedAge;
  }

  async clickSearch(): Promise<void> {
    await this.clickElement(this.searchButton);
  }
}
