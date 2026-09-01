const STATUS_STYLES = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-800 text-gray-100',
}

const STATUS_LABELS = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
}

const STATUS_DOTS = {
  DRAFT: 'bg-gray-400',
  PENDING_APPROVAL: 'bg-amber-500',
  APPROVED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
  ARCHIVED: 'bg-gray-700',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status] || 'bg-gray-400'}`} />
      {STATUS_LABELS[status] || status}
    </span>
  )
}