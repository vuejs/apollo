describe('Polling', () => {
  beforeEach(() => {
    cy.task('db:reset')
    cy.visit('/polling')
  })

  it('should start polling with initial pollInterval', () => {
    // Wait for initial load
    cy.get('[data-test-id="loading"]').should('exist')
    cy.get('[data-test-id="channels"]').should('exist')
    cy.get('[data-test-id="poll-count"]').should('contain', '1')

    // Wait for at least one poll (500ms interval)
    cy.wait(600)
    cy.get('[data-test-id="poll-count"]').should((el) => {
      const count = parseInt(el.text())
      expect(count).to.be.at.least(2)
    })
  })

  it('should stop polling when stopPolling is called', () => {
    cy.get('[data-test-id="channels"]').should('exist')
    cy.get('[data-test-id="poll-count"]').then(($el) => {
      const initialCount = parseInt($el.text())

      // Stop polling
      cy.get('[data-test-id="stop-polling-btn"]').click()

      // Wait a bit to ensure polling stopped
      cy.wait(1000)

      // Poll count should not have increased
      cy.get('[data-test-id="poll-count"]').should('contain', initialCount.toString())
    })
  })

  it('should start polling when startPolling is called', () => {
    cy.get('[data-test-id="channels"]').should('exist')

    // Stop polling first
    cy.get('[data-test-id="stop-polling-btn"]').click()
    cy.wait(500)

    // Get initial poll count
    cy.get('[data-test-id="poll-count"]').then(($el) => {
      const initialCount = parseInt($el.text())

      // Start polling with 1000ms interval
      cy.get('[data-test-id="start-polling-btn"]').click()

      // Wait for at least one poll
      cy.wait(1100)

      // Poll count should have increased
      cy.get('[data-test-id="poll-count"]').should((el) => {
        const count = parseInt(el.text())
        expect(count).to.be.greaterThan(initialCount)
      })
    })
  })

  it('should update pollInterval when options change', () => {
    cy.get('[data-test-id="channels"]').should('exist')

    // Get initial poll count
    cy.get('[data-test-id="poll-count"]').then(($el) => {
      const initialCount = parseInt($el.text())

      // Change poll interval to 2000ms
      cy.get('[data-test-id="manual-poll-interval-input"]').clear().type('2000')
      cy.get('[data-test-id="change-poll-interval-btn"]').click()

      // Wait for at least one poll with new interval
      cy.wait(2100)

      // Poll count should have increased
      cy.get('[data-test-id="poll-count"]').should((el) => {
        const count = parseInt(el.text())
        expect(count).to.be.greaterThan(initialCount)
      })
    })
  })

  it('should stop polling when pollInterval is set to 0', () => {
    cy.get('[data-test-id="channels"]').should('exist')

    // Get initial poll count
    cy.get('[data-test-id="poll-count"]').then(($el) => {
      const initialCount = parseInt($el.text())

      // Set poll interval to 0
      cy.get('[data-test-id="poll-interval-input"]').clear().type('0')

      // Wait to ensure polling stopped
      cy.wait(1000)

      // Poll count should not have increased
      cy.get('[data-test-id="poll-count"]').should('contain', initialCount.toString())
    })
  })

  it('should start polling when pollInterval changes from 0 to a positive value', () => {
    cy.get('[data-test-id="channels"]').should('exist')

    // Stop polling first
    cy.get('[data-test-id="poll-interval-input"]').clear().type('0')
    cy.wait(500)

    // Get initial poll count
    cy.get('[data-test-id="poll-count"]').then(($el) => {
      const initialCount = parseInt($el.text())

      // Set poll interval to 1000ms
      cy.get('[data-test-id="poll-interval-input"]').clear().type('1000')

      // Wait for at least one poll
      cy.wait(1100)

      // Poll count should have increased
      cy.get('[data-test-id="poll-count"]').should((el) => {
        const count = parseInt(el.text())
        expect(count).to.be.greaterThan(initialCount)
      })
    })
  })
})
