# Commerce Cloud Skill

**Initial setup**

1)Node install procedure for macOS/linux (reference https://github.com/creationix/nvm)
  
  `$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash`
  
  `$ source ~/.bash_profile`
  
  `$ nvm install v4.3.2`

  For windows, please download node.js from https://nodejs.org/en/download

2)Lambda local setup (https://github.com/ashiina/lambda-local)
  
  `$ npm install -g lambda-local`

3)Local testing command

  `# lambda-local -l index.js -h handler -e event.json`

4)AWS CLI setup
  
  `$ pip install awscli`
  
  `//Create a user and give permissions at IAM Management console`
  
  `$ aws configure  //provide permission credentials`


**How to run manual tests**

`source run eventLaunch.json`

`source run eventOnSale.json`

`source run eventOrderStatus.json`

`source run eventReorder.json`

**How to to deploy**

`source publish.sh`
