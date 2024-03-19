describe('Subscription', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.visit('/')
  })

  it('receive messages in real time', () => {
    cy.visit('/subscriptions')
    cy.get('input').type('Meow{enter}')
    cy.get('.message').should('have.length', 3)
    cy.get('.message').should('contain', 'Meow')
    cy.get('input').type('Waf{enter}')
    cy.get('.message').should('have.length', 6)
    cy.get('.message').should('contain', 'Waf')
  })
})
