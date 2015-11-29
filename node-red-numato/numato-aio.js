module.exports = function(RED) {

    var SerialPort = require("serialport").SerialPort;

    var pintables = {
    //map : pinprint
    "1":"ADC1",
    "2":"ADC2",
    "3":"ADC3",
    "4":"ADC4",
    "5":"ADC5",
    "6":"ADC6",
    "7":"ADC7"
    };

    function analogRead(n) {
        RED.nodes.createNode(this,n);
        this.serialport = n.serialport;
        this.pin = n.pin;
        this.interval = n.interval;
        var node = this;

        node.portObj = new SerialPort(node.serialport ,{
             baudrate: 19200
           }, false);


        node.portObj.on('data', function(data){
        data = data.toString().trim();
        greaterchar = String(data).indexOf('>');
        data = data.slice(12, greaterchar-2);
        node.send({ topic:"analog/"+pintables[node.pin], payload:Number(data)});
        node.status({fill:"green",shape:"dot",text:data});
        if (RED.settings.verbose){node.log("analogRead:"+pintables[node.pin]+": "+data+" :");}
        });


	node.portObj.on('close', function(close){
	    if (RED.settings.verbose){node.log(String(close));}
	});

	setInterval(function() {
	node.portObj.open(function (error){
	  if ( error ) {
	      if (RED.settings.verbose){node.log('Failed to open port: ' + error);}
	  } else {
	      node.portObj.write("adc read "+node.pin+"\r", function(err, results){
              node.running = true;
		      if(error){
			  if (RED.settings.verbose){node.log('Failed to write to port: '+ error);}
		      }
	      });
	  }
	});},node.interval);

	}
    RED.nodes.registerType("numato-aio",analogRead);
}
