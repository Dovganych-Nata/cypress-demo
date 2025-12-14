describe("Authenticated tests", () => {
  beforeEach(() => {
    cy.login();
  });

  it("does something after login and verifies patient data", () => {

    cy.intercept('GET', '/fhir/rest/v1/fhir/Patient?identifier=*').as('getPatients');

    cy.wait('@getPatients', { timeout: 15000 }).then((interception) => {
      // --- 🚨 Check 1: Verify the status code first 🚨 ---
      expect(interception.response.statusCode).to.eq(200, 'Expected status code 200 for successful patient fetch.');

      const responseBody = interception.response.body;

      const lastViewedPatientsCount = responseBody.total;
      cy.get('.widget-title').contains(` Last Viewed Patients (${lastViewedPatientsCount})`).should("be.visible");
    });



  });
});