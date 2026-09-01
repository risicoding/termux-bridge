import { TermuxBridge } from ".";

export type TermuxBridgeTypes = {
  Battery: {
    BatteryStatus: TermuxBridge.Battery.BatteryStatus;
    BatteryError: TermuxBridge.Battery.BatteryError;
  };

  Notification: {
    Notification: TermuxBridge.Notification.Notification;
    NotificationProps: TermuxBridge.Notification.NotificationProps;
    NotificationError: TermuxBridge.Notification.NotificationError;
  };

  Sms: {
    Sms: TermuxBridge.Sms.Sms;
    SmsError: TermuxBridge.Sms.SmsError;
  };

  CallLog: {
    CallLog: TermuxBridge.CallLog.CallLog;
    CallLogError: TermuxBridge.CallLog.CallLogError;
  };

  Clipboard: {
    Clipboard: TermuxBridge.Clipboard.Clipboard;
    ClipboardError: TermuxBridge.Clipboard.ClipboardError;
  };
};
