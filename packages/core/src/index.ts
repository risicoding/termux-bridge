import { Battery as BatteryModule } from "./modules/battery";
import { Notification as NotificationModule } from "./modules/notification";
import { Clipboard as ClipboardModule } from "./modules/clipboard";
import { Sms as SmsModule } from "./modules/sms";
import { CallLog as CallLogModule } from "./modules/call";
import {} from "@/lib/utils";

export namespace TermuxBridge {
  export import Battery = BatteryModule;
  export import Notification = NotificationModule;
  export import Sms = SmsModule;
  export import CallLog = CallLogModule;
  export import Clipboard = ClipboardModule;
}
