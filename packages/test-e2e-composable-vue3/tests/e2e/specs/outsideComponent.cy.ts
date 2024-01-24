describe('Query outside of component', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.visit('/')
  })

  it('supports queries outside of setup', () => {
    cy.visit('/no-setup-query')
    cy.contains('.no-setup-query', 'Hello world!')
  })

  it('supports queries outside of setup with multiple clients', () => {
    cy.visit('/no-setup-query-multi-client')
    cy.contains('.no-setup-query', 'Hello world!')
  })

  it('supports queries outside of setup but within scope', () => {
    cy.visit('/no-setup-scope-query')
    cy.contains('.no-setup-scope-query', 'Hello world!')
  })
})
