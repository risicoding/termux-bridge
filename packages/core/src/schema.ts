import { TermuxBridge } from ".";

export const TermuxBridgeSchema = {
  Notification: {
    NotificationSchema: TermuxBridge.Notification.NotificationSchema,
    NotificationPropsSchema: TermuxBridge.Notification.NotificationPropsSchema,
    NotificationListSchema: TermuxBridge.Notification.NotificationListSchema,
  },
  Battery: {
    BatteryStatusSchema: TermuxBridge.Battery.BatteryStatusSchema,
  },

  Sms: {
    SmsSchema: TermuxBridge.Sms.SmsSchema,
    SmsListSchema: TermuxBridge.Sms.SmsListSchema,
  },
  CallLog: {
    CallLogSchema: TermuxBridge.CallLog.CallLogSchema,
    CallLogListSchema: TermuxBridge.CallLog.CallLogListSchema,
  },
  Clipboard: {
    ClipboardSchema: TermuxBridge.Clipboard.ClipboardSchema,
  },
};
