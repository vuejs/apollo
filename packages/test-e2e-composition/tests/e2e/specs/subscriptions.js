describe('useSubscription', () => {
  it('supports dynamic variables', () => {
    cy.visit('/subscriptions')

    cy.get('.btn-update').click()
    cy.get('.sub-history').should('contain', '[0]')
    cy.get('.btn-update').click()
    cy.get('.sub-history').should('contain', '[0,1]')
    cy.get('.input-cat').click()
    cy.get('.btn-update').click()
    cy.get('.sub-history').should('contain', '[0,1]')
    cy.get('.sub-cat').click()
    cy.get('.btn-update').click()
    cy.get('.sub-history').should('contain', '[0,1,3]')
  })
})
