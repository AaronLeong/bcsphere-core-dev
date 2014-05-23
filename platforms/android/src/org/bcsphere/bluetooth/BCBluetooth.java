/*
	Copyright 2013-2014, JUMA Technology

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
 */
package org.bcsphere.bluetooth;

import java.nio.ByteBuffer;
import java.util.UUID;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import org.bcsphere.bluetooth.tools.BluetoothDetection;
import org.bcsphere.bluetooth.tools.Tools;

public class BCBluetooth extends CordovaPlugin {

	public Context myContext = null;
	private SharedPreferences sp;
	private boolean isSetContext = true;
	private IBluetooth bluetoothAPI = null;
	private String versionOfAPI;
	private CallbackContext newadvpacketContext;
	private BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
	
    public static final int MESSAGE_STATE_CHANGE = 1;
    public static final int MESSAGE_READ = 2;
    public static final int MESSAGE_WRITE = 3;
    public static final int MESSAGE_DEVICE_NAME = 4;
    public static final int MESSAGE_TOAST = 5;
    
    public static final String TOAST = "toast";
    
    private CallbackContext connectCallback;
    private CallbackContext dataAvailableCallback;
    
    private BluetoothSerialService bluetoothSerialService;
    
    ByteBuffer buffer = ByteBuffer.allocate(2048);
    
    int bufferSize = 0;

