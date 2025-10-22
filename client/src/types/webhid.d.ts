interface HIDDevice {
  productName: string;
  vendorId: number;
  productId: number;
  opened: boolean;
  open(): Promise<void>;
  close(): Promise<void>;
  sendReport(reportId: number, data: BufferSource): Promise<void>;
  addEventListener(
    type: "inputreport",
    listener: (event: HIDInputReportEvent) => void
  ): void;
  removeEventListener(
    type: "inputreport",
    listener: (event: HIDInputReportEvent) => void
  ): void;
}

interface HIDInputReportEvent extends Event {
  device: HIDDevice;
  reportId: number;
  data: DataView;
}

interface HIDDeviceFilter {
  vendorId?: number;
  productId?: number;
  usagePage?: number;
  usage?: number;
}

interface HID extends EventTarget {
  getDevices(): Promise<HIDDevice[]>;
  requestDevice(options: { filters: HIDDeviceFilter[] }): Promise<HIDDevice[]>;
  addEventListener(
    type: "connect" | "disconnect",
    listener: (event: Event) => void
  ): void;
}

interface Navigator {
  hid: HID;
}
