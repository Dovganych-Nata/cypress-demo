describe("Authenticated tests", () => {
  beforeEach(() => {
    cy.login();
  });

  it("does something after login", () => {
    cy.contains("My Dashboard").should("be.visible");
  });
});