'use strict';

var bccoredevControllers = angular.module('bccoredevControllers',[]);

bccoredevControllers.controller('DeviceListCtrl',["$scope",'$location',function($scope,$location){
	$scope.switchScanItem = false;
	if(typeof(BC) != 'undefined' && BC.bluetooth){
		$scope.devices = BC.bluetooth.devices;
	}else{
		document.addEventListener("bcready",function(){
			$scope.devices = BC.bluetooth.devices;
		},false);
	}
	setInterval(function(){$scope.$apply();},500);

	$scope.switchScan = function(){
		if($scope.switchScanItem){
			BC.bluetooth.startScan();
		}else{
			BC.bluetooth.stopScan();
		}
	};
	
	$scope.switchClassicalScan = function(){
		if($scope.switchClassicalScanItem){
			BC.bluetooth.startClassicalScan();
		}else{
			BC.bluetooth.stopClassicalScan();
		}
	};
	
	$scope.switchHybridScan = function(){
		if($scope.switchHybridScanItem){
			BC.Bluetooth.StartScan();
		}else{
			BC.Bluetooth.StopScan();
		}
	};

	$scope.changePage = function(deviceAddress){
		//for classical interface debug
		/*if(BC.bluetooth.devices[deviceAddress].type == "BLE"){
			return $location.path("\/service_list\/"+deviceAddress);
		}else if(BC.bluetooth.devices[deviceAddress].type == "Classical"){
			return $location.path("\/classical_operation\/"+deviceAddress);
		}*/
		
		//for serial port debug
		$location.path("\/serial_port_operation\/"+deviceAddress);
	};
	
}]);

bccoredevControllers.controller('ServiceListCtrl',['$scope','$location','$routeParams',
	function($scope,$location,$routeParams){
		BC.Bluetooth.StopScan();
		var deviceAddress = $routeParams.deviceAddress;
		var device = BC.bluetooth.devices[deviceAddress];
		$scope.showAdvData = function(){
			alert(JSON.stringify(device.advertisementData));
			if(device.advertisementData.manufacturerData){
				var manufacturerData = device.advertisementData.manufacturerData;
				alert("ManufacturerData(Hex):" + manufacturerData.getHexString()+"\n"+
				  "ManufacturerData(ASCII):" + manufacturerData.getASCIIString()+"\n"+
				  "ManufacturerData(Unicode):" + manufacturerData.getUnicodeString());
			}
		}
	    if(!device.isConnected){
	    	device.connect(function(){
	    		device.discoverServices(function(){
	    			$scope.services = device.services;
	    		},function(){});
	    	},function(){});
	    }else{
    		device.discoverServices(function(){
    			$scope.services = device.services;
    		},function(){});
	    }
	    //setInterval(function(){$scope.$apply();},100);
	    $scope.changePage = function(deviceAddress,serviceIndex){
	    	return $location.path("\/char_list\/"+deviceAddress+"\/"+serviceIndex);
	    }
	}
]);

bccoredevControllers.controller('CharListCtrl',['$scope','$location','$routeParams',
	function($scope,$location,$routeParams){
		var deviceAddress = $routeParams.deviceAddress;
		var serviceIndex = $routeParams.serviceIndex;
		var device = BC.bluetooth.devices[deviceAddress];
		var service = device.services[serviceIndex];
		service.discoverCharacteristics(function(){
    		$scope.characteristics = service.characteristics;
    	},function(){
    		alert("discoverCharacteristicsFailed");
    	});

	    //setInterval(function(){$scope.$apply();},100);
	    $scope.changePage = function(deviceAddress,serviceIndex,characteristicIndex){
	    	return $location.path("\/operate_char\/"+deviceAddress+"\/"+serviceIndex+"\/"+characteristicIndex);
	    }
	}
]);

bccoredevControllers.controller('OperateCharCtrl',['$scope','$routeParams',
	function($scope,$routeParams){
		var deviceAddress = $routeParams.deviceAddress;
		var serviceIndex = $routeParams.serviceIndex;
		var characteristicIndex = $routeParams.characteristicIndex;
		var device = BC.bluetooth.devices[deviceAddress];
		var service = device.services[serviceIndex];
		$scope.characteristic = service.characteristics[characteristicIndex];

	    if($scope.characteristic.property.contains('write') || $scope.characteristic.property.contains("writeWithoutResponse")){
	    	$scope.writeView = true;
	    }

	    if($scope.characteristic.property.contains('read')){
	    	$scope.readView = true;
	    }

	    if($scope.characteristic.property.contains('notify')){
	    	$scope.subscribeView=true;
	    }

	    $scope.write = function(){
	    	if($scope.writeValue){
		    	$scope.characteristic.write('hex',$scope.writeValue,function(){
		    		alert('writeSuccess');
		    	},function(){
		    		alert('writeFailed');
		    	});
	    	}
	    }

	    $scope.read = function(){
	    	$scope.characteristic.read(function(chardata){
	    		alert('hexString : '+chardata.value.getHexString()+"\n"+
                'asciiString : '+chardata.value.getASCIIString()+"\n"+
                'unicodeString : '+chardata.value.getUnicodeString()+"\n"+
                'date : '+chardata.date);
	    	},function(){
	    		alert('readFailed');
	    	});
	    }

		$scope.subscribe = function(){
	    	$scope.subscribeValueView = true;
	    	$scope.characteristic.subscribe(function(data){
	    		$scope.hexString = data.value.getHexString();
                $scope.unicodeString = data.value.getUnicodeString();
                $scope.asciiString = data.value.getASCIIString();
                $scope.date = data.date;
	    	},function(){
	    		alert('subscribeFailed');
	    	});
	    }

	    $scope.unsubscribe = function(){
	    	$scope.subscribeValueView = false;
	    	$scope.hexString = '';
            $scope.unicodeString = '';
            $scope.asciiString = '';
            $scope.date = '';
	    	$scope.characteristic.unsubscribe(function(){alert("unsubscribe success!");});
	    }

	    setInterval(function(){$scope.$apply();},100);
	}
]);

