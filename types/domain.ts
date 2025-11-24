export interface BookingScenario {
  name: string;
  description: string;
  adults: number;
  children: number;
  duration: number;
  childAges?: number[];
  tags?: string[];
}

export interface SearchCriteria {
  departureAirport: string;
  destination: string;
  departureDate: string;
  duration: number;
  adults: number;
  children: number;
  childAge: number;
}

export interface HotelDetails {
  name: string;
  price: string;
  boardType: string;
  rating: string;
  index: number;
}

export interface FieldValidationError {
  fieldId: string;
  message: string;
}

export interface PassengerValidationResult {
  alertVisible: boolean;
  alertMessage: string;
  fieldErrors: FieldValidationError[];
}


