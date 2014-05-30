'use strict';

var obandtestControllers = angular.module('obandtestControllers',[]);

obandtestControllers.controller('DeviceListCtrl',["$scope",'$location',function($scope,$location){
	$scope.switchOBandScanItem = false;
	if(BC.oBandManager){
		$scope.obands = BC.oBandManager.obands;
	}else{
		document.addEventListener("bcready",function(){
			$scope.obands = BC.oBandManager.obands;
		},false);
	}
	setInterval(function(){$scope.$apply();},500);

	$scope.switchOBandScan = function(){
		if($scope.switchOBandScanItem){
			BC.OBandManager.StartOBandScan();
		}else{
			BC.OBandManager.StopOBandScan();
		}
	};

	$scope.changePage = function(deviceAddress){
		$location.path("\/oband_operation\/"+deviceAddress);
	};
	
}]);

obandtestControllers.controller('OBandOperationCtrl',['$scope','$location','$routeParams',
	function($scope,$location,$routeParams){
		$scope.subscribe_button_show = true;
		$scope.listen_button_show = true;
		var oband = BC.oBandManager.obands[$routeParams.deviceAddress];
		oband.addEventListener("devicedisconnected",function(){
			alert("OBand connection is lost.");
			$scope.connect_button_show = true;
			$scope.disconnect_button_show = false;
		});
		
		if(oband.isConnected == true){
			$scope.disconnect_button_show = true;
		}else{
			$scope.connect_button_show = true;
		}
		
		$scope.connect = function(){
			oband.oBandConnect(function(){
				$scope.connect_button_show = false;
				$scope.disconnect_button_show = true;
			});
		}
		$scope.disconnect = function(){
			oband.disconnect(function(){
				$scope.connect_button_show = true;
				$scope.disconnect_button_show = false;
			});
		}
		$scope.get_device_info = function(){
			oband.get_device_info();
		}
		$scope.set_user_info = function(){
			oband.set_user_info();
		}
		$scope.set_parameter = function(){
			oband.set_parameter();
	    }	
	    $scope.get_sport_data = function(){
			oband.get_sport_data();
	    }
	    $scope.set_time = function(){
			oband.set_time();
		}
		$scope.format_device = function(){
			oband.format_device();
		}
		$scope.get_sport_daily_recoder = function(){
			oband.get_sport_daily_recoder();
		}
	}
]);