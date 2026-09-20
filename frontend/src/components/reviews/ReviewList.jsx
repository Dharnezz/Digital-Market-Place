import { formatDate } from '../../utils/format'
import EmptyState from '../ui/EmptyState'
import RatingStars from './RatingStars'

export default function ReviewList({ reviews, currentUserId, onEdit, onDelete }) {
  if (reviews.length === 0) {
    return (
      <EmptyState title="No reviews yet" message="Purchasers can leave a review after buying this product." />
    )
  }

  return (
    <ul className="divide-y divide-gray-200">
      {reviews.map((review) => {
        const isMine = review.userId === currentUserId
        return (
          <li key={review.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-gray-900">{review.userName}</p>
                <RatingStars value={review.rating} size="sm" readOnly />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                {isMine ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit(review)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(review)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </>
                ) : null}
              </div>
            </div>
            {review.comment ? (
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{review.comment}</p>
            ) : (
              <p className="mt-2 text-sm italic text-gray-400">No written comment.</p>
            )}
          </li>
        )
      })}
    </ul>
  )
}