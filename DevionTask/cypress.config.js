const {defineConfig} = require("cypress");
require('dotenv').config()
const csv = require ('@fast-csv/parse')
const { writeToPath } = require('@fast-csv/format');

const fs = require('fs-extra');
const path = require('path');

async function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve('cypress', 'config', `${file}.json`);
  return fs.readJson(pathToConfigFile);
}

module.exports = defineConfig({
    defaultCommandTimeout: 24000,
    requestTimeout: 24000,
    projectId: "vxck46",
    reporter: "cypress-multi-reporters",
    reporterOptions: {
        "reporterEnabled": "mochawesome",
        "mochawesomeReporterOptions": {
            "reportDir": "cypress/reports/mocha",
            "useInlineDiffs": true,
            "quite": true,
            "overwrite": true,
            "html": true,
            "reportFilename": '[name].html',
            "json": true,
            "embeddedScreenshots": true
        }
    },
    env: {
        apiUrl: 'https://demoqa.com'
    },
    e2e: {
        specPattern: '**/*.cy.js',
        baseUrl: 'https://expenses-tracker.devioneprojects.com',
        viewportHeight: 1200,
        viewportWidth: 2400,
        setupNodeEvents(on, config) {

            on("task", {
                // Create task to write to csv
                readFromCSV()
                {
                    return new Promise(resolve =>
                        {
                            let dataArray = [];
                            csv.parseFile("cypress/fixtures/myCsv.csv", {headers: false})
                            .on('data',(data) => {
                                dataArray.push(data);
                            })
                            .on('end', () =>
                            {
                                resolve(dataArray)
                            })
                        })
                }
            })
            on("task", {
                // Create task to write to csv
                writeToCSV({rows})
                {
                    writeToPath("cypress/fixtures/myCsv.csv", rows)
                    return null;
                }

            })

            config.env = {
                ...process.env,
                ...config.env
            }
            return config
        },
    },
});
