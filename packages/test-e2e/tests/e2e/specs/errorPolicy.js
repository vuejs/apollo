describe('errorPolicy', () => {
  it('supports `errorPolicy` option', () => {
    cy.visit('/partial-error')

    // All
    cy.get('.all .result').should('contain', '{"good":"good","bad":null}')
    cy.get('.all .error').should('contain', 'Error: GraphQL error: An error')

    // None
    cy.get('.none .result').should('not.contain', '{"good":"good","bad":null}')
    cy.get('.none .error').should('contain', 'Error: GraphQL error: An error')

    // Ignore
    cy.get('.ignore .result').should('contain', '{"good":"good","bad":null}')
    cy.get('.ignore .error').should('not.exist')
  })
})
