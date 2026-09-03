import { ResultAsync } from "neverthrow";
import * as CoreModules from "@termux-bridge/core";
import { AppError } from "@termux-bridge/error";
import ky, { type KyInstance } from "ky";

// import {
//   Battery,
//   type Notification,
//   type CallLog,
//   type Sms,
//   type Clipboard,
// } from "@termux-bridge/core/types";

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
    status: () =>
      api.get("battery").json(CoreModules.Battery.BatteryStatusSchema),
  },
  clipboard: {
    get: () => api.get("clipboard").json(CoreModules.Clipboard.ClipboardSchema),
  },
  sms: {
    get: () => api.get("sms").json(CoreModules.Sms.SmsListSchema),
  },
  callLog: {
    get: () => api.get("call").json(CoreModules.CallLog.CallLogListSchema),
  },
  notification: {
    list: () =>
      api
        .get("notification/list")
        .json(CoreModules.Notification.NotificationListSchema),
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
