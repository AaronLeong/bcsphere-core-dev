cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.bcsphere.bluetooth/www/bluetooth.js",
        "id": "org.bcsphere.bluetooth.bluetooth",
        "merges": [
            "navigator.bluetooth"
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
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.bcsphere.bluetooth": "0.3.0",
    "org.bcsphere.bleprofiles": "0.1.0"
}
// BOTTOM OF METADATA
});