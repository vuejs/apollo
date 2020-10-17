/// <reference types="Cypress" />

describe('Vue 3 + Apollo Composable', () => {
  beforeEach(() => {
    cy.task('db:reset')
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

  it('sends a message', () => {
    cy.get('.channel-link').eq(0).click()
    cy.get('input').type('Hello{enter}')
    cy.get('.message').should('have.lengthOf', 1)
    cy.contains('.message', 'Hello')
    cy.get('input').should('have', 'value', '')
    cy.get('.channel-link').eq(1).click()
    cy.get('.message').should('have.lengthOf', 0)
    cy.reload()
    cy.get('.channel-link').eq(0).click()
    cy.get('.message').should('have.lengthOf', 1)
    cy.contains('.message', 'Hello')
  })

  it('sends multiple messages', () => {
    cy.get('.channel-link').eq(1).click()
    cy.get('input').type('Message 1{enter}')
      .type('Message 2{enter}')
      .type('Message 3{enter}')
    cy.get('.message').should('have.lengthOf', 3)
    cy.contains('.message', 'Message 1')
    cy.contains('.message', 'Message 2')
    cy.contains('.message', 'Message 3')
    cy.get('input').should('have', 'value', '')
    cy.get('.channel-link').eq(0).click()
    cy.get('.message').should('have.lengthOf', 0)
    cy.reload()
    cy.get('.channel-link').eq(1).click()
    cy.get('.message').should('have.lengthOf', 3)
    cy.contains('.message', 'Message 1')
    cy.contains('.message', 'Message 2')
    cy.contains('.message', 'Message 3')
  })

  it('supports queries outside of setup', () => {
    cy.visit('/no-setup-query')
    cy.contains('.no-setup-query', 'Hello world!')
  })
})
