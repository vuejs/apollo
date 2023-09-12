describe('nullableQuery', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.visit('/null-query')
  })

  it('should enable useQuery only if query is non-null', () => {
    cy.get('button').should('exist')
    cy.wait(100)
    cy.get('[data-test-id="data"]').should('not.exist')
    cy.get('.loading').should('not.exist')
    cy.get('button').click()
    cy.get('[data-test-id="data"]').should('contain', 'Loaded channel: General')
  })
})
