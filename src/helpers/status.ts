import {
  APPROVAL_STATUS_APPROVED,
  APPROVAL_STATUS_DRAFT,
  APPROVAL_STATUS_REJECTED,
  APPROVAL_STATUS_WAITING,
} from '@/constants';
import { ApprovalStatus } from '@/types';

export const getStatus = (status: ApprovalStatus): { value: string; severity: string } => {
  switch (status) {
    case APPROVAL_STATUS_DRAFT:
      return { value: 'Draf', severity: 'info' };
    case APPROVAL_STATUS_APPROVED:
      return { value: 'Disetujui', severity: 'success' };
    case APPROVAL_STATUS_WAITING:
      return { value: 'Menunggu', severity: 'warning' };
    case APPROVAL_STATUS_REJECTED:
      return { value: 'Ditolak', severity: 'danger' };
    default:
      return { value: 'Draf', severity: 'info' };
  }
};
