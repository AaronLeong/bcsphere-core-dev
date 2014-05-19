'use strict';

var bccoredevControllers = angular.module('bccoredevControllers',[]);

bccoredevControllers.controller('DeviceListCtrl',["$scope",function($scope){
	$scope.switchScanItem = '0';
	if(BC.bluetooth){
		$scope.devices = BC.bluetooth.devices;
	}else{
		document.addEventListener("bcready",function(){
			$scope.devices = BC.bluetooth.devices;
		},false);
	}
	setInterval(function(){$scope.$apply();},100);

	$scope.switchScan = function(){
		if($scope.switchScanItem == 1){
			BC.Bluetooth.StartScan();
		}else{
			BC.Bluetooth.StopScan();
		}
	};
}]);

bccoredevControllers.controller('DeviceDetailCtrl',['$scope','$routeParams',
	function($scope,$routeParams){
		var deviceAddress = $routeParams.deviceAddress;
		$scope.showAdvData = function(){
			var device = BC.bluetooth.devices[deviceAddress];
			alert(JSON.stringify(device.advertisementData));
			if(device.advertisementData.manufacturerData){
				var manufacturerData = device.advertisementData.manufacturerData;
				alert("ManufacturerData(Hex):" + manufacturerData.getHexString()+"\n"+
				  "ManufacturerData(ASCII):" + manufacturerData.getASCIIString()+"\n"+
				  "ManufacturerData(Unicode):" + manufacturerData.getUnicodeString());
			}
		}
	}
]);