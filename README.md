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


**How to run manual tests**

`source run eventLaunch.json`

`source run eventOnSale.json`

`source run eventOrderStatus.json`

`source run eventReorder.json`

`...`

**Tests with debugging verbose**

`source run -debug [event].json`

**How to to deploy**

`source publish.sh`

**Enable Debug Verbosity in AWS Lambda**

Add Environment variable key: __ENABLE_VERBOSE__ with value; __1__