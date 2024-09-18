import { type PERMISSIONS_DATA } from './permissions.data';

export type PermissionKey = (typeof PERMISSIONS_DATA)[number]['permissions'][number]['key'];
export type PermissionKeyField = {
  [k in PermissionKey]: { key: k; field: Array<string> };
}[PermissionKey];
