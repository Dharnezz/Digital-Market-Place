const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.538-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.05 9.385c-.783-.57-.38-1.81.587-1.81H6.8a1 1 0 00.95-.69l1.3-3.957z'

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

export default function RatingStars({ value = 0, size = 'md', readOnly, onChange }) {
  const isReadOnly = readOnly || !onChange
  const starClass = SIZES[size] || SIZES.md
  const stars = [1, 2, 3, 4, 5]

  if (isReadOnly) {
    return (
      <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5 stars`}>
        {stars.map((star) => (
          <svg
            key={star}
            className={`${starClass} ${star <= value ? 'text-amber-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d={STAR_PATH} />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Star rating">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          className={`${starClass} ${star <= value ? 'text-amber-400' : 'text-gray-300'} transition-colors hover:scale-110 hover:text-amber-500`}
        >
          <svg className="h-full w-full" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  )
}