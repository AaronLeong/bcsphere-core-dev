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
    "org.bcsphere.ibeacon": "0.0.1",
    "org.bcsphere.bluetooth": "0.2.1"
}
// BOTTOM OF METADATA
});