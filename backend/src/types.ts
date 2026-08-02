// Field names mirror the columns in the official vehicle-registration export
// (رقم اللوحة, الماركة, الطراز, ...). Everything except plateNumber/model is
// optional so both full official exports and quick manual entries work.
export interface Vehicle {
  id: string;
  plateNumber: string; // رقم اللوحة
  model: string; // الطراز
  brand?: string; // الماركة
  registrationType?: string; // نوع التسجيل
  branch?: string; // الفرع
  manufactureYear?: string; // سنة الصنع
  serialNumber?: string; // الرقم التسلسلي
  chassisNumber?: string; // رقم الهيكل
  color?: string; // اللون الأساسي
  status?: string; // وضع المركبة
  ownershipDate?: string; // تاريخ الملكية
  licenseExpiryDate?: string; // تاريخ انتهاء رخصة السير
  inspectionExpiryDate?: string; // تاريخ انتهاء الفحص
  actualUserId?: string; // رقم هوية المستخدم الفعلي
  actualUserName?: string; // اسم المستخدم الفعلي
  inspectionStatus?: string; // حالة الفحص
  insuranceStatus?: string; // حالة التأمين
  holdStatus?: string; // حالة التحفظ
  formIssueDate?: string; // تاريخ إصدار الاستمارة
  chassisType?: string; // نوع الهيكل
  costCenter?: string; // مركز التكلفة
  assetNumber?: string; // رقم الأصل
  assignedDriverId?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string; // ISO date
  status: "active" | "inactive";
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: string; // ISO datetime
  endTime?: string; // ISO datetime
  startLocation: string;
  endLocation?: string;
  distanceKm?: number;
  fuelCost?: number;
}

export type UserRole = "admin" | "driver" | "maintenance";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // plaintext for demo only — hash in production
  role: UserRole;
}
