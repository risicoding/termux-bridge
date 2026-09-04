@termux-bridge/core

Type-safe APIs for interacting with Android through Termux:API.

import {
Battery,
Notification,
Clipboard,
Sms,
CallLog,
} from "@termux-bridge/core";

All asynchronous APIs return "ResultAsync" from "neverthrow".

All data received from Termux:API is validated with the corresponding Zod schema before it is returned. A successful result therefore contains already-validated data.

---

Battery

Provides device battery information.

"Battery.status()"

const result = await Battery.status();

Returns:

ResultAsync<BatteryStatus, BatteryError>

type BatteryStatus = {
health: string;
percentage: number;
plugged: string;
status: "CHARGING" | "DISCHARGING";
temperature: number;
current: number;
voltage: number;
technology: string;
cycle_count?: number;
};

Schema:

Battery.BatteryStatusSchema

Error:

Battery.BatteryError
// tag: "BatteryError"

Example:

const result = await Battery.status();

result.match(
(battery) => console.log(battery.percentage),
(error) => console.error(error),
);

---

Notification

Provides access to Android notifications and Termux notifications.

"Notification.list()"

Returns active notifications.

const result = await Notification.list();

Returns:

ResultAsync<Notification[], NotificationError>

type Notification = {
id: number;
tag: string;
key: string;
group: string;
packageName: string;
title: string;
content: string;
when: Date;
};

The "when" value is converted from the Termux timestamp to a JavaScript "Date".

Schemas:

Notification.NotificationSchema
Notification.NotificationListSchema

Error:

Notification.NotificationError
// tag: "NotificationError"

"Notification.notification(props)"

Creates a notification.

const result = await Notification.notification({
title: "Build complete",
content: "Your project finished building.",
});

Returns:

ResultAsync<void, NotificationError>

Input:

type NotificationProps = {
action?: string;
alertOnce?: boolean;

button1?: string;
button1Action?: string;
button2?: string;
button2Action?: string;
button3?: string;
button3Action?: string;

content?: string;
channel?: string;
group?: string;
id?: number;
icon?: string;
imagePath?: string;

ledColor?: string;
ledOff?: number;
ledOn?: number;

onDelete?: string;
ongoing?: boolean;

priority?: "default" | "high" | "low" | "max" | "min";

sound?: boolean;
title?: string;
vibrate?: string;

type?: "default" | "media";
mediaNext?: boolean;
mediaPause?: boolean;
};

Schema:

Notification.NotificationPropsSchema

---

Clipboard

Provides access to the Android clipboard.

"Clipboard.getClipboard()"

const result = await Clipboard.getClipboard();

Returns:

ResultAsync<string, ClipboardError>

"Clipboard.setClipboard(text)"

const result = await Clipboard.setClipboard("Hello");

Returns:

ResultAsync<void, ClipboardError>

Schema:

Clipboard.ClipboardSchema

Error:

Clipboard.ClipboardError
// tag: "ClipboardError"

Example:

const result = await Clipboard.getClipboard();

result.match(
(text) => console.log(text),
(error) => console.error(error),
);

---

Sms

Provides access to SMS messages.

"Sms.list()"

const result = await Sms.list();

Returns:

ResultAsync<Sms[], SmsError>

type Sms = {
threadid: number;
type: string;
read: boolean;
address: string;
number: string;
received: Date;
body: string;
\_id: number;
};

The "received" value is converted from the Termux timestamp to a JavaScript "Date".

Schemas:

Sms.SmsSchema
Sms.SmsListSchema

Error:

Sms.SmsError
// tag: "SmsError"

---

CallLog

Provides access to the device call history.

"CallLog.log()"

const result = await CallLog.log();

Returns:

ResultAsync<CallLog[], CallLogError>

type CallLog = {
name: string;
phone_number: string;
type: string;
date: Date;
duration: string;
sim_id: string;
};

The "date" value is converted from the Termux timestamp to a JavaScript "Date".

Schemas:

CallLog.CallLogSchema
CallLog.CallLogListSchema

Error:

CallLog.CallLogError
// tag: "CallLogError"

---

Error handling

Every API uses "ResultAsync<T, E>".

const result = await Battery.status();

if (result.isOk()) {
console.log(result.value);
} else {
console.error(result.error);
}

Or use "match()":

const result = await Battery.status();

result.match(
(battery) => console.log(battery),
(error) => console.error(error),
);

Errors are namespace-specific:

Battery.status()
// ResultAsync<BatteryStatus, BatteryError>

Notification.list()
// ResultAsync<Notification[], NotificationError>

Notification.notification(...)
// ResultAsync<void, NotificationError>

Clipboard.getClipboard()
// ResultAsync<string, ClipboardError>

Clipboard.setClipboard(...)
// ResultAsync<void, ClipboardError>

Sms.list()
// ResultAsync<Sms[], SmsError>

CallLog.log()
// ResultAsync<CallLog[], CallLogError>

---

Runtime validation

Termux:API output is external data, so every response is validated with Zod before being returned.

Termux:API
↓
raw output
↓
Zod validation
↓
ResultAsync
↓
validated TypeScript value

For example:

const result = await Battery.status();

result.match(
(battery) => {
// Already validated by Battery.BatteryStatusSchema
console.log(battery.percentage);
},
(error) => {
// Includes command and validation failures
console.error(error);
},
);

Consumers normally do not need to parse successful results again.

The schemas are exported for cases where applications need to perform their own validation or compose schemas:

Battery.BatteryStatusSchema
Notification.NotificationSchema
Notification.NotificationListSchema
Notification.NotificationPropsSchema
Clipboard.ClipboardSchema
Sms.SmsSchema
Sms.SmsListSchema
CallLog.CallLogSchema
CallLog.CallLogListSchema

---

API summary

Namespace| Method| Result
"Battery"| "status()"| "BatteryStatus"
"Notification"| "list()"| "Notification[]"
"Notification"| "notification(props)"| "void"
"Clipboard"| "getClipboard()"| "string"
"Clipboard"| "setClipboard(text)"| "void"
"Sms"| "list()"| "Sms[]"
"CallLog"| "log()"| "CallLog[]"

All methods return "ResultAsync" and validate external data before returning successful results.