bccoredevControllers.controller('DescListCtrl',['$scope','$routeParams',
	function($scope,$routeParams){
		var deviceAddress = $routeParams.deviceAddress;
		var serviceIndex = $routeParams.serviceIndex;
		var characteristicIndex = $routeParams.characteristicIndex;
		var device = BC.bluetooth.devices[deviceAddress];
		var service = device.services[serviceIndex];
		var characteristic = service.characteristics[characteristicIndex];

		characteristic.discoverDescriptors(function(){
    		$scope.descriptors = characteristic.descriptors;
    	},function(){
    		alert("discoverDescriptorsFailed");
    	});
	    setInterval(function(){$scope.$apply();},100);
	}
]);

bccoredevControllers.controller('ClassicalOperationCtrl',['$scope','$location','$routeParams',
	function($scope,$location,$routeParams){
		var device = BC.bluetooth.devices[$routeParams.deviceAddress];
		device.addEventListener("devicedisconnected",function(){
			alert("Peer device connection is lost.");
			$scope.connect_button_show = true;
			$scope.disconnect_button_show = false;
		});
		
		if(device.isConnected == true){
			$scope.disconnect_button_show = true;
		}else{
			$scope.connect_button_show = true;
		}
		
		$scope.rfcommConnect = function(){
			device.connect(function(){
				$scope.connect_button_show = false;
				$scope.disconnect_button_show = true;
			},function(){
				alert("connect failed!");
			},"7A9C3B55-78D0-44A7-A94E-A93E3FE118CE",true);
		}
		$scope.rfcommDisconnect = function(){
			device.rfcommDisconnect(function(){
				$scope.connect_button_show = true;
				$scope.disconnect_button_show = false;
			});
		}
		$scope.write = function(){
			if($scope.writeValue){
				device.rfcommWrite("ascii",$scope.writeValue,function(){alert("classical write success!")});
			}
		}
		$scope.read = function(){
			device.rfcommRead(function(data){alert("classical read success! Data: " + data.value.getASCIIString());});
		}
		$scope.subscribe = function(){
	    	device.rfcommSubscribe(function(data){alert(JSON.stringify(data.value.getASCIIString()));});
	    }
	    
	    $scope.rfcommListen = function(){
			BC.Bluetooth.RFCOMMListen("listenName","7A9C3B55-78D0-44A7-A94E-A93E3FE118CE",true);
			alert("rfcomm listen start successfully.");
		};
	}
]);

bccoredevControllers.controller('SerialPortOperationCtrl',['$scope','$location','$routeParams',
	function($scope,$location,$routeParams){
		var device = BC.bluetooth.devices[$routeParams.deviceAddress];
		device.addEventListener("devicedisconnected",function(){
			alert("Peer device connection is lost.");
			$scope.connect_button_show = true;
			$scope.disconnect_button_show = false;
		});
		
		if(device.isConnected == true){
			$scope.disconnect_button_show = true;
		}else{
			$scope.connect_button_show = true;
		}
		
		$scope.subscribe_button_show = true;
		$scope.listen_button_show = true;
		
		$scope.connect = function(){
			BC.SerialPort.connect(device,function(){
				$scope.connect_button_show = false;
				$scope.disconnect_button_show = true;
			},function(){
				alert("connect failed!");
			},"7A9C3B55-78D0-44A7-A94E-A93E3FE118CE",true);
		}
		$scope.disconnect = function(){
			device.disconnect(function(){
				$scope.connect_button_show = true;
				$scope.disconnect_button_show = false;
			});
		}
		$scope.write = function(){
			if($scope.writeValue){
				BC.SerialPort.write(device,"ascii",$scope.writeValue,function(){alert("serial port write success!")});
			}else{
				alert("There is nothing to write.");
			}
		}
		$scope.read = function(){
			BC.SerialPort.read(device,function(data){
                if(data){
					alert("read success! Data: " + data.value.getASCIIString());
                }else{
                    alert("no data");
                }
			});
			
		}
		$scope.subscribe = function(){
			BC.SerialPort.subscribe(device,function(data){
                alert(data.value.getASCIIString());
            });
			$scope.subscribe_button_show = false;
			$scope.unsubscribe_button_show = true;
	    }
	    $scope.unsubscribe = function(){
			BC.SerialPort.unsubscribe(device);
			$scope.unsubscribe_button_show = false;
			$scope.subscribe_button_show = true;
	    }
	    $scope.listen = function(){
			BC.SerialPort.listen("listenName","7A9C3B55-78D0-44A7-A94E-A93E3FE118CE",true);
			$scope.listen_button_show = false;
			$scope.unlisten_button_show = true;
		}
		$scope.unlisten = function(){
			BC.SerialPort.unlisten("listenName","7A9C3B55-78D0-44A7-A94E-A93E3FE118CE");
			$scope.listen_button_show = true;
			$scope.unlisten_button_show = false;
		}
		
	}
]);