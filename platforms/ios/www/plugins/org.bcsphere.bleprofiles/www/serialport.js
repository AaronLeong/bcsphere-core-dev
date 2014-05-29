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
    
    processRcvDataCallback : function(data){
    	if(serialport.subscribeCallback == null){
			if(serialport.buffer == null){
				serialport.buffer = new BC.DataValue(null);
            }
			serialport.buffer.append(data.value);
		}else{
			serialport.subscribeCallback(data);
		}
    },
    
    connect : function(device,successFunc,errorFunc,uuid,secure){
    	device.connect(function(){
    		device.discoverServices(function(){
            	var service = device.getServiceByUUID(serialport.serviceUUID)[0];
            	service.subscribe(serialport.processRcvDataCallback);
        	});
        	successFunc();
    	},errorFunc,uuid,secure);
    },
    
	read : function(device,successFunc,errorFunc){
        if(API == "ios" && serialport.role == serialport.SLAVE){
            if(!serialport.buffer){
               successFunc(null);
            }
            var data = {};
            data.value = serialport.buffer;
            data.date = new Date().getTime();
            successFunc(data);
			serialport.buffer = null;
		}else{
			if(device.type == "Classical"){
				device.rfcommRead(successFunc,errorFunc);
			}else if(device.type == "BLE"){
	            if(!serialport.buffer){
	               successFunc(null);
	            }
	            var data = {};
	            data.value = serialport.buffer;
	            data.date = new Date().getTime();
	            successFunc(data);
				serialport.buffer = null;
			}
		}
	},
	
	write : function(device,writeType,writeValue,successFunc,errorFunc){
		if(API == "ios" && serialport.role == serialport.SLAVE){
			serialport.service.getCharacteristicByUUID(serialport.readcharUUID)[0].notify(writeType,writeValue,successFunc,errorFunc);
		}else{
			if(device.type == "Classical"){
				device.rfcommWrite(writeType,writeValue,successFunc,errorFunc);
			}else if(device.type == "BLE"){
				device.discoverServices(function(){
					var service = device.getServiceByUUID(serialport.serviceUUID)[0];
					service.write(writeType,writeValue,successFunc,errorFunc);
				});
			}
		}
	},
	
	subscribe : function(device,callback){
        if(API == "ios" && serialport.role == serialport.SLAVE){
            serialport.subscribeCallback = callback;
        }else{
            if(device.type == "Classical"){
               device.rfcommSubscribe(callback);
            }else if(device.type == "BLE"){
               if(serialport.role == "Master"){
               		serialport.subscribeCallback = callback;
               }
            }
        }
	},
	
	unsubscribe : function(device){
        if(API == "ios" && serialport.role == serialport.SLAVE){
            serialport.subscribeCallback = null;
        }else{
            if(device.type == "Classical"){
                device.rfcommUnsubscribe();
            }else if(device.type == "BLE"){
                if(serialport.role == "Master"){
                   serialport.subscribeCallback = null;
                }
            }
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
			var readcharacter = new BC.Characteristic({uuid:serialport.readcharUUID,value:"",type:"Hex",property:readcharproperty,permission:readcharpermission});
			readcharacter.addEventListener("oncharacteristicread",function(s){});

			var writecharpermission = ["write"];
			var writecharproperty = ["write"];
			var writecharacter = new BC.Characteristic({uuid:serialport.writecharUUID,value:"01",type:"Hex",property:writecharproperty,permission:writecharpermission});
			writecharacter.addEventListener("oncharacteristicwrite",function(s){
                var data = {};
                data.value = s.writeValue;
                data.date = new Date().getTime();
				serialport.processRcvDataCallback(data);
			});

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