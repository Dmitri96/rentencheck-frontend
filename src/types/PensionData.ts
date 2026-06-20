export interface PensionData {
  // General Settings
  currentAge: number;
  inflationRate: number;
  retirementAge: number;
  lifeExpectancy: number;

  // Desired Pension
  desiredPensionToday: number;
  desiredPensionRetirement: number;
  desiredPensionLifeExpectancy: number;

  // Legal Pension
  legalPensionToday: number;
  legalPensionRetirement: number;

  // Private Pension
  privatePensionToday: number;
  privatePensionRetirement: number;

  // BAV/Riester
  bavRiesterToday: number;
  bavRiesterRetirement: number;
}
