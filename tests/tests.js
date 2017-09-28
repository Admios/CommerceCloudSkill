'use strict';

var expect = require('chai').expect;

var lambdaToTest = require('../index');


function Context() {
  this.speechResponse = null;
  this.speechError = null;

  this.succeed = function(rsp) {
    this.speechResponse = rsp;
    this.done();
  };

  this.fail = function(rsp) {
    this.speechError = rsp;
    this.done();
  };

}

function validRsp(ctx,options) {
  expect(ctx.speechError).to.be.null;
  expect(ctx.speechResponse.version).to.be.equal('1.0');
  expect(ctx.speechResponse.response).not.to.be.undefined;
  expect(ctx.speechResponse.response.outputSpeech).not.to.be.undefined;
  expect(ctx.speechResponse.response.outputSpeech.type).to.be.equal('SSML');
  expect(ctx.speechResponse.response.outputSpeech.ssml).not.to.be.undefined;
  expect(ctx.speechResponse.response.outputSpeech.ssml).to.match(/<speak>.*<\/speak>/);
  if(options.endSession) {
    expect(ctx.speechResponse.response.shouldEndSession).to.be.true;
    expect(ctx.speechResponse.response.reprompt).to.be.undefined;
  } else {
    expect(ctx.speechResponse.response.shouldEndSession).to.be.false;
    expect(ctx.speechResponse.response.reprompt.outputSpeech).to.be.not.undefined;
    expect(ctx.speechResponse.response.reprompt.outputSpeech.type).to.be.equal('SSML');
    expect(ctx.speechResponse.response.reprompt.outputSpeech.ssml).to.match(/<speak>.*<\/speak>/);
  }

}

