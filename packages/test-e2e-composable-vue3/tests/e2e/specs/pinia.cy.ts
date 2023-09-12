describe('Pinia', () => {
  beforeEach(() => {
    cy.task('db:reset')
  })

  it('with current instance', () => {
    cy.visit('/pinia')
    cy.get('.channel-link').should('have.lengthOf', 2)
    cy.contains('.channel-link', '# General')
    cy.contains('.channel-link', '# Random')
  })

  it('with effect scope only', () => {
    cy.visit('/pinia2')
    cy.get('.channel-link').should('have.lengthOf', 2)
    cy.contains('.channel-link', '# General')
    cy.contains('.channel-link', '# Random')
  })
})
