import { test, expect } from '../fixtures/pomFixtures';
import { testConfig } from '@config/test.config';
import type { SearchCriteria, HotelDetails } from '@types';

test.describe('TUI.nl Booking Journey', () => {
  test.describe.configure({ retries: testConfig.retry.testRetries });
  
  test('booking journey: search, hotel, flights and passenger validation', async (
    {
      page,
      homePage,
      resultsPage,
      hotelDetailsPage,
      flightsSelectionPage,
      passengerDetailsPage,
      scenario,
    },
  ) => {
    await test.step('Navigate to homepage and accept cookies', async () => {
      await homePage.navigate('/h/nl');
      expect(homePage.getCurrentUrl()).toContain('tui.nl');
      
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (await homePage.isCookieBannerVisible()) {
        await homePage.acceptCookies();
      }
    });

    let departureAirport: string;
    let destination: string;
    let departureDate: string;
    let childAge: number;
    let searchCriteria: SearchCriteria;
    
    await test.step('Fill search form and submit', async () => {
      departureAirport = await homePage.selectRandomDepartureAirport();
      destination = await homePage.selectRandomDestination();
      departureDate = await homePage.selectRandomDepartureDate();
      await homePage.selectDuration(scenario.duration);
      childAge = await homePage.configureRoomsAndGuests(scenario.adults, scenario.children);

      searchCriteria = {
        departureAirport,
        destination,
        departureDate,
        duration: scenario.duration,
        adults: scenario.adults,
        children: scenario.children,
        childAge,
      };

      console.log('Search test data:', searchCriteria);

      await homePage.clickSearch();
      await resultsPage.waitForLoaded();
    });

    const resultsPageUrl = homePage.getCurrentUrl();

    let hotelIndex = 0;
    let selectedHotelSuccess = false;
    let selectedHotelDetails: HotelDetails | undefined;
    const maxHotelRetries = testConfig.retry.maxHotelRetries;

    // Hotel retry loop: sometimes hotels are unavailable after selection so we try next hotel
    /* eslint-disable playwright/no-conditional-in-test */
    while (!selectedHotelSuccess && hotelIndex < maxHotelRetries) {
      try {
        await test.step(`Select hotel #${hotelIndex + 1}`, async () => {
          if (hotelIndex > 0) {
            await page.goto(resultsPageUrl);
            await resultsPage.waitForLoaded();
          }
          
          selectedHotelDetails = await resultsPage.getHotelDetailsByIndex(hotelIndex);
          console.log('Selected hotel details:', selectedHotelDetails);
          
          await resultsPage.selectHotelByIndex(hotelIndex);
        });

        await hotelDetailsPage.waitForLoaded();

        const hasErrorAfterSelection = await hotelDetailsPage.isErrorBannerVisible();
        if (hasErrorAfterSelection) {
          hotelIndex++;
          continue;
        }

        await hotelDetailsPage.clickVerder();

        let flightsLoaded = true;
        try {
          await flightsSelectionPage.waitForLoaded();
        } catch {
          flightsLoaded = false;
        }

        const hasErrorOnFlights = await flightsSelectionPage.isErrorBannerVisible();
        if (hasErrorOnFlights || !flightsLoaded) {
          hotelIndex++;
          continue;
        }

        await flightsSelectionPage.clickBoekNu();
        await passengerDetailsPage.waitForLoaded();

        const hasErrorOnPassenger = await passengerDetailsPage.isErrorBannerVisible();
        if (hasErrorOnPassenger) {
          throw new Error('Booking unavailable at passenger details - will retry entire test');
        }

        await test.step('Inline validation for selected passenger fields', async () => {
          await passengerDetailsPage.validateEmailInline();
          await passengerDetailsPage.validateFirstNameInline();
          await passengerDetailsPage.validateMobileInline();
          await passengerDetailsPage.validatePromoCodeInline();
          await passengerDetailsPage.validateDobInline();
          await passengerDetailsPage.validateAddressInline();
        });

        await test.step('Validate passenger details form with field-specific assertions', async () => {
          const validationResult = await passengerDetailsPage.validateFormFields();
          
          expect(
            validationResult.alertVisible,
            'Validation alert should be visible when submitting empty passenger form'
          ).toBe(true);
          
          const errorMap = new Map<string, string>();
          validationResult.fieldErrors.forEach(err => {
            errorMap.set(err.fieldId, err.message);
          });
          
          const expectedRequiredErrors: Record<string, RegExp> = {
            'firstName_0': /voornaam|first.*name/i,
            'lastName_0': /achternaam|last.*name/i,
            'dob_0': /geboortedatum|date.*birth|DD\/MM\/JJJJ/i,
            'email': /e-mail|email/i,
            'address1': /straatnaam|street/i,
            'houseNum': /huisnummer|house.*number/i,
            'postCode': /postcode|postal/i,
            'town': /woonplaats|town|city/i,
            'mobileNum': /telefoonnummer|phone|mobile/i,
          };
          
          for (const [fieldId, expectedPattern] of Object.entries(expectedRequiredErrors)) {
            const errorMessage = errorMap.get(fieldId);
            expect(errorMessage, `Field "${fieldId}" should have a validation error`).toBeTruthy();
            expect(
              errorMessage,
              `Error message for "${fieldId}" should match expected pattern`
            ).toMatch(expectedPattern);
          }
          
          selectedHotelSuccess = true;
        });
        
        if (selectedHotelSuccess) {
          break;
        }
        
      } catch (error: any) {
        hotelIndex++;
        
        if (hotelIndex >= maxHotelRetries) {
          throw new Error(`Failed to complete booking after ${maxHotelRetries} hotel attempts`);
        }
        
        continue;
      }
    }

    if (!selectedHotelSuccess) {
      throw new Error(`Failed to complete booking after trying ${maxHotelRetries} hotels. Test will retry with new search criteria.`);
    }
    /* eslint-enable playwright/no-conditional-in-test */
    
    console.log('Booking completed.');
  });
});
