import z from "zod";

export const BatteryStatusSchema = z.object({
  health: z.string(),
  percentage: z.number(),
  plugged: z.string(),
  status: z.enum(["CHARGING", "DISCHARGING"]),
  temperature: z.number(),
  current: z.number(),
  voltage: z.number(),
  technology: z.string(),
  cycle_count: z.number().optional(),
});

export type BatteryStatus = z.infer<typeof BatteryStatusSchema>;

export const NotificationSchema = z.object({
  id: z.number(),
  tag: z.string(),
  key: z.string(),
  group: z.string(),
  packageName: z.string(),
  title: z.string(),
  content: z.string(),
  when: z.string().transform((value) => new Date(value.replace(" ", "T"))),
});

export const NotificationListSchema = z.array(NotificationSchema);

export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationPropsSchema = z.object({
  action: z.string().optional(),

  alertOnce: z.boolean().optional(),

  button1: z.string().optional(),
  button1Action: z.string().optional(),

  button2: z.string().optional(),
  button2Action: z.string().optional(),

  button3: z.string().optional(),
  button3Action: z.string().optional(),

  content: z.string().optional(),

  channel: z.string().optional(),
  group: z.string().optional(),

  id: z.number().int().optional(),

  icon: z.string().optional(),
  imagePath: z.string().optional(),

  ledColor: z.string().optional(),
  ledOff: z.number().int().nonnegative().optional(),
  ledOn: z.number().int().nonnegative().optional(),

  onDelete: z.string().optional(),

  ongoing: z.boolean().optional(),

  priority: z.enum(["high", "low", "max", "min", "default"]).optional(),

  sound: z.boolean().optional(),

  title: z.string().optional(),

  vibrate: z.string().optional(),

  type: z.enum(["default", "media"]).optional(),

  mediaNext: z.boolean().optional(),
  mediaPause: z.boolean().optional(),
});

export type NotificationProps = z.infer<typeof NotificationPropsSchema>;

export const ClipboardSchema = z.string();

export type Clipboard = z.infer<typeof ClipboardSchema>;

export const SmsSchema = z.object({
  threadid: z.number(),
  type: z.string(),
  read: z.boolean(),
  address: z.string(),
  number: z.string(),
  received: z.string().transform((value, ctx) => {
    const date = new Date(value.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid date",
      });

      return z.NEVER;
    }

    return date;
  }),
  body: z.string(),
  _id: z.number(),
});

export const SmsListSchema = z.array(SmsSchema);

export type Sms = z.infer<typeof SmsSchema>;

export const CallLogSchema = z.object({
  name: z.string(),
  phone_number: z.string(),
  type: z.string(),
  date: z.string().transform((value, ctx) => {
    const date = new Date(value.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid date",
      });

      return z.NEVER;
    }

    return date;
  }),
  duration: z.string(),
  sim_id: z.string(),
});

export const CallLogListSchema = z.array(CallLogSchema);

export type CallLog = z.infer<typeof CallLogSchema>;
