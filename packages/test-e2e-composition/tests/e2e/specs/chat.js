// https://docs.cypress.io/api/introduction/api.html

function login () {
  cy.visit('/')
  cy.get('input[name="email"]').clear().type('a@b.c')
  cy.get('input[name="password"]').clear().type('abc')
  cy.get('[data-id="login"]').click()
  cy.get('.user-current .nickname').contains('Naomi')
}

describe('test', () => {
  it('creates an account', () => {
    cy.visit('/')
    cy.get('[data-id="create-account"]').click()
    cy.get('input[name="email"]').type('a@b.c')
    cy.get('input[name="password"]').type('abc')
    cy.get('input[name="nickname"]').type('Naomi')
    cy.get('[data-id="submit-new-account"]').click()
      .should('be.disabled')
    cy.get('[data-id="submit-new-account"]').should('not.to.exist')
  })

  it('fails to login', () => {
    cy.visit('/')
    cy.get('input[name="email"]').clear().type('a@b.c')
    cy.get('input[name="password"]').clear().type('xyz')
    cy.get('[data-id="login"]').click()
    cy.contains('User not found')
  })

  it('succeeds to login', () => {
    login()
  })

  it('loads a channel', () => {
    login()
    cy.contains('#general').click()
    cy.contains('Loading...')
    cy.contains('Welcome to the chat!')
  })

  it('sends a message', () => {
    login()
    cy.contains('#general').click()
    cy.get('.form-input').type('Hello!{enter}')
      .should('be.disabled')
    cy.get('.channel-view .body .message-item')
      .should('have.length', 2)
    cy.get('.message-item').contains('Hello!')
    cy.get('.form-input')
      .should('not.be.disabled')
  })

  it('loads another channel', () => {
    login()
    cy.contains('#random').click()
    cy.contains('Loading...')
    cy.get('.channel-view .body .message-item')
      .should('have.length', 0)
  })

  it('receives a message', () => {
    login()
    cy.contains('#general').click()
    cy.contains('Loading...')
    cy.get('.channel-view .body .message-item')
      .should('have.length', 2)
    cy.get('.mock-send-message a').click()
    cy.get('.channel-view .body .message-item')
      .should('have.length', 3)
    cy.get('.message-item').contains('How are you doing? 1')
  })

  it('receives a message from another channel', () => {
    login()
    cy.contains('#random').click()
    cy.contains('Loading...')
    cy.get('.channel-view .body .message-item')
      .should('have.length', 0)
    cy.get('.mock-send-message a').click()
    cy.get('.channel-view .body .message-item')
      .should('have.length', 0)
    cy.contains('#general').click()
    cy.get('.loading').should('not.to.exist')
    cy.get('.channel-view .body .message-item')
      .should('have.length', 4)
    cy.get('.message-item').contains('How are you doing? 2')
  })

  it('logs out', () => {
    login()
    cy.contains('#general').click()
    cy.contains('Hello!')
    cy.get('[data-id="logout"]').click()
    cy.contains('#general').should('not.to.exist')
  })

  it('redirects to login', () => {
    cy.visit('/chan/general')
    cy.contains('#general').should('not.to.exist')
    cy.url().should('not.include', '/chan/general')
      .should('include', '/login')
    cy.get('[data-id="create-account"]')
  })
})
