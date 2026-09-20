import { useState } from 'react'
import RatingStars from './RatingStars'

export default function ReviewForm({
  title,
  initialRating = null,
  initialComment = '',
  submitLabel = 'Submit review',
  busy = false,
  onSubmit,
  onCancel,
}) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [validation, setValidation] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (rating === null) {
      setValidation('Please select a rating between 1 and 5 stars.')
      return
    }
    if (comment.length > 10000) {
      setValidation('Your comment must be at most 10000 characters.')
      return
    }
    setValidation(null)
    onSubmit(rating, comment)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <fieldset className="mt-3">
        <legend className="sr-only">Star rating</legend>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Your rating</span>
          <RatingStars value={rating} onChange={setRating} />
        </div>
      </fieldset>
      <div className="mt-3">
        <label htmlFor="review-comment" className="sr-only">
          Comment
        </label>
        <textarea
          id="review-comment"
          rows="3"
          value={comment}
          maxLength={10000}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you like or dislike about this product?"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      {validation ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {validation}
        </p>
      ) : null}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}