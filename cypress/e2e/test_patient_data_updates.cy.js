

//  This test verifies that:
//  - A patient can be opened from the "Last Viewed Patients" widget
//  - All editable patient fields (inputs and comboboxes) are enabled
//  - Combobox fields can be interacted with and display their options
//  - The MRN field is protected and cannot be edited (negative test)

describe("Patient personal data", () => {

  // Login before each test to ensure authenticated state
  beforeEach(() => {
    cy.login();
  });

  it("Allows updating all patient data except MRN", () => {

    // Open the first patient from the "Last Viewed Patients" widget
    cy.contains('Last Viewed Patients')
      .parent()
      .find('.widget-content')
      .children()
      .first()
      .click();

    // Navigate to the patient edit screen
    cy.contains('Edit patient').click();

    // Positive check:
    // Verify that all combobox fields are interactive and can be opened
    cy.get('div[role="combobox"]').each(($combobox) => {
      cy.wrap($combobox)
        .scrollIntoView()
        .click({ force: true });
      cy.get('[aria-label="Options list"]')
        .should('be.visible');
    });

    // Positive check:
    // Verify that all input fields except MRN are enabled for editing
    cy.get('input:not(#id-MRN)').each(($input) => {
      cy.wrap($input).should('be.enabled');
    });

    // Negative check:
    // Verify that MRN field is disabled and cannot be updated
    cy.get('#id-MRN').should('be.disabled');
  });
});
