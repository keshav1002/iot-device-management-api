declare module 'devices' {
  namespace Devices {
    interface Device {
      DeviceId: string
      DeviceName: string
      DeviceLocation: string
    }
    interface DeviceId {
      deviceId: string
    }
  }
}
