describe('Vue 3 + Apollo Composable', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.visit('/')
  })

  it('useLazyQuery', () => {
    cy.visit('/lazy-query')
    cy.get('.list-disc').should('have.length', 0)
    cy.get('button').click()
    cy.get('.loading').should('be.visible')
    cy.get('.loading').should('not.exist')
    cy.get('.list-disc').should('have.length', 3)
    cy.get('.list-disc').should('contain', 'a')
    cy.get('.list-disc').should('contain', 'b')
    cy.get('.list-disc').should('contain', 'c')
  })

  it('useLazyQuery refetch', () => {
    cy.visit('/lazy-query')
    cy.get('button').click()
    cy.get('.list-disc').should('have.length', 3)
    cy.get('[data-test-id="refetched"]').should('contain', 'false')
    cy.get('button').click()
    cy.get('.list-disc').should('have.length', 3)
    cy.get('[data-test-id="refetched"]').should('contain', 'true')
  })

  it('useLazyQuery load result', () => {
    cy.visit('/lazy-query-load')
    cy.get('.result').should('not.exist')
    cy.get('button').click()
    cy.get('.result').should('contain', 'Loaded 3')
  })

  it('useLazyQuery load error', () => {
    cy.visit('/lazy-query-load-error')
    cy.get('.result').should('not.exist')
    cy.get('button').click()
    cy.get('.error').should('contain', 'Error')
    cy.get('.result').should('not.exist')
  })
})
