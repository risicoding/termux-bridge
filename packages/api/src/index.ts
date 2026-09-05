import { ResultAsync } from "neverthrow";
import {
  BatteryStatusSchema,
  ClipboardSchema,
  CallLogListSchema,
  NotificationListSchema,
  SmsListSchema,
} from "@termux-bridge/core/schema";
import { AppError } from "@termux-bridge/error";
import ky, { type KyInstance } from "ky";

const createKy = (ip: string, port = 6734) =>
  ky.create({
    baseUrl: `http://${ip}:${port}/api/v0/`,
    parseJson: (text) => {
      const res = JSON.parse(text);
      return res.data;
    },
  });

const apiMethods = (api: KyInstance) => ({
  battery: {
    status: () => api.get("battery").json(BatteryStatusSchema),
  },
  clipboard: {
    get: () => api.get("clipboard").json(ClipboardSchema),
  },
  sms: {
    get: () => api.get("sms").json(SmsListSchema),
  },
  callLog: {
    get: () => api.get("call").json(CallLogListSchema),
  },
  notification: {
    list: () => api.get("notification/list").json(NotificationListSchema),
  },
});

const API = (ip: string, port = 6734) => {
  const api = createKy(ip, port);

  return apiMethods(api);
};

class APIError extends AppError {
  tag = "APIError";
}

const safeAPICall = <T>(func: Promise<T>, message = "api errorred") => {
  return ResultAsync.fromPromise(func, (e) => new APIError(message, e));
};

const safeAPI = (ip: string, port = 6734) => {
  const api = createKy(ip, port);

  const apiM = apiMethods(api);
  return {
    battery: {
      status: safeAPICall(apiM.battery.status(), "cant get battery status"),
    },
    clipboard: {
      get: safeAPICall(apiM.clipboard.get(), "cant get clipboard"),
    },
    sms: {
      get: safeAPICall(apiM.sms.get(), "cant get sms"),
    },
    callLog: {
      get: safeAPICall(apiM.callLog.get(), "cant get call log"),
    },
    notification: {
      list: safeAPICall(apiM.notification.list(), "cant get notification"),
    },
  };
};

export { API, safeAPI, APIError };
