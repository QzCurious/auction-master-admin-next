import { CONSIGNOR_STATUS } from '@/domain/static/static-config-mappers';

export const statusColor = (status: CONSIGNOR_STATUS['value']) => {
  switch (status) {
    case CONSIGNOR_STATUS.enum('EnabledStatus'):
      return 'success';
    case CONSIGNOR_STATUS.enum('DisabledStatus'):
      return 'error';
    case CONSIGNOR_STATUS.enum('AwaitingVerificationCompletionStatus'):
      return 'warning';
    default:
      return 'default';
  }
};
