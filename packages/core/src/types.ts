import { Battery as BatteryModule } from "./modules/battery";
import { Notification as NotificationModule } from "./modules/notification";
import { Clipboard as ClipboardModule } from "./modules/clipboard";
import { Sms as SmsModule } from "./modules/sms";
import { CallLog as CallLogModule } from "./modules/call";

type BatteryStatus = BatteryModule.BatteryStatus;
type Notification = NotificationModule.Notification;
type NotificationProps = NotificationModule.NotificationProps;
type Clipboard = ClipboardModule.Clipboard;
type Sms = SmsModule.Sms;
type CallLog = CallLogModule.CallLog;

export type {
  BatteryStatus,
  Notification,
  NotificationProps,
  Clipboard,
  Sms,
  CallLog,
};
