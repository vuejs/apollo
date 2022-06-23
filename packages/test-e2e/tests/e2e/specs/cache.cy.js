describe('cache', () => {
  it('add an item to the list', () => {
    cy.visit('/update-cache')

    cy.get('.item-list ul li').should('have.length', 1)
    cy.get('.update-count').should('contain', 'Changes: 1')
    cy.get('button.add').click()
    cy.get('.item-list ul li').should('have.length', 2)
    cy.get('.item-list ul li').should('contain', 'Item 2')
    cy.get('.update-count').should('contain', 'Changes: 2')
  })
})
