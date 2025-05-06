# 🧪 Expenses Tracker – API & UI Integration Test Suite

This Cypress-based test suite validates the **create → edit → delete** flow for the [Expenses Tracker App](https://app-expenses-tracker.devioneprojects.com/expenses), using a combination of direct API interactions and UI assertions. The goal is to ensure that expenses created via API are immediately visible and editable in the user interface.

---

## 🚀 Features Tested

- **POST** `/api/expenses` – Creating an expense via API
- **UI Search** – Verifying the expense appears in the UI
- **Edit Flow** – Editing time and comment via UI form
- **Validation** – Handling error if time field is missing or invalid
- **DELETE** – Removing the expense and confirming it is no longer listed
