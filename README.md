# Migration script from Integrations to Collections

This project is a Javascript script that migrates all Integrations from a Luzmo user to Collections and associates the same dashboard and datasets by using the Luzmo API.
1. All Integrations and their associated Dashboard/Datasets are loaded.
2. For each Integration: 
   - a Collection with the same name is created.
   - the Dashboard/Datasets that were associated with the Integration are associated to this new Collection.

A full report is printed and written to CSV when the script has finished.

## Usage

To use this project, follow these steps:

1. Clone the repository to your local machine.
2. Create an `.env` file containing a the following info: 
  LUZMO_KEY=`<your Luzmo API key>`
  LUZMO_TOKEN=`<the Luzmo API token>`
  LUZMO_API_HOST=`<Tenancy of luzmo.com to connect to (Default: 'https://api.luzmo.com', for US set to 'https://api.us.luzmo.com')>`
4. Install the dependencies by running `npm install`.
5. Run the migration script by running `npm start`.

## Dependencies

This project has the following dependencies:
- `@luzmo/nodejs-sdk`: Used to execute Luzmo API calls.
- `dotenv`: loads environment variable
