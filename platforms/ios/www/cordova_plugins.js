cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.bcsphere.wifi/www/wifi.js",
        "id": "org.bcsphere.wifi.wifi",
        "merges": [
            "navigator.wifi"
        ]
    },
    {
        "file": "plugins/org.bcsphere.ibeacon/www/ibeacon.js",
        "id": "org.bcsphere.ibeacon.ibeacon",
        "merges": [
            "navigator.ibeacon"
        ]
    },
    {
        "file": "plugins/com.megster.cordova.bluetoothserial/www/bluetoothSerial.js",
        "id": "com.megster.cordova.bluetoothserial.bluetoothSerial",
        "clobbers": [
            "window.bluetoothSerial"
        ]
    },
    {
        "file": "plugins/org.bcsphere.bleprofiles/www/findme.js",
        "id": "org.bcsphere.bleprofiles.findme",
        "merges": [
            "BC.Findme"
        ]
    },
    {
        "file": "plugins/org.bcsphere.bleprofiles/www/proximity.js",
        "id": "org.bcsphere.bleprofiles.proximity",
        "merges": [
            "BC.Proximity"
        ]
    },
    {
        "file": "plugins/org.bcsphere.bleprofiles/www/serialport.js",
        "id": "org.bcsphere.bleprofiles.serialport",
        "merges": [
            "BC.SerialPort"
        ]
    },
    {
        "file": "plugins/org.bcsphere.bluetooth/www/bluetooth.js",
        "id": "org.bcsphere.bluetooth.bluetooth",
        "merges": [
            "navigator.bluetooth"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.bcsphere.wifi": "0.0.1",
    "org.bcsphere.ibeacon": "0.1.0",
    "com.megster.cordova.bluetoothserial": "0.3.0",
    "org.bcsphere.bleprofiles": "0.1.0",
    "org.bcsphere.bluetooth": "0.3.0"
}
// BOTTOM OF METADATA
});