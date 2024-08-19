# IoT Device Management API

## Table of Contents

- [Getting Started](/iot-device-management-api?tab=readme-ov-file#getting-started)
- Scenario: Smart Building Temperature Monitoring System
- High Level Architecture and Database Design
- API Documentation
- Unit tests
- Integration tests
- CI/CD

## Getting Started

The API was built using the [Serverless Framework](https://www.serverless.com/) v4. It was built using NodeJS v20 and Typescript v5 and can be deployed to the AWS cloud. To get started clone the repo and make sure the following prerequisites are installed in your machine.

### Prerequisites

1. [NodeJS](https://nodejs.org/) v20 or above.
2. AWS Account along with the [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configured.
3. [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and configured along with [Docker compose](https://docs.docker.com/compose/install/). (This is needed for [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html#docker))
4. Optional - [Prettier](https://prettier.io/docs/en/editors) installed in your IDE for code formatting. (Preferably [VS Code](https://code.visualstudio.com/download))

### Setting up Local Development

After cloning the repo, run the following command to install all the required dependencies.

```
npm install
```

The project is configured to connect to DynamoDB Local when doing local development. DynamoDB local can be setup locally in different ways. For convenience and ease of use a docker compose file can be found under `scripts/docker-compose.yml`. Run the following command inside that directory to start the local docker instance.

```
docker compose up
```

A convenient script can also be found under the same folder `scripts/create-table.mjs`. Run this script using the following command to create the necessary tables locally for the API. Make sure to run this script after the DynamoDB Docker instance is up and running.

```
node create-table.mjs
```

Finally you can refer to the `.env.sample` file to configure the required environment variables for the API to run locally. You can simply rename the file to `.env` and everything should work fine. 

If needed do change the `DYNAMODB_LOCAL_ENDPOINT`/ `DYNAMODB_LOCAL_REGION` or the `DYNAMODB_LOCAL_SENSORS_TABLE_NAME` if you have done any custom changes.

You will also find two more environment variables related to integration tests. These can be configured after deploying the API to the `dev` stage. Then you would have the necessary API URL to configure as the `INTEGRATION_TEST_BASE_URL` variable. The `INTEGRATION_TEST_STAGE` can remain as `dev`.

After configuring the `.env` file the project is now ready to run locally. Run the project locally using the following command. (Uses [serverless-offline](https://www.serverless.com/plugins/serverless-offline) plugin)

```
npm start
```

### Deployment

To deploy the API to the `dev` stage run the following command.

```
npm run deploy-dev
```

This should deploy the API to the dev stage and produce an API gateway URL which makes the REST API ready-to-use. Refer to the CI/CD section for streamlined deployments.


## Scenario: Smart Building Temperature Monitoring System

### Overview

Imagine a smart building equipped with various IoT devices that monitor temperature levels in critical areas such as ventilation shafts, corridors, and server rooms. These devices are essential for maintaining optimal conditions and ensuring the safety and efficiency of the building's operations.

### Use Cases

1. Device Registration

   - **Situation:** The building management wants to monitor the temperature in the ventilation shaft and corridors. They install a Honeywell Temperature Sensor in the ventilation shaft and an Arduino Temperature Sensor in the corridor.

   - **API Action:** The management registers these devices using the API and save metadata such as the device name and its location.

2. Temperature Monitoring

   - **Situation:** The devices continuously monitor temperature levels. Every few seconds, they send temperature readings to the system. Each reading includes a timestamp and the temperature value.

   - **API Action:** The devices send their readings to the system using the API. Each reading includes a timestamp and the temperature value.

3. Anomaly Detection

   - **Situation:** Occasionally, the Honeywell Temperature Sensor detects a sharp increase in temperature in the ventilation shaft, rising from 41°C to 70°C within seconds. This spike could indicate an overheating issue. Upon detecting this anomaly, the device sends an error status labeled as "High" using the API. Similarly, the Arduino Temperature Sensor in the corridor records a sudden drop in temperature to 20°C, which is below the expected range and thereby resulting in an error status of "Low".

   - **API Action:** The management would like to identify what devices have logged an error status as High/ Low at any given time. Conversely, they would also like to see for a particular device what are the error readings logged in the system.

4. Data Retrieval:

   - **Situation:** The management wants to review the historical temperature data for analysis and reporting.

   - **API Action:** Ideally they would want to retrieve both Device details and its readings using the same API call. This makes it easier for them to understand and visualize. Further they would also like to see the latest readings from a given device. (Ex:- Last 10 readings) This helps to keep track of devices easier.

5. Device Maintenance and Updates:

   - **Situation:** Over time, the management decides to replace the Arduino Temperature Sensor with a more advanced model.

   - **API Action:** The device information needs to be updated in the system.

6. Device Decommissioning:

   - **Situation**: Eventually, a device might need to be removed from the system, such as when a sensor is retired or relocated.

   - **API Action:** The management deletes the device record using the API, ensuring the system's data remains current and relevant.

This API-driven solution enables real-time monitoring and management of IoT devices in a smart building environment. It helps ensure that critical areas maintain optimal temperature levels and allows the building management to respond quickly to any anomalies, enhancing safety and operational efficiency.
