import { SHIPPING_STATUS_MAP, type SHIPPING_STATUS_DATA } from '@/api/backend/configs.data';

export const statusColor = (status: (typeof SHIPPING_STATUS_DATA)[number]['value']) => {
  switch (status) {
    case SHIPPING_STATUS_MAP.SubmitAppraisalStatus:
      return 'primary';
    case SHIPPING_STATUS_MAP.ProcessingStatus:
      return 'info';
    case SHIPPING_STATUS_MAP.ShippedStatus:
      return 'default';
    default:
      return 'default';
  }
};
