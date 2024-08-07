import { SHIPPING_STATUS } from '@/api/backend/configs.data';

export const statusColor = (status: SHIPPING_STATUS['value']) => {
  switch (status) {
    case SHIPPING_STATUS.enum('SubmitAppraisalStatus'):
      return 'primary';
    case SHIPPING_STATUS.enum('ProcessingStatus'):
      return 'info';
    case SHIPPING_STATUS.enum('ShippedStatus'):
      return 'default';
    default:
      return 'default';
  }
};
