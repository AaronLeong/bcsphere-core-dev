var SerialPortService = BC.SerialPortService = BC.Service.extend({
	
	readCharacterUUID : "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
	writeCharacterUUID : "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
	
	read : function(successFunc,errorFunc){
		alert("BLE read");
	},
	
	write : function(writeType,writeValue,successFunc,errorFunc){
		alert("BLE write");
	},
	
	subscribe : function(callback){
		alert("BLE subscribe");
	},
	
	unsubscribe : function(){
		alert("BLE unsubscribe");
	}, 
});