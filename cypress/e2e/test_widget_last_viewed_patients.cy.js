

//  This test verifies that:
//  - The "Last Viewed Patients" widget loads data successfully
//  - The widget title displays the correct number of viewed patients
//  - Patient data returned from the API matches what is displayed in the UI
//  - Each patient entry shows last name, first name, birth date, and MRN
//
//  The test ensures consistency between backend data and UI presentation.


describe("Last Viewed Patients Widget", () => {

  // Helper function to format birthDate into DD-MMM-YYYY (e.g. 02-Feb-1990)
  const formatDate = (dateString) => {      
    const date = new Date(dateString);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };

  // Login before each test to ensure authenticated state
  beforeEach(() => {
    cy.login();
  });

  it("Widget contains viewed patients data", () => {

    // Intercept the API request that loads last viewed patients
    cy.intercept('GET', '/fhir/rest/v1/fhir/Patient?identifier=*').as('getPatients');

    // Wait for the API response before performing assertions
    cy.wait('@getPatients').then((interception) => {

      // Validate successful API response
      expect(interception.response.statusCode).to.eq(200);

      const responseBody = interception.response.body;

      // Get total number of last viewed patients from response
      const lastViewedPatientsCount = responseBody.total;

      // Verify widget title shows correct patients count
      cy.get('.widget-title')
        .contains(` Last Viewed Patients (${lastViewedPatientsCount})`)
        .should("be.visible");

      // Extract patient entries from API response
      const patients = responseBody.entry;

      // Map API response to a simplified patient data structure
      const result = patients.map(patient => {
        return {
          // Extract patient last name
          lastName: patient.resource.name
            .filter(nameObj => nameObj.family)
            .map(nameObj => nameObj.family)[0],

          // Extract patient first name
          firstName: patient.resource.name
            .filter(nameObj => Array.isArray(nameObj.given))
            .map(nameObj => nameObj.given[0])[0],

          // Extract and format birth date for UI comparison
          birthDate: formatDate(patient.resource.birthDate),

          // Extract MRN identifier value
          mrnValue: patient.resource.identifier
            .filter(mrn => mrn.system === "MRN")
            .map(mrn => mrn.value)[0]
        };
      });

      // Save extracted data for reuse
      cy.writeFile('cypress/fixtures/patients.json', result);

      // Validate each patient’s data is displayed correctly in the widget
      result.forEach(patient => {
        cy.contains(`${patient.lastName}, ${patient.firstName}`)
          .closest('.demographics-section')
          .should('contain', patient.lastName)
          .should('contain', patient.firstName)
          .should('contain', patient.birthDate)
          .should('contain', patient.mrnValue);
      });
    });
  });
});