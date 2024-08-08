import { ADMIN_STATUS } from '@/api/backend/static-configs.data';

export const statusColor = (status: ADMIN_STATUS['value']) => {
  switch (status) {
    case ADMIN_STATUS.enum('EnabledStatus'):
      return 'success';
    case ADMIN_STATUS.enum('DisabledStatus'):
      return 'error';
    default:
      return 'default';
  }
};
