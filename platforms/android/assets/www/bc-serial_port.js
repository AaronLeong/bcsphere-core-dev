var SerialPortService = BC.SerialPortService = BC.Service.extend({
	
	readCharacterUUID : "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
	writeCharacterUUID : "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
	
	read : function(role,successFunc,errorFunc){
		this.discoverCharacteristics(function(){
			this.getCharacteristicByUUID(this.readCharacterUUID)[0].read(function(data){
	         	 callback(data.value);
	        });
	    });
	},
	
	write : function(role,writeType,writeValue,successFunc,errorFunc){
       	this.discoverCharacteristics(function(){
            this.getCharacteristicByUUID(this.writeCharacterUUID)[0].write(writeType,writeValue,successFunc,errorFunc);
        });
	},
	
	subscribe : function(role,callback){
		this.discoverCharacteristics(function(){
            this.getCharacteristicByUUID(this.readCharacterUUID)[0].subscribe(callback);
        });
	},
	
	unsubscribe : function(role){
		this.discoverCharacteristics(function(){
            this.getCharacteristicByUUID(this.readCharacterUUID)[0].unsubscribe();
        });
	}, 
});