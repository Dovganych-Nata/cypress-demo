describe("Last Viewed Patients Widget", () => {

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

  beforeEach(() => {
    cy.login();
  });

  it("Widget contains viewed patients data", () => {

    cy.intercept('GET', '/fhir/rest/v1/fhir/Patient?identifier=*').as('getPatients');

    cy.wait('@getPatients', { timeout: 15000 }).then((interception) => {

      expect(interception.response.statusCode).to.eq(200);

      const responseBody = interception.response.body;

      const lastViewedPatientsCount = responseBody.total;

      cy.get('.widget-title').contains(` Last Viewed Patients (${lastViewedPatientsCount})`).should("be.visible");

      const patients = interception.response.body.entry;

      const result = patients.map(patient => {
        return {
            lastName: patient.resource.name
             .filter(nameObj => nameObj.family)
             .map(nameObj => nameObj.family)[0],
          
            firstName: patient.resource.name
              .filter(nameObj => Array.isArray(nameObj.given))
              .map(nameObj => nameObj.given[0])[0],
            
            birthDate: formatDate(patient.resource.birthDate),

            mrnValue: patient.resource.identifier
                .filter(mrn => mrn.system === "MRN")
                .map(mrn => mrn.value)[0]
        };
      });

      cy.writeFile('cypress/fixtures/patients.json', result);
      console.log(result); 

      result.forEach(patient => {
        cy.contains(`${patient.lastName}, ${patient.firstName}`)
          .closest('.demographics-section')      
          .should('contain', `${patient.lastName}`)
          .should('contain', `${patient.firstName}`)
          .should('contain', `${patient.birthDate}`)
          .should('contain', `${patient.mrnValue}`)
      });
    });
  });
});