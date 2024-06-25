import { CONSIGNOR_STATUS_MAP, type CONSIGNOR_STATUS_DATA } from '@/api/backend/configs.data';

export const statusColor = (status: (typeof CONSIGNOR_STATUS_DATA)[number]['value']) => {
  switch (status) {
    case CONSIGNOR_STATUS_MAP.EnabledStatus:
      return 'success';
    case CONSIGNOR_STATUS_MAP.DisabledStatus:
      return 'error';
    case CONSIGNOR_STATUS_MAP.AwaitingVerificationCompletionStatus:
      return 'warning';
    default:
      return 'default';
  }
};
