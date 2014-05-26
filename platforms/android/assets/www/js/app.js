var bccoredevApp = angular.module('bccoredev',[
	'ngTouch',
	'ngRoute',
	'bccoredevControllers',
	'onsen.directives'
]);

bccoredevApp.config(['$routeProvider',
	function($routeProvider){
	  $routeProvider.
		when('/device_list',{
			templateUrl: 'device_list.html',
			controller: 'DeviceListCtrl'
		}).
		when('/service_list/:deviceAddress',{
			templateUrl: 'service_list.html',
			controller: 'ServiceListCtrl'
		}).
		when('/char_list/:deviceAddress/:serviceIndex',{
			templateUrl: 'char_list.html',
			controller: 'CharListCtrl'
		}).
		when('/operate_char/:deviceAddress/:serviceIndex/:characteristicIndex',{
			templateUrl: 'operate_char.html',
			controller: 'OperateCharCtrl'
		}).
		when('/desc_list/:deviceAddress/:serviceIndex/:characteristicIndex',{
			templateUrl: 'desc_list.html',
			controller: 'DescListCtrl'
		}).
		when('/classical_operation/:deviceAddress',{
			templateUrl: 'classical_operation.html',
			controller: 'ClassicalOperationCtrl'
		}).
		when('/serial_port_operation/:deviceAddress',{
			templateUrl: 'serial_port_operation.html',
			controller: 'SerialPortOperationCtrl'
		}).
		otherwise({
			redirectTo: '/device_list'
		});
	}
]);