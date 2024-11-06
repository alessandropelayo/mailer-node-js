# Mailer Tracker

 This project is a node based back-end written in typescript. To view the data use [mailer-expo-rn](https://github.com/alessandropelayo/mailer-expo-RN) for web or mobile viewing.
- Supports USPS and UPS tracking notifications from email
- Supports gmail email clients 

## Features

- Connects to email accounts (Gmail) via the google api
- Filters and parses emails with tracking information
- Extracts key details like tracking numbers, courier names, status, and delivery photos

## Prerequisites

- Node (version 20 or higher)
- Docker

## Installation

1. Clone this repository

2. Create a Google Cloud Project

- Create an api key with access to the Gmail API
- [Obtain OAuth 2.0 credentials](https://developers.google.com/identity/protocols/oauth2#1.-obtain-oauth-2.0-credentials-from-the-dynamic_data.setvar.console_name-)
- Not required but you will want to publish to avoid needing to reauthorize every week
- Download the Client Secret as a json file and place inside the root directory of the project
- Program expects credentials.json

3. Create a Docker Container

 Either with the command

 ```bash
    docker run -d -p 5432:5432 --name emailpackage -e POSTGRES_PASSWORD=postgres postgres
 ```

 or from the yml included

 ```bash
    docker-compose up -d
 ```

4. Install dependencies 

 ```bash
    npm install
 ```

5. Run Migrations

 ```bash
    npx prisma migrate dev
 ```

6. Create .env

   use .env.template as a reference

 ```bash
   API_KEY: Define any password
   URL: Used to process cross-origin requests
   DATABASE_URL: url to connect prisma to your postgres db
 ```

7. Build and Run

 ```bash
    npm start
 ```

## Getting Token For A Gmail Account

 Upon starting the server it will attempt open a browser to sign into a google account
 
 The selected account will then be queried in 20 minute increments for new emails from shipping carriers 

 This step only needs to be completed once if the Google Cloud project is "In production"

 Otherwise the token will expire and reauthorization will be required

