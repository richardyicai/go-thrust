var net = require('net');

var action_id = 0;
var BOUNDARY = "--(Foo)++__THRUST_SHELL_BOUNDARY__++(Bar)--";

var client = net.connect({ path: process.argv[2] }, function() {
  console.log('Connected');

  var a = {
    _id: ++action_id,
    _action: "create",
    _type: "window",
    _args: {
      root_url: "http://google.com", //"file:///" + __dirname + "/test.html",
      title: "ExoShell TEST",
      size: {
        width: 800,
        height: 700
      }
    }
  };
  client.write(JSON.stringify(a) + "\n" + BOUNDARY);
});

var acc = "";
client.on('data', function(data) {
  console.log(data.toString());
  acc += data;

  var splits = acc.split(BOUNDARY);
  if(splits.length > 0) {
    var data = splits.shift();
    acc = splits.join(BOUNDARY);
    if(data.length > 0) {
      var action = JSON.parse(data);
      if(action._action === 'reply' && action._result && action._result._target) {

        var a = {
          _id: ++action_id,
          _action: "call",
          _target: action._result._target,
          _method: "show",
          _args: {}
        };
        client.write(JSON.stringify(a) + "\n" + BOUNDARY);

		setTimeout(function() {
			var move = {
			  _id: ++action_id,
			  _action: "call",
			  _target: action._result._target,
			  _method: "move",
			  _args: {
				x: 0,
				y: 0
			  }
			};

			var resize = {
			  _id: ++action_id,
			  _action: "call",
			  _target: action._result._target,
			  _method: "resize",
			  _args: {
				width: 100,
				height: 300
			  }
			};

			client.write(JSON.stringify(move) + "\n" + BOUNDARY);
			client.write(JSON.stringify(resize) + "\n" + BOUNDARY);
		}, 3000);
      }
    }
  }
});
