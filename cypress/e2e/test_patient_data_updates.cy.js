describe("", () => {

  beforeEach(() => {
    cy.login();
  });

  it("Allows updating all patient data except MRN", () => {

    cy.contains('Last Viewed Patients')
      .parent()
      .find('.widget-content')
      .children()
      .first()
      .click()

    cy.contains('Edit patient').click()

    cy.get('div[role="combobox"]').each(($combobox) => {
      cy.wrap($combobox)
        .scrollIntoView()
        .click({ force: true });
      cy.get('[aria-label="Options list"]').should('be.visible');
    });

    cy.get('input:not(#id-MRN)')
      .each(($input) => {
        cy.wrap($input).should('be.enabled');
    });

    cy.get('#id-MRN').should('be.disabled');
  });
});