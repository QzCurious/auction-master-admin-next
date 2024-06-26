import { ADMIN_STATUS_MAP, type ADMIN_STATUS_DATA } from '@/api/backend/configs.data';

export const statusColor = (status: (typeof ADMIN_STATUS_DATA)[number]['value']) => {
  switch (status) {
    case ADMIN_STATUS_MAP.EnabledStatus:
      return 'success';
    case ADMIN_STATUS_MAP.DisabledStatus:
      return 'error';
    default:
      return 'default';
  }
};
