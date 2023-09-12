describe('keepPreviousResult', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.visit('/keep-previous-result')
  })

  it('keepPreviousResult disabled: should clear previous data', () => {
    cy.get('.no-data').should('be.visible')
    cy.get('.channel-btn').eq(0).click()
    cy.get('.no-data').should('be.visible')
    cy.get('.the-channel').should('contain.text', '# General')
    cy.get('.no-data').should('not.exist')
    cy.get('.channel-btn').eq(1).click()
    cy.get('.no-data').should('be.visible')
    cy.get('.the-channel').should('contain.text', '# Random')
    cy.get('.no-data').should('not.exist')
  })

  it('keepPreviousResult enabled: should display previous channel', () => {
    cy.get('label').contains('keepPreviousResult').get('input[type="checkbox"]').check()
    cy.get('.no-data').should('be.visible')
    cy.get('.channel-btn').eq(0).click()
    cy.get('.no-data').should('be.visible')
    cy.get('.the-channel').should('contain.text', '# General')
    cy.get('.no-data').should('not.exist')
    cy.get('.channel-btn').eq(1).click()
    cy.get('.no-data').should('not.exist')
    cy.get('.the-channel').should('contain.text', '# General')
    cy.get('.the-channel').should('contain.text', '# Random')
  })
})