	public BCBluetooth() {
	}

	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {

		super.initialize(cordova, webView);
		myContext = this.webView.getContext();
		IntentFilter intentFilter = new IntentFilter();
		intentFilter.addAction(BluetoothAdapter.ACTION_STATE_CHANGED);
		intentFilter.addAction(BluetoothDevice.ACTION_FOUND);
		myContext.registerReceiver(receiver, intentFilter);
		sp = myContext.getSharedPreferences("VERSION_OF_API", 1);
		BluetoothDetection.detectionBluetoothAPI(myContext);
		try {
			if ((versionOfAPI = sp.getString("API", "no_google"))
					.equals("google")) {
				bluetoothAPI = (IBluetooth) Class.forName(
						"org.bcsphere.bluetooth.BluetoothG43plus")
						.newInstance();
			} else if ((versionOfAPI = sp.getString("API", "no_samsung"))
					.equals("samsung")) {
				bluetoothAPI = (IBluetooth) Class.forName(
						"org.bcsphere.bluetooth.BluetoothSam42").newInstance();
			} else if ((versionOfAPI = sp.getString("API", "no_htc"))
					.equals("htc")) {
				bluetoothAPI = (IBluetooth) Class.forName(
						"org.bcsphere.bluetooth.BluetoothHTC41").newInstance();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public boolean execute(final String action, final JSONArray json,
			final CallbackContext callbackContext) throws JSONException {
		
        if (bluetoothSerialService == null) {
            bluetoothSerialService = new BluetoothSerialService(mHandler);
        }

		if (action.equals("addEventListener")) {
			String eventName = Tools.getData(json, Tools.EVENT_NAME);
			if (eventName.equals("newadvpacket") ) {
				newadvpacketContext = callbackContext;
			}
			bluetoothAPI.addEventListener(json, callbackContext);
			return true;
		}
		if (isSetContext) {
			try {
				bluetoothAPI.setContext(myContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
			isSetContext = false;
		}
		if (action.equals("getEnvironment")) {
			JSONObject jo = new JSONObject();
			Tools.addProperty(jo, "appID", "com.test.yourappid");
			Tools.addProperty(jo, "deviceAddress", "N/A");
			Tools.addProperty(jo, "api", versionOfAPI);
			callbackContext.success(jo);
			return true;
		}
		if (action.equals("openBluetooth")) {
			try {
				bluetoothAPI.openBluetooth(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
			return true;
		}
		if (action.equals("getBluetoothState")) {
			try {
				bluetoothAPI.getBluetoothState(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
			return true;
		}
		if(action.equals("startClassicalScan")){
			System.out.println("startClassicalScan");
			if(bluetoothAdapter.isEnabled()){
				if(bluetoothAdapter.startDiscovery()){
					callbackContext.success();
				}else{
					callbackContext.error("start classical scan error!");
				}
			}else{
				callbackContext.error("your bluetooth is not open!");
			}
		}
		if(action.equals("stopClassicalScan")){
			System.out.println("stopClassicalScan");
			if(bluetoothAdapter.isEnabled()){
				if(bluetoothAdapter.cancelDiscovery()){
					callbackContext.success();
				}else{
					callbackContext.error("stop classical scan error!");
				}
			}else{
				callbackContext.error("your bluetooth is not open!");
			}
		}
		if(action.equals("classicalConnect")){
			connect(json, callbackContext);
		}
		if (action.equals("classicalDisconnect")) {
            connectCallback = null;
            bluetoothSerialService.stop();
            callbackContext.success();
        }
		if(action.equals("rfcommListen")){
			String name = Tools.getData(json, Tools.NAME);
			String uuidstr = Tools.getData(json, Tools.UUID);
	    	String securestr = Tools.getData(json, Tools.SECURE);
	    	boolean secure = false;
	    	if(securestr.equals("true")){
	    		secure = true;
	    	}
			bluetoothSerialService.listen(name, uuidstr, secure);
		}
		if(action.equals("classicalWrite")){
			String data = Tools.getData(json, Tools.WRITE_VALUE);
			bluetoothSerialService.write(Tools.decodeBase64(data));
			callbackContext.success();
		}
		if(action.equals("classicalRead")){
			byte[] data = new byte[2048];
			byte[] predata = buffer.array();
			for(int i = 0;i < bufferSize;i++){
				data[i] = predata[i];
			}
			
	        JSONObject obj = new JSONObject();
			//Tools.addProperty(obj, Tools.DEVICE_ADDRESS, deviceAddress);
			Tools.addProperty(obj, Tools.VALUE, Tools.encodeBase64(data));
			Tools.addProperty(obj, Tools.DATE, Tools.getDateString());
			callbackContext.success(obj);
			bufferSize = 0;
			buffer.clear();
		}
		if(action.equals("classicalSubscribe")){
            dataAvailableCallback = callbackContext;
		}
		if (!Tools.isOpenBluetooth()) {
			Tools.sendErrorMsg(callbackContext);
			return false;
		}
		if (action.equals("stopScan")) {
			try {
				bluetoothAPI.stopScan(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
		} else if (action.equals("getConnectedDevices")) {
			try {
				bluetoothAPI.getConnectedDevices(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
		} else if (action.equals("getPairedDevices")) {
			try {
				bluetoothAPI.getPairedDevices(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
		} else if (action.equals("createPair")) {
			try {
				bluetoothAPI.createPair(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
		} else if (action.equals("removePair")) {
			try {
				bluetoothAPI.removePair(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
		} else if (action.equals("getCharacteristics")) {
			try {
				bluetoothAPI.getCharacteristics(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
		} else if (action.equals("getDescriptors")) {
			try {
				bluetoothAPI.getDescriptors(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
		} else if (action.equals("removeServices")) {
			try {
				bluetoothAPI.removeServices(json, callbackContext);
			} catch (Exception e) {
				Tools.sendErrorMsg(callbackContext);
			} catch (java.lang.Error e) {
				Tools.sendErrorMsg(callbackContext);
			}
		}
		
		cordova.getThreadPool().execute(new Runnable() {
			@Override
			public void run() {
				if (action.equals("startScan")) {
					try {
						bluetoothAPI.startScan(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}
				} else if (action.equals("connect")) {

					try {
						bluetoothAPI.connect(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}

				} else if (action.equals("disconnect")) {

					try {
						bluetoothAPI.disconnect(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}

				} else if (action.equals("getServices")) {

					try {
						bluetoothAPI.getServices(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}

				} else if (action.equals("writeValue")) {

					try {
						bluetoothAPI.writeValue(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}

				} else if (action.equals("readValue")) {

					try {
						bluetoothAPI.readValue(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}

				} else if (action.equals("setNotification")) {
					try {
						bluetoothAPI.setNotification(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}
				} else if (action.equals("getDeviceAllData")) {
					try {
						bluetoothAPI.getDeviceAllData(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}
				} else if (action.equals("addServices")) {
					try {
						bluetoothAPI.addServices(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}
				} else if (action.equals("getRSSI")) {
					try {
						bluetoothAPI.getRSSI(json, callbackContext);
					} catch (Exception e) {
						Tools.sendErrorMsg(callbackContext);
					} catch (java.lang.Error e) {
						Tools.sendErrorMsg(callbackContext);
					}
				}
			}
		});
		return true;
	}

	public BroadcastReceiver receiver = new BroadcastReceiver() {

		@Override
		public void onReceive(Context context, Intent intent) {
			if (intent.getIntExtra(BluetoothAdapter.EXTRA_PREVIOUS_STATE, -1) == 11) {
				JSONObject joOpen = new JSONObject();
				try {
					joOpen.put("state", "open");
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				webView.sendJavascript("cordova.fireDocumentEvent('bluetoothopen')");
			} else if (intent.getIntExtra(
					BluetoothAdapter.EXTRA_PREVIOUS_STATE, -1) == 13) {
				JSONObject joClose = new JSONObject();
				try {
					joClose.put("state", "close");
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				webView.sendJavascript("cordova.fireDocumentEvent('bluetoothclose')");
			}else if(BluetoothDevice.ACTION_FOUND.equals(intent.getAction())) {
				
	            // Get the BluetoothDevice object from the Intent
	            BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
	            System.out.println("new classical bluetooth device found!"+device.getAddress());
	            // Add the name and address to an array adapter to show in a ListView
	    		JSONObject obj = new JSONObject();
	    		Tools.addProperty(obj, Tools.DEVICE_ADDRESS, device.getAddress());
	    		Tools.addProperty(obj, Tools.DEVICE_NAME, device.getName());
	    		Tools.addProperty(obj, Tools.IS_CONNECTED, Tools.IS_FALSE);
	    		Tools.addProperty(obj, Tools.TYPE, "Classical");
	    		PluginResult pluginResult = new PluginResult(PluginResult.Status.OK , obj);
	    		pluginResult.setKeepCallback(true);
	    		newadvpacketContext.sendPluginResult(pluginResult);
	        }
		}
	};
	
    private void connect(JSONArray json, CallbackContext callbackContext) throws JSONException {
    	String deviceAddress = Tools.getData(json, Tools.DEVICE_ADDRESS);
    	String securestr = Tools.getData(json, Tools.SECURE);
    	String uuidstr = Tools.getData(json, Tools.UUID);
    	boolean secure = false;
    	if(securestr.equals("true")){
    		secure = true;
    	}
    	System.out.println("connect to "+deviceAddress);
        BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceAddress);

        if (device != null) {
            connectCallback = callbackContext;
            bluetoothSerialService.connect(device,uuidstr,secure);
        } else {
            callbackContext.error("Could not connect to " + deviceAddress);
        }
    }

    private final Handler mHandler = new Handler() {

        public void handleMessage(Message msg) {
            switch (msg.what) {
                case MESSAGE_READ:
                	
                   if (dataAvailableCallback != null) {
                       sendDataToSubscriber((byte[])msg.obj);
                   }else{
                	   byte[] data = (byte[])msg.obj;
                	   buffer.put(data);
                	   bufferSize = bufferSize + data.length;
                   }
                   break;
                case MESSAGE_STATE_CHANGE:

                   //if(D) Log.i(TAG, "MESSAGE_STATE_CHANGE: " + msg.arg1);
                   switch (msg.arg1) {
                       case BluetoothSerialService.STATE_CONNECTED:
                           Log.i("BluetoothSerial", "BluetoothSerialService.STATE_CONNECTED");
                           notifyConnectionSuccess();
                           break;
                       case BluetoothSerialService.STATE_CONNECTING:
                           Log.i("BluetoothSerial", "BluetoothSerialService.STATE_CONNECTING");
                           break;
                       case BluetoothSerialService.STATE_LISTEN:
                           Log.i("BluetoothSerial", "BluetoothSerialService.STATE_LISTEN");
                           break;
                       case BluetoothSerialService.STATE_NONE:
                           Log.i("BluetoothSerial", "BluetoothSerialService.STATE_NONE");
                           break;
                   }
                   break;
               case MESSAGE_WRITE:
                   //  byte[] writeBuf = (byte[]) msg.obj;
                   //  String writeMessage = new String(writeBuf);
                   //  Log.i(TAG, "Wrote: " + writeMessage);
                   break;
               case MESSAGE_DEVICE_NAME:
                   //Log.i(TAG, msg.getData().getString(DEVICE_NAME));
                   break;
               case MESSAGE_TOAST:
                   String message = msg.getData().getString(TOAST);
                   notifyConnectionLost(message);
                   break;
            }
        }
   };
   
   private void notifyConnectionSuccess() {
       if (connectCallback != null) {
           PluginResult result = new PluginResult(PluginResult.Status.OK);
           result.setKeepCallback(true);
           connectCallback.sendPluginResult(result);
       }
   }
   private void notifyConnectionLost(String error) {
       if (connectCallback != null) {
           connectCallback.error(error);
           connectCallback = null;
       }
   }
   private void sendDataToSubscriber(byte[] data) {
       if (data != null) {
    	   JSONObject obj = new JSONObject();
    	   //Tools.addProperty(obj, Tools.DEVICE_ADDRESS, deviceAddress);
    	   Tools.addProperty(obj, Tools.VALUE, Tools.encodeBase64(data));
    	   Tools.addProperty(obj, Tools.DATE, Tools.getDateString());
           PluginResult result = new PluginResult(PluginResult.Status.OK, obj);
           result.setKeepCallback(true);
           dataAvailableCallback.sendPluginResult(result);
       }
   }
}
