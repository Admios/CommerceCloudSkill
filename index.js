'use strict';

var http = require('http');

exports.handler = function (event, context) {

  var request = event.request;
  var session = event.session;

  if (!event.session.attributes) {
    event.session.attributes = {};
  }

  try {

    if(process.env.ENABLE_VERBOSE) {
      console.log('Request:\n'+JSON.stringify(event,null,2));
    }

    if (request.type === 'LaunchRequest') {

      handleLaunchRequest(context);

    } else if (request.type === 'IntentRequest') {

      var intent = request.intent;
      var intentName = intent.name;

      switch (intentName) {
        case 'ReorderIntent':
          handleReorderIntent(request, context);
          break;
        case 'OnSaleIntent':
          handleOnSaleIntent(request, context, session);
          break;
        case 'PlaceOrderIntent':
          handlePlaceOrderIntent(request, context, session);
          break;
        case 'OrderStatusIntent':
          handleOrderStatusIntent(request, context);
          break;
        case 'AMAZON.StopIntent' || 'AMAZON.CancelIntent':
          context.succeed(buildResponse({
            speechText: "Good bye.",
            endSession: true
          }));
          break;
        default:
          throw 'Unknown intent.';
      }

    } else if (request.type === 'SessionEndRequest') {

    } else {

      throw 'Unknown intent type.';

    }

  } catch (e) {

    context.fail('Exception: ' + e);

  }
};

function getWish() {
  var myDate = new Date();
  var wish = '';
  var hours = myDate.getUTCHours() - 4;
  if (hours < 0) {
    hours += 24;
  }
  if (hours < 12) {
    wish = 'Good Morning. ';
  } else if (hours < 18) {
    wish = 'Good Afternoon. ';
  } else {
    wish = 'Good Evening. ';
  }
  return wish;
}

function placeOrder(product, store) {
  return Math.floor(Math.random() * 90000000) + 10000000;
}

function getPromo(callback) {
  var url = 'http://alexacommercecloud.cloudhub.io/promo';
  var req = http.get(url, function (res) {
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      //body = body.replace(/\\/g, ''); //removes extra escape character
      console.log('RAW PROMO', body);
      var promotions = [];
      if (!body.includes("Failed")){
        var promos = JSON.parse(body);
        promos.data.forEach(function (promo, idx) {
          console.log(idx, promo.details.replace(/<\/?[^>]+(>|$)/g, ""));
          promotions.push({
            id: idx,
            detail: promo.details.replace(/<\/?[^>]+(>|$)/g, "")
          })
        });
      }
      console.log('Parsed Promotions: ', promotions);
      callback(promotions);
    });
  });

  req.on('error', function (err) {
    callback('', err)
  });
}


function getOnSaleByStore(name) {
  var stores = [
    {
      name: 'Printer bay',
      products: [
        {
          name: 'Toner Cartridges',
          discount: Math.floor(Math.random() * 90) + 10
        },
        {
          name: 'Ink Cartridges',
          discount: Math.floor(Math.random() * 90) + 10
        },
        {
          name: 'Laser Cartridges',
          discount: Math.floor(Math.random() * 90) + 10
        }
      ]
    },
    {
      name: 'Battery depot',
      products: [
        {
          name: 'Triple A Batteries',
          discount: Math.floor(Math.random() * 90) + 10
        },
        {
          name: 'Double A Batteries',
          discount: Math.floor(Math.random() * 90) + 10
        },
        {
          name: 'D Batteries',
          discount: Math.floor(Math.random() * 90) + 10
        }
      ]
    }
  ];
  var rndmIdx = Math.floor(Math.random() * 3);
  var response = 'I didn\'t catch the store name. Please try again.';
  if (name) {
    var discountData = stores.filter(
      function (data) {
        return data.name.toLowerCase() === name.toLowerCase()
      }
    );
    if (discountData.length === 0) {
      response = 'Store <say-as interpret-as="spell-out">' + name + '</say-as> did not match any of our records.';
    } else {
      response = discountData[0].products[rndmIdx].name + ' is on sale for ' + discountData[0].products[rndmIdx].discount + ' percent off. Would you like to place an order?';
    }
  }
  return response;
}

function getOrderStatus(callback){
  var url = 'http://alexacommercecloud.cloudhub.io/order_status';
  var req = http.get(url, function (res) {
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      //body = body.replace(/\\/g, ''); //removes extra escape character
      console.log('RAW Order Status', body);
      var orderStatus = '';
      if (!body.includes("Failed")){
        orderStatus = JSON.parse(body);
      }
      console.log('Parsed order status: ', orderStatus);
      callback(orderStatus);
    });
  });

  req.on('error', function (err) {
    callback('', err)
  });
}

