describe('Manual Smart Query', () => {
  it('should support loading key', () => {
    cy.visit('/manual-add-smart-query')
    cy.contains('Loading...')
    cy.contains('42')
    cy.contains('[{"isLoading":true,"countModifier":1},{"isLoading":false,"countModifier":-1}]')
  })
})
