import Luzmo from '@luzmo/nodejs-sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Luzmo client
const client = new Luzmo({
  api_key: process.env.LUZMO_KEY,
  api_token: process.env.LUZMO_TOKEN,
  host: process.env.LUZMO_API_HOST
});

async function migrateIntegrations() {
  // Arrays to store migration reports
  let migrationsReport = [];
  let partialFailures = [];
  let completeFailures = [];

  try {
    // Step 1: Load all Integrations.
    const integrations = await client.get('integration', {
      include: [{
        model: "Securable",
        attributes: ["id", "type"]
      }]
    });

    // Check if any Integrations were found
    if (integrations.count === 0) {
      console.log("No integrations found. Exiting script.");
      return;
    }

    // Step 2: Create a collection for each Integration
    for (const integration of integrations.rows) {
      const integrationName = integration.name;
      const integrationId = integration.id;
      let collectionId;
      let status = 'success';
      let associatedSecurablesCount = 0;

      try {
        // Create a new Collection
        const collectionCreationResponse = await client.create('collection', { name: integrationName });
        collectionId = collectionCreationResponse.id;

        // Associate dashboards and datasets from the Integration with the new Collection
        for (const securable of integration.securables) {
          const securableId = securable.id;

          try {
            await client.associate('collection', collectionId, { role: 'Securables', id: securableId });
            associatedSecurablesCount++;
          } catch (associationError) {
            status = 'partial failure';
            partialFailures.push({ integrationId, collectionId, securableId, error: associationError.message });
          }
        }
      } catch (createCollectionError) {
        status = 'failure';
        completeFailures.push({ integrationId, error: createCollectionError.message });
      }

      // Record migration report
      migrationsReport.push({ integrationId, collectionId, status, associatedSecurablesCount });
    }

    // Write migration report to CSV
    const csvHeader = 'Integration ID,Collection ID,Migration Status,Associated Securables Count,Error Message\n';
    let csvData = csvHeader;

    migrationsReport.forEach(row => {
      const { integrationId, collectionId, status, associatedSecurablesCount, error } = row;
      const errorMessage = error ? `"${error}"` : '';
      csvData += `"${integrationId}","${collectionId}","${status}","${associatedSecurablesCount}","${errorMessage}"\n`;
    });

    // Print migration report to console
    console.log("Migration from Integrations to Collections completed. Report:");
    console.table(migrationsReport);

    // Print partial failures to console
    if (partialFailures.length > 0) {
      console.log("Partial failure details:");
      console.table(partialFailures);
    }

    // Print complete failures to console
    if (completeFailures.length > 0) {
      console.log("Complete failure details:");
      console.table(completeFailures);
    }

    // Save migration report to CSV
    fs.writeFileSync('migration_report.csv', csvData);
    console.log("Migration report saved as 'migration_report.csv'");

  } catch (error) {
    console.error("Error occurred during migration:", error);
  }
}

// Start the migration process
migrateIntegrations();
