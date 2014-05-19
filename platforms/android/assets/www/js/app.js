var bccoredevApp = angular.module('bccoredev',[
	'ngTouch',
	'ngRoute',
	'bccoredevControllers'
]);

bccoredevApp.config(['$routeProvider',
	function($routeProvider){
	  $routeProvider.
		when('/devices',{
			templateUrl: 'device_list.html',
			controller: 'DeviceListCtrl'
		}).
		when('/devices/:deviceAddress',{
			templateUrl: 'device_detail.html',
			controller: 'DeviceDetailCtrl'
		}).
		otherwise({
			redirectTo: '/devices'
		});
	}
]);