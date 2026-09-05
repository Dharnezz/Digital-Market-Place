export const STATUS_LABELS = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
}

export const STATUS_HELP = {
  PENDING_APPROVAL: 'This product is currently under review.',
  REJECTED: 'Edit then resubmit for approval.',
}

export const statusLabel = (status) => STATUS_LABELS[status] ?? status

export function productActions(status) {
  switch (status) {
    case 'DRAFT':
      return { canEdit: true, canSubmit: true, canArchive: true, canView: false }
    case 'PENDING_APPROVAL':
      return { canEdit: false, canSubmit: false, canArchive: true, canView: false }
    case 'APPROVED':
      return { canEdit: true, canSubmit: false, canArchive: true, canView: true }
    case 'REJECTED':
      return { canEdit: true, canSubmit: true, canArchive: true, canView: false }
    case 'ARCHIVED':
      return { canEdit: false, canSubmit: false, canArchive: false, canView: false }
    default:
      return { canEdit: false, canSubmit: false, canArchive: false, canView: false }
  }
}

export const statusHelp = (status) => STATUS_HELP[status] ?? null