function validCard(ctx,standardCard) {
  expect(ctx.speechResponse.response.card).not.to.be.undefined;
  expect(ctx.speechResponse.response.card.title).not.to.be.undefined;
  if(standardCard){
    expect(ctx.speechResponse.response.card.type).to.be.equal('Standard');
    expect(ctx.speechResponse.response.card.text).not.to.be.undefined;
    expect(ctx.speechResponse.response.card.image).not.to.be.undefined;
    expect(ctx.speechResponse.response.card.image.largeImageUrl).to.match(/^https:\/\//);
    expect(ctx.speechResponse.response.card.image.smallImageUrl).to.match(/^https:\/\//);
  }else{
    expect(ctx.speechResponse.response.card.type).to.be.equal('Simple');
    expect(ctx.speechResponse.response.card.content).not.to.be.undefined;
  }
}



var event = {
  session: {
    new: false,
    sessionId: 'session1234',
    attributes: {},
    user: {
      userId: 'usrid123'
    },
    application: {
      applicationId: 'amzn1.echo-sdk-ams.app.1234'
    }
  },
  version: '1.0',
  request: {
    intent: {
      slots: {
        SlotName: {
          name: 'SlotName',
          value: 'slot value'
        }
      },
      name: 'intent name'
    },
    type: 'IntentRequest',
    requestId: 'request5678'
  }
};




describe('All Commerce Cloud Skill Intents', function() {
  var ctx = new Context();


  describe('Test LaunchIntent', function() {

    before(function(done) {
      event.request.type = 'LaunchRequest';
      event.request.intent = {};
      event.session.attributes = {};
      ctx.done = done;
      lambdaToTest.handler(event , ctx);
    });


    it('shoud have valid response', function() {
      validRsp(ctx,{
        endSession: false,
      });
    });

    it('should have valid outputSpeech', function() {
      expect(ctx.speechResponse.response.outputSpeech.ssml).to.match(/Welcome to Commerce Cloud skill/);
    });

    it('should have valid repromptSpeech', function() {
      expect(ctx.speechResponse.response.reprompt.outputSpeech.ssml).to.match(/You can say/);
    });

  });

  describe(`Test ReorderIntent`, function() {

    before(function(done) {
      event.request.intent = {};
      event.session.attributes = {};
      event.request.type = 'IntentRequest';
      event.request.intent.name = 'ReorderIntent';
      event.request.intent.slots = {
        ProductName: {
          name: 'ProductName',
          value: 'Ink cartridges'
        },
        StoreName: {
          name: 'StoreName',
          value: 'Inkbay'
        }
      };
      ctx.done = done;
      lambdaToTest.handler(event , ctx);
    });

    it('should have valid response', function() {
      validRsp(ctx, {
        endSession: true
      });
    });

    it('should have valid outputSpeech', function() {
      expect(ctx.speechResponse.response.outputSpeech.ssml).to.match(/Order placed./);
    });

    // it('valid repromptSpeech', function() {
    //  expect(ctx.speechResponse.response.reprompt.outputSpeech.ssml).to.match(/<speak>For example.*<\/speak>/);
    // });

  });

  describe(`Test OnSaleIntent`, function() {
    this.timeout(4000);
    before(function(done) {
      event.request.intent = {};
      event.session.attributes = {};
      event.request.type = 'IntentRequest';
      event.request.intent.name = 'OnSaleIntent';
      event.request.intent.slots = {
        StoreName: {
          name: 'StoreName',
          value: 'Inkbay'
        }
      };

      ctx.done = done;
      lambdaToTest.handler(event , ctx);
    });

    it('should have valid response', function() {
      validRsp(ctx, {
        endSession: false
      });
    });

    it('should have valid outputSpeech', function() {
      expect(ctx.speechResponse.response.outputSpeech.ssml).to.match(/I could not find any promos/);
    });

    // it('valid repromptSpeech', function() {
    //   expect(ctx.speechResponse.response.reprompt.outputSpeech.ssml).to.match(/You can say/);
    // });

  });

  describe(`Test PlaceOrderIntent`, function() {

    before(function(done) {
      event.request.intent = {};
      event.session.attributes = ctx.speechResponse.sessionAttributes;
      event.request.type = 'IntentRequest';
      event.request.intent.name = 'PlaceOrderIntent';
      ctx.done = done;
      lambdaToTest.handler(event , ctx);
    });

    it('should have valid response', function() {
      validRsp(ctx, {
        endSession: true
      });
    });

    it('should have valid outputSpeech', function() {
      expect(ctx.speechResponse.response.outputSpeech.ssml).to.match(/Order placed/);
    });

    // it('valid repromptSpeech', function() {
    //   expect(ctx.speechResponse.response.reprompt.outputSpeech.ssml).to.match(/You can say/);
    // });

  });

  describe(`Test OrderStatusIntent`, function() {
    this.timeout(4000);
    before(function(done) {
      event.request.intent = {};
      event.session.attributes = {};
      event.request.type = 'IntentRequest';
      event.request.intent.name = 'OrderStatusIntent';
      event.request.intent.slots = {
        StoreName: {
          name: 'StoreName',
          value: 'Inkbay'
        }
      };

      ctx.done = done;
      lambdaToTest.handler(event , ctx);
    });

    it('should have valid response', function() {
      validRsp(ctx, {
        endSession: true
      });
    });

    it('should have valid outputSpeech', function() {
      expect(ctx.speechResponse.response.outputSpeech.ssml).to.match(/There is a problem/);
    });

  });

  describe(`Test OrderProductIntent`, function() {

    before(function(done) {
      event.request.intent = {};
      event.session.attributes = ctx.speechResponse.sessionAttributes;
      event.request.type = 'IntentRequest';
      event.request.intent.name = 'OrderProductIntent';
      event.request.intent.slots = {
        ProductName: {
          name: 'ProductName',
          value: 'Toner cartridges'
        },
        StoreName: {
          name: 'StoreName',
          value: 'Inkbay'
        }
      };

      ctx.done = done;
      lambdaToTest.handler(event , ctx);
    });

    it('should have valid response', function() {
      validRsp(ctx, {
        endSession: false
      });
    });

    it('should have valid outputSpeech', function() {
      expect(ctx.speechResponse.response.outputSpeech.ssml).to.match(/from store/);
    });

  });

  describe(`Test AMAZON.StopIntent`, function() {

    before(function(done) {
      event.request.intent = {};
      event.session.attributes = {};
      event.request.type = 'IntentRequest';
      event.request.intent.name = 'AMAZON.StopIntent';
      ctx.done = done;
      lambdaToTest.handler(event , ctx);
    });

    it('should have valid response', function() {
      validRsp(ctx, {
        endSession: true
      });
    });

    it('should have valid outputSpeech', function() {
      expect(ctx.speechResponse.response.outputSpeech.ssml).to.match(/Good bye/);
    });

  });


});
