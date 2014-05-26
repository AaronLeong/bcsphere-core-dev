cordova.define("org.bcsphere.bleprofiles.serialport", function(require, exports, module) {  /*
    Copyright 2013-2014, JUMA Technology

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

var serialport = {

    serviceUUID   : "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
    readcharUUID  : "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
    writecharUUID : "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
    MASTER : "Master",
    SLAVE : "Slave",
    role : "Master",
    service : {},
    
	read : function(device,successFunc,errorFunc){
		if(device.type == "Classical"){
			device.rfcommRead(successFunc,errorFunc);
		}else if(device.type == "BLE"){
			device.discoverServices(function(){
				var service = device.getServiceByUUID(serialport.serviceUUID)[0];
				service.read(successFunc,errorFunc);
			});
		}
	},
	
	write : function(device,writeType,writeValue,successFunc,errorFunc){
		if(device.type == "Classical"){
			device.rfcommWrite(writeType,writeValue,successFunc,errorFunc);
		}else if(device.type == "BLE"){
			device.discoverServices(function(){
				var service = device.getServiceByUUID(serialport.serviceUUID)[0];
				service.write(writeType,writeValue,successFunc,errorFunc);
			});
		}
	},
	
	subscribe : function(device,callback){
		if(device.type == "Classical"){
			device.rfcommSubscribe(callback);
		}else if(device.type == "BLE"){
			device.discoverServices(function(){
				var service = device.getServiceByUUID(serialport.serviceUUID)[0];
				service.subscribe(callback);
			});
		}
	},
	
	unsubscribe : function(device){
		if(device.type == "Classical"){
			device.rfcommUnsubscribe();
		}else if(device.type == "BLE"){
			device.discoverServices(function(){
				var service = device.getServiceByUUID(serialport.serviceUUID)[0];
				service.unsubscribe();
			});
		}
	}, 
	
	listen : function(name,uuid,secure){
		if(API !== "ios" && name && uuid && secure){
			BC.Bluetooth.RFCOMMListen(name,uuid,secure);
			serialport.role = serialport.SLAVE;
		}else{
			var service = new BC.Service({uuid:serialport.serviceUUID});
			
			var readcharpermission = ["read"];
			var readcharproperty = ["read","notify"];
			var readcharacter = new BC.Characteristic({uuid:serialport.readcharUUID,value:"01",type:"Hex",property:readcharproperty,permission:readcharpermission});
			readcharacter.addEventListener("oncharacteristicread",function(s){alert("OBJECT EVENT!! oncharacteristicread : (" + s.uuid + ")");});

			var writecharpermission = ["write"];
			var writecharproperty = ["write"];
			var writecharacter = new BC.Characteristic({uuid:serialport.writecharUUID,value:"01",type:"Hex",property:writecharproperty,permission:writecharpermission});
			writecharacter.addEventListener("oncharacteristicwrite",function(s){alert("OBJECT EVENT!! oncharacteristicwrite : (" + s.uuid + ") writeValue:" + s.writeValue.getHexString());});

			//Adds a characteristic to a service. 
			service.addCharacteristic(readcharacter);
			service.addCharacteristic(writecharacter);
			
			//Adds a service to the smart phone.
			BC.Bluetooth.AddService(service,function(){
				serialport.service = service;
				serialport.role = serialport.SLAVE;
			},function(){
				alert("Listening error.");
			});
		}
	},
	
	unlisten : function(name,uuid){
		if(API !== "ios" && name && uuid){
			BC.Bluetooth.RFCOMMUnListen(name,uuid);
			serialport.role = serialport.MASTER;
		}else{
			if(serialport.service){
				BC.Bluetooth.RemoveService(serialport.service,function(){
					serialport.service = null;
					serialport.role = serialport.MASTER;
				},function(){
					alert("unlisten error.");
				});
			}
		}
	},
};
module.exports = serialport;


});