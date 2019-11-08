describe('SSR Apollo', () => {
  it('should prefetch smart query', () => {
    cy.visit('/apollo')
    cy.get('.apollo-example').find('.message').should('have.length', 3)
    // ROOT_QUERY
    cy.get('.apollo-state').should('contain', '"messages":[{"type":"id","generated":false,"id":"Message:a","typename":"Message"},{"type":"id","generated":false,"id":"Message:b","typename":"Message"},{"type":"id","generated":false,"id":"Message:c","typename":"Message"}]')
    // Messages
    cy.get('.apollo-state').should('contain', '"Message:a":{"id":"a","text":"Message 1","__typename":"Message"}')
    cy.get('.apollo-state').should('contain', '"Message:b":{"id":"b","text":"Message 2","__typename":"Message"}')
    cy.get('.apollo-state').should('contain', '"Message:c":{"id":"c","text":"Message 3","__typename":"Message"}')
  })
})
