import type { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * Reusable component for drop modals (airports, destinations, dates, rooms/guests)
 * Handles open, item selection and save/close actions.
 */
export class DropModalComponent extends BaseComponent {
  private readonly trigger?: Locator;
  private readonly saveButton: Locator;
  private readonly items: Locator;

  constructor(
    page: Page,
    root: Locator,
    options: {
      trigger?: Locator;
      saveButtonSelector?: string;
      itemsSelector?: string;
    }
  ) {
    super(page, root);
    this.trigger = options.trigger;
    this.saveButton = root.locator(options.saveButtonSelector ?? 'button');
    this.items = root.locator(options.itemsSelector ?? 'li, label, button');
  }

  async open(): Promise<void> {
    if (!this.trigger) {
      throw new Error('DropModalComponent: trigger locator is not provided');
    }
    await this.trigger.click();
    await this.waitForVisible();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await this.waitForHidden();
  }

  /**
   * Selects a random enabled item in the modal.
   * Skip empty, disabled and excluded items.
   */
  async selectRandomItem(options?: { excludeTexts?: string[] }): Promise<string> {
    await this.waitForVisible();
    
    await this.items.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    
    const count = await this.items.count();
    const candidates: { index: number; text: string }[] = [];

    for (let i = 0; i < count; i++) {
      const item = this.items.nth(i);
      
      const text = (await item.textContent())?.trim() ?? '';
      if (!text) continue;
      
      if (options?.excludeTexts?.some((excluded) => text.includes(excluded))) {
        continue;
      }
      
      const checkbox = item.locator('input[type="checkbox"]');
      const hasCheckbox = (await checkbox.count()) > 0;
      if (hasCheckbox) {
        const isCheckboxDisabled = await checkbox.isDisabled();
        if (isCheckboxDisabled) continue;
      } else {
        const classList = await item.getAttribute('class');
        if (classList && (classList.includes('disabled') || classList.includes('Disabled'))) {
          continue;
        }
      }
      
      candidates.push({ index: i, text });
    }

    if (!candidates.length) {
      throw new Error('DropModalComponent: no selectable items found');
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const { index, text } = candidates[randomIndex]!;
    await this.items.nth(index).click();
    return text;
  }
}