function getOrderStatusByStore(name) {
  var status = ['in process', 'shipped', 'canceled'];
  var stores = [
    {
      name: 'Printer bay',
      products: [
        {
          name: 'Toner Cartridges',
          status: status[Math.floor(Math.random() * 3)]
        },
        {
          name: 'Ink Cartridges',
          status: status[Math.floor(Math.random() * 3)]
        },
        {
          name: 'Laser Cartridges',
          status: status[Math.floor(Math.random() * 3)]
        }
      ]
    },
    {
      name: 'Battery depot',
      products: [
        {
          name: 'Triple A Batteries',
          status: status[Math.floor(Math.random() * 3)]
        },
        {
          name: 'Double A Batteries',
          status: status[Math.floor(Math.random() * 3)]
        },
        {
          name: 'D Batteries',
          status: status[Math.floor(Math.random() * 3)]
        }
      ]
    }
  ];
  var rndmIdx = Math.floor(Math.random() * 3);
  var response = 'I didn\'t catch the store name. Please try again.';
  if (name) {
    var statusData = stores.filter(
      function (data) {
        return data.name.toLowerCase() === name.toLowerCase()
      }
    );
    if (statusData.length === 0) {
      response = 'Store <say-as interpret-as="spell-out">' + name + '</say-as> did not match any of our records.';
    } else {
      response = 'Your order for: ' + statusData[0].products[rndmIdx].name + ' status is ' + statusData[0].products[rndmIdx].status + '.';
    }
  }
  return response;
}

function buildResponse(options) {

  if(process.env.ENABLE_VERBOSE) {
    console.log('buildResponse options:\n'+JSON.stringify(options,null,2));
  }

  var res = {
    version: '1.0',
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: '<speak>' + options.speechText + '</speak>'
      }
    }
  };

  if (options.repromptText) {
    res.response.reprompt = {
      outputSpeech: {
        type: 'SSML',
        ssml: '<speak>' + options.repromptText + '</speak>'
      }
    };
  }

  if (options.cardTitle) {
    res.response.card = {
      type: 'Simple',
      title: options.cardTitle
    };

    if (options.imageUrl) { //imageUrl must be served via https
      res.response.card.type = 'Standard';
      res.response.card.text = options.cardContent;
      res.response.card.image = {
        smallImageUrl: options.imageUrl,
        largeImageUrl: options.imageUrl
      };
    } else {
      res.response.card.content = options.cardContent;
    }
  }

  res.response.shouldEndSession = options.endSession;

  if (options.session && options.session.attributes) {
    res.sessionAttributes = options.session.attributes;
  }

  if(process.env.ENABLE_VERBOSE) {
    console.log('Response:\n'+JSON.stringify(res,null,2));
  }

  return res;
}

function handleLaunchRequest(context) {
  var options = {};
  options.speechText = getWish() + 'Welcome to Commerce Cloud skill. Using our skill you can do your online shopping. Let\'s begin?';
  options.repromptText = 'You can say for example, Are there any sales for today?';
  options.endSession = true;

  context.succeed(buildResponse(options));
}

function handleReorderIntent(request, context) {
  var options = {};
  var intent = request.intent;
  var slots = intent.slots;
  var product = slots && slots.ProductName ? slots.ProductName.value : '';
  var store = slots && slots.StoreName ? slots.StoreName.value : '';

  var orderNumber = placeOrder(product, store);
  options.speechText = 'Order placed. ';
  options.speechText += 'Your order number is: <say-as interpret-as="digits">' + orderNumber + '</say-as>.';
  options.endSession = true;
  context.succeed(buildResponse(options));
}

function handleOnSaleIntent(request, context, session) {
  var options = {};
  var intent = request.intent;
  console.log('*** Intent: ', intent);
  var slots = intent.slots;
  var store = slots.StoreName ? slots.StoreName.value : '';
  console.log('*** StoreName: ', store);
  options.session = session;
  getPromo(function (promos, err) {
    if (err) {
      context.fail(err);
    } else {
      if(promos.length === 0){
        options.speechText = `I could not find any promos.`;
      }else if (promos.length === 1) {
        options.speechText = `I found one promo: ${promos[0].detail}`;
        options.speechText += " Would you like to place an order? ";
      } else {
        options.speechText = `I found the following promos: `;
        promos.forEach(function(promo){
          options.speechText += `<say-as interpret-as="cardinal">${promo.id}</say-as>. ${promo.detail}`
        });
        options.speechText += " Would you like to place an order? ";
      }
      options.repromptText = " You can say Yes to order or No to cancel. ";
      options.session.attributes.placeOrder = true;
      options.endSession = false;
      context.succeed(buildResponse(options));
    }
  });
}

function handlePlaceOrderIntent(request, context, session) {
  var options = {};
  options.session = session;
  if (session.attributes.placeOrder) {
    var orderNumber = placeOrder('', '');
    options.speechText = 'Order placed. ';
    options.speechText += 'Your order number is: <say-as interpret-as="digits">' + orderNumber + '</say-as>.';
    options.endSession = true;
    context.succeed(buildResponse(options));
  } else {
    options.speechText = " Wrong invocation of this intent. ";
    options.endSession = true;
    context.succeed(buildResponse(options));
  }

}

function handleOrderStatusIntent(request, context) {
  var options = {};
  var intent = request.intent;
  console.log('*** Intent: ', intent);
  var slots = intent.slots;
  var store = slots.StoreName ? slots.StoreName.value : '';
  console.log('*** StoreName: ', store);
  getOrderStatus(function(orderStatus, err) {
    if (err) {
      context.fail(err);
    } else if (orderStatus) {
      options.speechText = `Order number: <say-as interpret-as="digits">${orderStatus.orderNo}</say-as> status is ${orderStatus.status}.`;
      options.endSession = true;
    } else {
      options.speechText = 'There is a problem getting your order status. Please try again later.';
      options.endSession = true;
    }
    context.succeed(buildResponse(options));
  });

}