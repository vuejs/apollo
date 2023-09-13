describe('Vue 3 + Apollo Composable', () => {
  beforeEach(() => {
    cy.task('db:seed')
  })

  it('loads channels', () => {
    cy.intercept('http://localhost:4042/graphql', (req) => {
      throw new Error('Should not be called')
    })
    cy.visit('/')
    cy.contains('#app', 'Client loaded')
    cy.get('#app').should('not.contain', 'Loading channels...')
    cy.get('.channel-link').should('have.lengthOf', 2)
    cy.contains('.channel-link', '# General')
    cy.contains('.channel-link', '# Random')
  })

  it('load one channel', () => {
    let shouldCallGraphQL = false
    cy.intercept('http://localhost:4042/graphql', (req) => {
      if (!shouldCallGraphQL) {
        throw new Error('Should not be called')
      }
    })
    cy.visit('/channel/general')
    cy.contains('#app', 'Client loaded')
    cy.contains('#app', 'Currently viewing # General')
    cy.get('.message').should('have.lengthOf', 2)
    cy.contains('.message', 'Meow?')
    cy.contains('.message', 'Meow!')
    shouldCallGraphQL = true
    cy.get('.channel-link').eq(1).click()
    cy.get('[data-test-id="global-loading"]').should('contain', 'Global loading...')
    cy.contains('#app', 'Currently viewing # Random')
    cy.get('.message').should('have.lengthOf', 1)
    cy.contains('.message', 'Hello world!')
  })
})
