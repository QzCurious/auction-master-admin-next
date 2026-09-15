import { type PermissionKey, type PermissionKeyField } from './types';

export type Permissions = Partial<Record<PermissionKey, { fields: Array<string> }>>;
export type RequiredPermissions = ReadonlyArray<PermissionKey | PermissionKeyField>;

export function evaluatePermissions(userPermissions: Permissions | null | undefined, required: RequiredPermissions) {
  return required.every((permission) => {
    const key = typeof permission === 'string' ? permission : permission.key;
    if (!userPermissions || !Object.prototype.hasOwnProperty.call(userPermissions, key)) return false;
    const granted = userPermissions[key];
    if (!granted) return false;
    return typeof permission === 'string' || permission.fields.every((field) => granted.fields.includes(field));
  });
}
