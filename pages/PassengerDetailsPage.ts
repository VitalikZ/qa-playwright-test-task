import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { PassengerValidationResult, FieldValidationError } from '@types';


export class PassengerDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  
  // Main form / navigation
  private readonly passengerForm = this.page.locator('#pax-form');
  private readonly verderNaarBetalenButton = this.page.locator('#PassengerV2ContinueButton__component button:has-text("Verder naar betalen")');

  // Passenger fields (with parameterized getters)
  private getPassengerFieldLocator(index: number, fieldName: string): Locator {
    return this.page.locator(`[name="paxInfoFormBean[${index}].${fieldName}"]`);
  }

  private getFirstNameInput(passengerIndex: number = 0): Locator {
    return this.getPassengerFieldLocator(passengerIndex, 'firstName');
  }

  // Contact & address
  private readonly address1Input = this.page.locator('[name="address1"]');
  private readonly mobileNumInput = this.page.locator('[name="mobileNum"]');
  private readonly emailInput = this.page.locator('[name="email"]');
  private readonly promoCodeInput = this.page.locator('input[placeholder="bijv. PROMO100"]');

  // Date of birth
  private readonly dobContainer = this.page.locator('.DateOfBirth__inputDOBWrapper').first();
  private readonly dobDayInput = this.dobContainer.locator('input[aria-label="day"]');
  private readonly dobMonthInput = this.dobContainer.locator('input[aria-label="month"]');
  private readonly dobYearInput = this.dobContainer.locator('input[aria-label="year"]');
  private readonly dobErrorMessage = this.dobContainer.locator('.inputs__error.inputs__errorMessageWithIcon');

  // Validation alert
  private readonly validationAlertModal = this.page.locator('.alerts__alert');
  private readonly validationAlertText = this.page.locator('.alerts__alertText');

  // Private helper methods
  
  private getErrorMessageContainer(input: Locator): Locator {
    const wrapper = this.page
      .locator('.inputs__outer')
      .filter({ has: input });

    return wrapper.locator('.inputs__errorMessage');
  }

  private async assertInlineError(
    input: Locator,
    invalidValue: string,
    errorPattern: RegExp,
    fieldName: string
  ): Promise<void> {
    await input.fill(invalidValue);
    await input.blur();

    const errorMessageContainer = this.getErrorMessageContainer(input);
    
    await errorMessageContainer.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    
    const errorText = await errorMessageContainer.locator('span').last().textContent();

    const inputClasses = await input.getAttribute('class') || '';
    const errorContainerClasses = await errorMessageContainer.getAttribute('class') || '';

    if (!inputClasses.includes('inputs__error')) {
      throw new Error(`${fieldName}: input should have "inputs__error" class for invalid value "${invalidValue}"`);
    }

    if (!errorContainerClasses.includes('inputs__show')) {
      throw new Error(`${fieldName}: error message should be visible (inputs__show) for invalid value "${invalidValue}"`);
    }

    const trimmedError = errorText?.trim() || '';
    if (!errorPattern.test(trimmedError)) {
      throw new Error(
        `${fieldName}: error message "${trimmedError}" does not match pattern ${errorPattern} for invalid value "${invalidValue}"`
      );
    }
  }

  private async assertInlineValid(input: Locator, validValue: string, fieldName: string): Promise<void> {
    await input.fill(validValue);
    await input.blur();

    const errorMessageContainer = this.getErrorMessageContainer(input);

    await errorMessageContainer.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

    const inputClasses = await input.getAttribute('class') || '';
    const errorContainerClasses = await errorMessageContainer.getAttribute('class') || '';

    if (inputClasses.includes('inputs__error')) {
      throw new Error(`${fieldName}: input should NOT have "inputs__error" class for valid value "${validValue}"`);
    }

    if (errorContainerClasses.includes('inputs__show')) {
      const errorText = await errorMessageContainer.locator('span').textContent();
      throw new Error(
        `${fieldName}: error message should be hidden for valid value "${validValue}", but shows: "${errorText?.trim()}"`
      );
    }

    await input.fill('');
    await input.blur();
  }

  private async isValidationAlertVisible(): Promise<boolean> {
    return await this.isVisible(this.validationAlertModal);
  }

  private async getValidationAlertMessage(): Promise<string> {
    if (await this.isValidationAlertVisible()) {
      return await this.getTextContent(this.validationAlertText);
    }
    return '';
  }

  private async clickVerderNaarBetalenToTriggerValidation(): Promise<void> {
    await this.clickElement(this.verderNaarBetalenButton);
    await this.validationAlertModal.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  }

  // Public methods
  
  async waitForLoaded(): Promise<void> {
    await this.waitForPageLoad();
    await this.passengerForm.waitFor({ state: 'visible' });
    await this.verderNaarBetalenButton.waitFor({ state: 'visible' });
  }

  async validateFirstNameInline(): Promise<void> {
    const firstNameInput = this.getFirstNameInput(0);
    const errorPattern = /voornaam|paspoort|minimaal|minimum|gebruik|letters|cijfers|speciale/i;

    await this.assertInlineError(firstNameInput, '1234', errorPattern, 'firstName_0');
    await this.assertInlineError(firstNameInput, ';%:?*', errorPattern, 'firstName_0');
    await this.assertInlineError(firstNameInput, '   ', errorPattern, 'firstName_0');
    await this.assertInlineValid(firstNameInput, 'Vitalii', 'firstName_0');
  }

  async validateEmailInline(): Promise<void> {
    const errorPattern = /e-?mail|e-mailadres|geldig|ongeldig/i;

    await this.assertInlineError(this.emailInput, 'not-an-email', errorPattern, 'email');
    await this.assertInlineError(this.emailInput, 'qa@@example', errorPattern, 'email');
    await this.assertInlineError(this.emailInput, '   ', errorPattern, 'email');
    await this.assertInlineValid(this.emailInput, 'qa.test@example.com', 'email');
  }

  async validateMobileInline(): Promise<void> {
    const errorPattern = /telefoonnummer|phone|mobiel/i;

    await this.assertInlineError(this.mobileNumInput, '123', errorPattern, 'mobileNum');
    await this.assertInlineError(this.mobileNumInput, 'abc', errorPattern, 'mobileNum');
    await this.assertInlineError(this.mobileNumInput, '++++++', errorPattern, 'mobileNum');
    await this.assertInlineValid(this.mobileNumInput, '0612345678', 'mobileNum');
  }

  async validatePromoCodeInline(): Promise<void> {
    const errorPattern = /kortingscode|niet geldig/i;

    await this.assertInlineError(this.promoCodeInput, ';%:?*()', errorPattern, 'promoCode');

    await this.promoCodeInput.fill('1234567');
    await this.promoCodeInput.blur();

    const errorMessageContainer = this.getErrorMessageContainer(this.promoCodeInput);

    await errorMessageContainer.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

    const inputClasses = await this.promoCodeInput.getAttribute('class') || '';
    const errorContainerClasses = await errorMessageContainer.getAttribute('class') || '';

    if (inputClasses.includes('inputs__error')) {
      throw new Error('promoCode: input should NOT have "inputs__error" class for valid value "1234567"');
    }

    if (errorContainerClasses.includes('inputs__show')) {
      const errorText = await errorMessageContainer.locator('span').last().textContent();
      throw new Error(
        `promoCode: error message should be hidden for valid value "1234567", but shows: "${errorText?.trim()}"`
      );
    }
  }

  async validateDobInline(): Promise<void> {
    const dobErrorPattern = /geboortedatum|DD\/MM\/JJJJ/i;

    await this.dobDayInput.fill('32');
    await this.dobMonthInput.fill('13');
    await this.dobYearInput.fill('2000');
    await this.dobYearInput.blur();

    await this.dobErrorMessage.waitFor({ state: 'visible', timeout: 3000 });
    const errorText1 = await this.dobErrorMessage.textContent();
    if (!dobErrorPattern.test(errorText1?.trim() || '')) {
      throw new Error(`DOB error message "${errorText1?.trim()}" does not match pattern ${dobErrorPattern}`);
    }

    await this.dobDayInput.fill('01');
    await this.dobMonthInput.fill('01');
    await this.dobYearInput.fill('2100');
    await this.dobYearInput.blur();

    await this.dobErrorMessage.waitFor({ state: 'visible', timeout: 3000 });
    const errorText2 = await this.dobErrorMessage.textContent();
    if (!dobErrorPattern.test(errorText2?.trim() || '')) {
      throw new Error(`DOB error message "${errorText2?.trim()}" does not match pattern ${dobErrorPattern}`);
    }

    await this.dobDayInput.fill('01');
    await this.dobMonthInput.fill('02');
    await this.dobYearInput.fill('1990');
    await this.dobYearInput.blur();

    await this.dobErrorMessage.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

    const isErrorVisible = await this.dobErrorMessage.isVisible().catch(() => false);
    if (isErrorVisible) {
      const errorText = await this.dobErrorMessage.textContent();
      throw new Error(`DOB error should be hidden for valid date, but shows: "${errorText?.trim()}"`);
    }

    await this.dobDayInput.fill('');
    await this.dobMonthInput.fill('');
    await this.dobYearInput.fill('');
    await this.dobYearInput.blur();
  }

  async validateAddressInline(): Promise<void> {
    const streetErrorPattern = /straatnaam|street/i;

    await this.address1Input.fill('   ');
    await this.address1Input.blur();

    const errorMessageContainer = this.getErrorMessageContainer(this.address1Input);
    const errorMessageTextLocator = errorMessageContainer.locator('span').last();

    const inputClassesInvalid = await this.address1Input.getAttribute('class');
    if (!inputClassesInvalid || !inputClassesInvalid.includes('inputs__error')) {
      throw new Error('Street input should have "inputs__error" class for invalid value "   "');
    }

    const errorContainerClassesInvalid = await errorMessageContainer.getAttribute('class');
    if (!errorContainerClassesInvalid || !errorContainerClassesInvalid.includes('inputs__show')) {
      throw new Error('Error message container should have "inputs__show" class for invalid street');
    }

    await errorMessageTextLocator.waitFor({ state: 'visible', timeout: 3000 });
    const errorText = await errorMessageTextLocator.textContent();
    if (!streetErrorPattern.test(errorText?.trim() || '')) {
      throw new Error(`Street error message "${errorText?.trim()}" does not match pattern ${streetErrorPattern}`);
    }

    await this.address1Input.fill('Main Street');
    await this.address1Input.blur();

    await errorMessageContainer.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

    const inputClassesValid = await this.address1Input.getAttribute('class');
    if (inputClassesValid && inputClassesValid.includes('inputs__error')) {
      throw new Error('Street input should NOT have "inputs__error" class for valid value "Main Street"');
    }

    const errorContainerClassesValid = await errorMessageContainer.getAttribute('class');
    if (errorContainerClassesValid && errorContainerClassesValid.includes('inputs__show')) {
      const errorText = await errorMessageTextLocator.textContent();
      throw new Error(`Error message should be hidden for valid street, but shows: "${errorText?.trim()}"`);
    }

    await this.address1Input.fill('');
    await this.address1Input.blur();
  }

  /** Collect visible field errors */
  async getValidationErrors(): Promise<FieldValidationError[]> {
    const errors: FieldValidationError[] = [];
    
    const errorLocators = this.page.locator('.inputs__error, .inputs__errorText, span[class*="error"]');
    const count = await errorLocators.count();
    
    const fieldMapping: { [key: string]: RegExp[] } = {
      'firstName_0': [/voornaam.*paspoort/i, /first.*name/i],
      'lastName_0': [/achternaam.*paspoort/i, /last.*name/i, /achternaam/i],
      'gender_0': [/geslacht/i, /gender/i],
      'dob_0': [/geboortedatum/i, /date.*birth/i, /DD\/MM\/JJJJ/i],
      'nationality': [/nationaliteit/i, /nationality/i],
      'country': [/land/i, /country/i],
      'address1': [/straatnaam/i, /street/i],
      'houseNum': [/huisnummer/i, /house.*number/i],
      'postCode': [/postcode/i, /postal.*code/i],
      'town': [/woonplaats/i, /town/i, /city/i],
      'phonecode': [/landcode/i, /phone.*code/i],
      'mobileNum': [/telefoonnummer/i, /phone/i, /mobile/i],
      'email': [/e-mail/i, /email/i],
      'firstName_1': [/voornaam.*paspoort/i, /first.*name/i],
      'lastName_1': [/achternaam.*paspoort/i, /achternaam/i],
      'gender_1': [/geslacht/i, /gender/i],
      'dob_1': [/geboortedatum/i, /DD\/MM\/JJJJ/i],
    };
    
    for (let i = 0; i < count; i++) {
      const errorElement = errorLocators.nth(i);
      const isVisible = await errorElement.isVisible().catch(() => false);
      
      if (!isVisible) continue;
      
      const errorText = await errorElement.textContent();
      if (!errorText || errorText.trim().length === 0) continue;
      
      const trimmedError = errorText.trim();
      
      let matchedFieldId = 'unknown';
      for (const [fieldId, patterns] of Object.entries(fieldMapping)) {
        if (patterns.some(pattern => pattern.test(trimmedError))) {
          matchedFieldId = fieldId;
          break;
        }
      }
      
      errors.push({
        fieldId: matchedFieldId,
        message: trimmedError,
      });
    }
    
    return errors;
  }

  /** Trigger form validation and return results */
  async validateFormFields(): Promise<PassengerValidationResult> {
    await this.clickVerderNaarBetalenToTriggerValidation();

    const alertVisible = await this.isValidationAlertVisible();
    const alertMessage = alertVisible ? await this.getValidationAlertMessage() : '';
    const fieldErrors = await this.getValidationErrors();

    return {
      alertVisible,
      alertMessage,
      fieldErrors,
    };
  }
}
