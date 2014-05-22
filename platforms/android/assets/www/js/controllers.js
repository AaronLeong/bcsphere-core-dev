'use strict';

var bccoredevControllers = angular.module('bccoredevControllers',[]);

bccoredevControllers.controller('DeviceListCtrl',["$scope",'$location',function($scope,$location){

	$scope.switchScanItem = false;
	if(BC.bluetooth){
		$scope.devices = BC.bluetooth.devices;
	}else{
		document.addEventListener("bcready",function(){
			$scope.devices = BC.bluetooth.devices;
		},false);
	}
	setInterval(function(){$scope.$apply();},100);

	$scope.switchScan = function(){
		if($scope.switchScanItem){
			BC.Bluetooth.StartScan();
		}else{
			BC.Bluetooth.StopScan();
		}
	};
	
	$scope.switchClassicalScan = function(){
		if($scope.switchClassicalScanItem){
			BC.Bluetooth.StartClassicalScan();
		}else{
			BC.Bluetooth.StopClassicalScan();
		}
	};

	$scope.changePage = function(deviceAddress){
		if(BC.bluetooth.devices[deviceAddress].type == "BLE"){
			return $location.path("\/service_list\/"+deviceAddress);
		}else if(BC.bluetooth.devices[deviceAddress].type == "Classical"){
			return $location.path("\/classical_operation\/"+deviceAddress);
		}
	};
	
	$scope.rfcommListen = function(){
		BC.Bluetooth.RFCOMMListen("listenName","7A9C3B55-78D0-44A7-A94E-A93E3FE118CE",true);
		alert("rfcomm listen start successfully.");
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
		
		if(device.isConnected == true){
			$scope.disconnect_button_show = true;
		}else{
			$scope.connect_button_show = true;
		}
		
		$scope.classicalConnect = function(){
			device.classicalConnect("7A9C3B55-78D0-44A7-A94E-A93E3FE118CE",true,function(){
				$scope.connect_button_show = false;
				$scope.disconnect_button_show = true;
			},function(){
				alert("connect failed!");
			});
		}
		$scope.classicalDisconnect = function(){
			device.classicalDisconnect(function(){
				$scope.connect_button_show = true;
				$scope.disconnect_button_show = false;
			});
		}
		$scope.write = function(){
			if($scope.writeValue){
				device.classicalWrite("ascii",$scope.writeValue,function(){alert("classical write success!")});
			}
		}
		$scope.read = function(){
			device.classicalRead(function(data){alert("classical read success! Data: " + data);});
		}
		$scope.subscribe = function(){
	    	device.subscribe(function(data){alert(JSON.stringify(data.value.toString()));});
	    }
	}
]);