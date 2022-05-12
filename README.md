
 [Amazon Personalize](https://aws.amazon.com/personalize/)
=============



**AWS personalize demo**

1. Git clone repo

2. `$ npm install`
3. create .env file with env vars
`USER_DATASET_ARN`
`CAMPAIGN_ARN`
`AWS_REGION`
`TRACKING_ID`

4. `npm start`

by defailt it ll run on `http://0.0.0.0:8080/`

#### APIs LIST
All apis using get method, just to test easily from browser only

1. `/get-recs` -  To get recommendation on the basis of itemId
2. `/send-user-events` - Endpoint to send events to personalize 
3. `/add-user` - Put realtime user data in personalize user dataset

**Note:** make sure aws config already set on your system. If not please check [AWS Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html "AWS Configuration") 