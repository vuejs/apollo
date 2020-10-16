describe('Vue 3 + Apollo Composable', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('loads channels', () => {
    cy.contains('#app', 'Loading channels...')
    cy.get('.channel-link').should('have.lengthOf', 2)
    cy.contains('.channel-link', '# General')
    cy.contains('.channel-link', '# Random')
  })

  it('load one channel', () => {
    cy.get('.channel-link').eq(0).click()
    cy.contains('#app', 'Currently viewing # General')
  })
})
