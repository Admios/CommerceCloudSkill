# Commerce Cloud Skill

**Initial setup**

1)Node install procedure for macOS/linux (reference https://github.com/creationix/nvm)
  
  `$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash`
  
  `$ source ~/.bash_profile`
  
  `$ nvm install v4.3.2`

  For windows, please download node.js from https://nodejs.org/en/download

2)Lambda local setup (https://github.com/ashiina/lambda-local)
  
  `$ npm install -g lambda-local`

3)AWS CLI setup
  
  `$ pip install awscli`
  
  `//Create a user and give permissions at IAM Management console`
  
  `$ aws configure  //provide permissions credentials`
  
4)Mocha and Chai

  `npm install -g mocha && npm install -g chai`


**How to run manual tests**

`source run [-debug] eventLaunch.json`

`source run [-debug] eventOnSale.json`

`source run [-debug] eventOrderStatus.json`

`source run [-debug] eventReorder.json`

`...`

**How to run automated tests**

 `export NODE_PATH=~/.nvm/versions/node/v4.3.2/lib/node_modules`
 `mocha tests.js`

**Tests with debugging verbose**

`source run -debug [event].json`

**How to to deploy**

`source publish.sh`

**Enable Debug Verbosity in AWS Lambda**

Add Environment variable key: __ENABLE_VERBOSE__ with value; __1__