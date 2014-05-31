(function(){

	function isOBand(device){
		return device.advertisementData.localName == "OBand";
	};
	
	var OBandManager = BC.OBandManager = BC.Plugin.extend({
	
		pluginInitialize : function(){
			this.obands = {};
		},
		
	});
	
	var StartOBandScan = BC.OBandManager.StartOBandScan = function(){
		BC.Bluetooth.StartScan("LE");
		BC.bluetooth.addEventListener("newdevice",function(event){
			var newDevice = event.target;
			if(isOBand(newDevice)){
				var newOBand = new BC.OBand({
					deviceAddress : newDevice.deviceAddress,
					type : newDevice.type,
					deviceName : newDevice.deviceName,
					advertisementData : newDevice.advertisementData,
					isConnected : newDevice.isConnected
				});
				//register the OBand device into bluetooth.devices, replace the raw device.
				BC.bluetooth.devices[newDevice.deviceAddress] = newOBand;
				BC.oBandManager.obands[newDevice.deviceAddress] = newOBand;
				BC.oBandManager.dispatchEvent("newoband",newOBand);
			}
		});
	};
	
	var StopOBandScan = BC.OBandManager.StopOBandScan = function(){
		BC.Bluetooth.StopScan();
	};
	
	var OBand = BC.OBand = BC.Device.extend({
		
		serviceUUID : "fee7",
		writeUUID : "fec7",
		indicateUUID : "fec8",
	
		deviceInitialize : function(arg){
			
		},
		
		messageProccessor : function(data){
			alert(data.value.getHexString());
		},
		
		oBandConnect : function(success,error){
			this.connect(function(){
				this.prepare(function(){
					var character = this.getServiceByUUID(this.serviceUUID)[0].getCharacteristicByUUID(this.indicateUUID)[0];
					character.subscribe(this.messageProccessor);
					success();
				},function(){
					error();
					alert("prepare error!");
				});
			},function(){
				alert("connect error!");
			});
		},
	
		get_device_info : function(){
			if(this.isPrepared){
				var character = this.getServiceByUUID(this.serviceUUID)[0].getCharacteristicByUUID(this.writeUUID)[0];
				if(character){
					character.write("Hex","AF00141300000000000000000000000000000000",function(){
						alert("write success!");
					},function(){
						
					});
				}
			}else{
				alert("please connect your OBand first!");
			}
		},
		
		set_user_info : function(){
			alert("set_user_info");
		},
		
		set_parameter : function(){
			alert("set_parameter");
		},
				
		get_sport_data : function(){
			alert("get_sport_data");
		},
				
		set_time : function(){
			alert("set_time");
		},
				
		format_device : function(){
			alert("format_device");
		},
				
		get_sport_daily_recoder : function(){
			alert("get_sport_daily_recoder");
		},
		
	});
	
	document.addEventListener('bccoreready', onBCCoreReady, false);
	
	function onBCCoreReady(){
		var eventName = "obandReady";
		var	oBandManager = BC.oBandManager = new BC.OBandManager("oband",eventName);
		BC.bluetooth.dispatchEvent(eventName);
	}
	
})();