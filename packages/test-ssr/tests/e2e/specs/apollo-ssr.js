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

  it('should load page using `$apollo.queries.<query>.loading', () => {
    cy.visit('/apollo-loading')
    cy.get('.messages').should('contain', '3 messages')
    cy.get('.apollo-state').should('contain', '"messages":[{"type":"id","generated":false,"id":"Message:a","typename":"Message"},{"type":"id","generated":false,"id":"Message:b","typename":"Message"},{"type":"id","generated":false,"id":"Message:c","typename":"Message"}]')
  })

  it('should still be interactive (not destroyed on client)', () => {
    cy.visit('/hello')
    cy.get('.hello').should('contain', 'Hello World!')
    cy.get('.input').type('Anne')
    cy.get('.hello').should('contain', 'Hello Anne!')
  })

  it('should support inline template', () => {
    cy.visit('/inline-template')
    cy.get('.text').should('contain', 'inline template')
  })
})
