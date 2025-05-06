/**
 * Expenses API – Create expense
 *
 * Prerequisites
 * -------------
 * 1)  The custom command cy.apiLogin() is defined in cypress/support/commands.ts
 * 2)  The SPA stores the JWT in localStorage under "authToken" 
 * 3)  Base URL in cypress.config.{ts,js} is set to
 *        https://expenses-tracker.devioneprojects.com
 */

describe('Expenses API – create expense flow', () => {

  const ts = Math.random().toString(36).slice(2, 8);  
  const ts2 = Math.random().toString(36).slice(2, 8)
  const newComment = `${ts}`;
  const newTime    = '01:01:01';                    // adjust to your API / UI format

  const expense = {
    date:        '2025-05-04',
    time:        '',
    description: `Edit‑target‑${ts2}`,
    amount:      '111.99',
    comment:     '',
  };

  // 🔐 Authenticate once and cache the session
  beforeEach(() => {
    cy.session(
      'lavonne.klocko@mail.com',     // cache key (can be any stable value)
      () => cy.apiLogin(),           // performs the actual login
    );
  });

  it('verifies the new expense appears in the UI list (integration check), edits it, and deletes it', () => {
    cy.intercept('GET', '/api/expenses/**').as('getExpenseDetails');
    cy.intercept('PUT', '/api/expenses/**').as('expenseDetailsEdited');
    cy.intercept('DELETE', '/api/expenses/**').as('expenseDetailsDeleted');

    // Create it directly through the API
    const token = window.localStorage.getItem('authToken');
    cy.request({
      method:  'POST',
      url:     '/api/expenses',
      body:    expense,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).its('status').should('eq', 201);

    // Open the app – user is already authenticated
    cy.visit('https://app-expenses-tracker.devioneprojects.com/expenses');

      // Type into the search field
    cy.get('#word')
      .clear()
      .type(expense.description)   // app auto‑submits on input

    cy.get('table')
      .find('tr:has(td)')        
      .should('have.length', 1); // must have only one row present and visible

    // Confirm the table shows our row
    cy.get('table')
      .contains('td', expense.description)
      .should('be.visible');

      cy.contains('table tr', expense.description)        // grab the <tr> that holds the desc
      .as('targetRow')                                  // alias for reuse
      .within(() => {
        // assumes the edit button is inside the same <tr>
        cy.contains('button', 'Edit').click();
      });

    cy.wait('@getExpenseDetails').its('response.statusCode').should('eq', 200);

    /*  Fill Comment and Time, then Save */
    cy.get('#time').clear().type(`${newTime}`);  // add {enter} if widget needs it
    cy.get('[placeholder="Comment..."]').clear().type(newComment);
    cy.get('button.btn.btn-primary').click();

    cy.wait('@expenseDetailsEdited').its('response.statusCode').should('eq', 201);

    /*  Reload page and search by the new comment */
    cy.visit('https://app-expenses-tracker.devioneprojects.com/expenses');

    //cy.get('div.highlight').invoke('remove');   
    cy.get('#word').clear().type(newComment).type('{enter}');

    cy.get('table')
    .find('tr:has(td)')        
    .should('have.length', 1); // must have only one row present and visible

    /*  Assert the updated row is correct */
    cy.contains('table tr', newComment)
      .should('contain', expense.description)   // original description still present
      .and('contain', newTime)       // time rendered
      .and('contain', expense.amount);

    cy.contains('table tr', expense.description)        // grab the <tr> that holds the desc
      .as('targetRow')                                  // alias for reuse
      .within(() => {
        // assumes the edit button is inside the same <tr>
        cy.contains('button', 'Delete').click();
      });
    cy.get('.react-confirm-alert')        // ⬅ modal’s root ‑ confirm it exists
      .should('be.visible')               //  sanity check
      .within(() => {
        cy.contains('button', /^Yes$/)    // matches exact “Yes” text
          .click();                     
      });
    
    cy.wait('@expenseDetailsDeleted').its('response.statusCode').should('eq', 200);

    cy.contains('Currently no expenses!')

    cy.get('table tbody tr').should('not.exist');

    });

  it('verifies the new expense appears in the UI list (integration check), edits it only by adding a comment', () => {
    /////////////////
    /*  BUG - this fails, time field becomes mandatory if we try to save it and it displays a message "This value is not a valid time." 
        API status code: PUT 400
    */
    /////////////////

    cy.intercept('GET', '/api/expenses/**').as('getExpenseDetails');
    cy.intercept('PUT', '/api/expenses/**').as('expenseDetailsEdited');

    // Create it directly through the API
    const token = window.localStorage.getItem('authToken');
    cy.request({
      method:  'POST',
      url:     '/api/expenses',
      body:    expense,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).its('status').should('eq', 201);

    // Open the app – user is already authenticated
    cy.visit('https://app-expenses-tracker.devioneprojects.com/expenses');

      // Type into the search field
    cy.get('#word')
      .clear()
      .type(expense.description)   // app auto‑submits on input

    cy.get('table')
      .find('tr:has(td)')        
      .should('have.length', 1); // must have only one row present and visible

    // Confirm the table shows our row
    cy.get('table')
      .contains('td', expense.description)
      .should('be.visible');

      cy.contains('table tr', expense.description)        // grab the <tr> that holds the desc
      .as('targetRow')                                  // alias for reuse
      .within(() => {
        // assumes the edit button is inside the same <tr>
        cy.contains('button', 'Edit').click();
      });

    cy.wait('@getExpenseDetails').its('response.statusCode').should('eq', 200);

    /*  Fill Comment, then Save */
    cy.get('[placeholder="Comment..."]').clear().type(newComment);
    cy.get('button.btn.btn-primary').click();

    cy.wait('@expenseDetailsEdited').its('response.statusCode').should('eq', 201);

    /*  Reload page and search by the new comment */
    cy.visit('https://app-expenses-tracker.devioneprojects.com/expenses');

    //cy.get('div.highlight').invoke('remove');   
    cy.get('#word').clear().type(newComment).type('{enter}');

    cy.get('table')
    .find('tr:has(td)')        
    .should('have.length', 1); // must have only one row present and visible

    /*  Assert the updated row is correct */
    cy.contains('table tr', newComment)
      .should('contain', expense.description)   // original description still present
      .and('contain', expense.amount);
    });  
});
