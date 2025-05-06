import '@testing-library/cypress/add-commands'
import "cypress-real-events";
import 'cypress-map'
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Gets the token by making API call to POST /login.
 * Make sure environment variables in .env
 * have username and password values set.
 */
var headers_login = new Headers();
headers_login.append("Content-Type", "application/json");



Cypress.Commands.add('apiLogin', () => {
  cy.request({
    method: 'POST',
    url: 'https://expenses-tracker.devioneprojects.com/api/login',   // full URL
    body: {
      email:    'lavonne.klocko@mail.com',
      password: 'iusto',
    },
    // If the API returns non‑2xx for bad credentials you can keep the line below
    // failOnStatusCode: false,
  }).then(({ status, body, headers }) => {
    expect(status).to.eq(200);            // 200 OK or 201 Created, whichever the API uses

    /*
      Typical patterns:
        • body.token  → JWT
        • headers['set-cookie'] → session cookies
    */
    const token = body?.token || body?.jwt || null;
    if (token) {
      window.localStorage.setItem('authToken', token);
    }

    // Cookies set in Set‑Cookie headers are automatically carried forward by Cypress,
    // so no extra code is needed unless you want to whitelist / preserve them between tests.
  });
});

Cypress.Commands.add("get_token", () => {
  const email = Cypress.env("LOGIN_EMAIL");
  const password = Cypress.env("LOGIN_PASSWORD");

  // it is ok for the username to be visible in the Command Log
  expect(email, "email was set").to.be.a("string").and.not.be.empty;
  // but the password value should not be shown
  if (typeof password !== "string" || !password) {
    throw new Error(
      "Missing password value, set in .env file as LOGIN_PASSWORD"
    );
  }

  cy.request({
    method: "POST",
    url: Cypress.env("apiUrl") + "/Account/v1/GenerateToken",
    failOnStatusCode: false,
    json: true,
    form: false,
    body: { userName: email, password: password },
    headers: headers_login,
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.setLocalStorage("token", response.token);
    Cypress.env("token", response.token);
  });
});

Cypress.Commands.add("loginByApi", () => {
  const email = Cypress.env("LOGIN_EMAIL");
  const password = Cypress.env("LOGIN_PASSWORD");

  cy.session(email, () => {
    cy.request({
      method: "POST",
      url: Cypress.env("apiUrl") + "/Account/v1/GenerateToken",
      failOnStatusCode: false,
      json: true,
      form: false,
      body: { userName: email, password: password },
      headers: headers_login,
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.setLocalStorage("token", response.token);
      Cypress.env("token", response.token);
    });
  });
});

Cypress.Commands.add("loginViaBackend", () =>{

  const email = Cypress.env("LOGIN_EMAIL");
  const password = Cypress.env("LOGIN_PASSWORD");

  cy.request(
      'POST',
      Cypress.env("apiUrl") + "/Account/v1/GenerateToken",
      {
          userName: email,
          password:password
      }
  ).its("body").then((response)=>{
      window.localStorage.setItem("token", response.token);
  })
})

Cypress.Commands.add("generate_token", () => {

  const email = Cypress.env("LOGIN_EMAIL");
  const password = Cypress.env("LOGIN_PASSWORD");

  cy.request({
    method: "POST",
    url: Cypress.env("apiUrl") + "/Account/v1/GenerateToken",
    body: {
      userName: email,
      password: password,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property("status", "Success");
    expect(response.body).to.have.property("result", "User authorized successfully.");

    // Store token in Cypress environment variable to use in subsequent requests
    Cypress.env("authToken", response.token);

  });
});


Cypress.Commands.add('login_and_generate_token', () => {

  const email = Cypress.env("LOGIN_EMAIL");
  const password = Cypress.env("LOGIN_PASSWORD");

  cy.request({
    method: 'POST',
    url: Cypress.env("apiUrl") + "/Account/v1/Login",
    body: {
      userName: email,
      password: password
    }
  }).then((response) => {
    const { token, userId, userName, password } = response.body;
    // Spremamo token u custom Cypress variable
    Cypress.env('userToken', token);
    // Možemo spremiti i druge korisne informacije za kasnije korišćenje
    Cypress.env('userId', userId);
    Cypress.env('username', userName);
    Cypress.env('password', password);
  });
});


Cypress.Commands.add("login", () => {
  const username = Cypress.env("LOGIN_EMAIL");
  const password = Cypress.env("LOGIN_PASSWORD");

  expect(username, "email was set").to.be.a("string").and.not.be.empty;
  if (typeof password !== "string" || !password) {
    throw new Error(
      "Missing password value, set in .env file as LOGIN_PASSWORD"
    );
  }

  cy.visit("/");
  cy.get("[id=email]").type(username);
  cy.get("[id=password]").type(password, { log: false });
  cy.get("[type=submit]").click();
  cy.get(".profile-name").contains(`Test QA Automation`);
});

Cypress.Commands.add(
  "post_req",
  (headers, url, payload, expected_status_code) => {
    cy.request({
      method: "POST",
      url: url,
      failOnStatusCode: false,
      json: true,
      form: false,
      body: payload,
      headers: headers,
    }).then((response) => {
      expect(response.status).to.eq(expected_status_code);
      // Stringify the response JSON
      const apiResponseString = JSON.stringify(response.body, null, 2);

      // Log the response as a string using cy.log()
      cy.log('API Response:', apiResponseString);

      return cy.wrap(response.body); // Properly wrap the response for chaining
    });
  }
);

Cypress.Commands.add("get_req", (headers, url, expected_status_code) => {
  cy.request({
    method: "GET",
    url: url,
    failOnStatusCode: false,
    json: true,
    form: false,
    headers: headers,
  }).then((response) => {
    expect(response.status).to.eq(expected_status_code);
    return response.body;
  });
});

Cypress.Commands.add(
  "put_req",
  (headers, url, payload, expected_status_code) => {
    cy.request({
      method: "PUT",
      url: url,
      failOnStatusCode: false,
      json: true,
      form: false,
      body: payload,
      headers: headers,
    }).then((response) => {
      expect(response.status).to.eq(expected_status_code);
      return response.body;
    });
  }
);

Cypress.Commands.add("del_req", (headers, url, expected_status_code) => {
  cy.request({
    method: "DELETE",
    url: url,
    failOnStatusCode: false,
    json: true,
    form: false,
    headers: headers,
  }).then((response) => {
    expect(response.status).to.eq(expected_status_code);
    return response.body;
  });
});


// Access element whose parent is hidden
Cypress.Commands.add('isVisible', {
  prevSubject: true
}, (subject) => {
  const isVisible = (elem) => !!(
    elem.offsetWidth ||
    elem.offsetHeight ||
    elem.getClientRects().length
  )
  expect(isVisible(subject[0])).to.be.true
})


Cypress.Commands.add('getButtonByText', (value) => {
  return cy.xpath(`//button[.='${value}']`)
})

Cypress.Commands.add('getDivByText', (value) => {
  return cy.xpath(`//div[contains(text(),'${value}')]`)
})

Cypress.Commands.add('get1rowTdByText', (value) => {
  return cy.xpath(`//tr[1] //td[contains(.,'${value}')]`)
})

Cypress.Commands.add('getFollowingSiblingsFromOznaka', (value) => {
  return cy.xpath(`//td[contains(.,'${value}')]/following-sibling::td`)
})

Cypress.Commands.add("check_toast_msg", (failOrSuccess, createOrEditOrSent) => {

  cy.get(`.p-toast-message-${failOrSuccess}`, { timeout: 25000 }).should('contain', `${createOrEditOrSent}`)
})