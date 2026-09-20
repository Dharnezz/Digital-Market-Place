import { useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorState from '../ui/ErrorState'
import FlashMessage from '../ui/FlashMessage'
import ConfirmDialog from '../ui/ConfirmDialog'
import ReviewList from './ReviewList'
import ReviewForm from './ReviewForm'

export default function ReviewsSection({
  loading,
  error,
  onRetry,
  reviews,
  currentUserId,
  isUser,
  hasPurchased,
  alreadyReviewed,
  formState,
  formBusy,
  flash,
  onDismissFlash,
  onStartCreate,
  onCancelForm,
  onStartEdit,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const creating = formState === 'create'
  const editingReview = formState && formState !== 'create' ? formState : null
  const showCreateButton = isUser && hasPurchased && !alreadyReviewed && !creating && !editingReview

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget)
    }
    setDeleteTarget(null)
  }

  return (
    <section
      aria-labelledby="reviews-heading"
      className="mt-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="reviews-heading" className="text-xl font-bold text-gray-900">
          Reviews
          {!loading && !error ? (
            <span className="ml-2 align-middle text-sm font-normal text-gray-400">({reviews.length})</span>
          ) : null}
        </h2>
        {showCreateButton ? (
          <button
            type="button"
            onClick={onStartCreate}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Write a review
          </button>
        ) : null}
      </div>

      {flash ? (
        <div className="mt-4">
          <FlashMessage title={flash.title} message={flash.message} tone={flash.tone} onDismiss={onDismissFlash} />
        </div>
      ) : null}

      <div className="mt-4">
        {loading ? (
          <LoadingSpinner label="Loading reviews..." />
        ) : error ? (
          <ErrorState title="Could not load reviews" message={error} onRetry={onRetry} />
        ) : (
          <ReviewList reviews={reviews} currentUserId={currentUserId} onEdit={onStartEdit} onDelete={setDeleteTarget} />
        )}
      </div>

      {!loading && !error ? (
        <>
          {creating && isUser && hasPurchased ? (
            <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4">
              <ReviewForm
                title="Write a review"
                submitLabel={formBusy ? 'Submitting...' : 'Submit review'}
                busy={formBusy}
                onSubmit={onCreate}
                onCancel={onCancelForm}
              />
            </div>
          ) : null}
          {editingReview ? (
            <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4">
              <ReviewForm
                title="Edit your review"
                submitLabel={formBusy ? 'Saving...' : 'Save changes'}
                busy={formBusy}
                initialRating={editingReview.rating}
                initialComment={editingReview.comment || ''}
                onSubmit={onUpdate}
                onCancel={onCancelForm}
              />
            </div>
          ) : null}
          {!creating && !editingReview ? (
            !isUser ? (
              <p className="mt-5 text-sm text-gray-500">
                Sign in as a buyer who has purchased this product to leave a review.
              </p>
            ) : !hasPurchased ? (
              <p className="mt-5 text-sm text-gray-500">
                Purchase this product to leave a review.
              </p>
            ) : (
              <p className="mt-5 text-sm text-gray-600">
                You have already reviewed this product. You can edit or delete your review.
              </p>
            )
          ) : null}
        </>
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete review?"
        message="Your review will be permanently removed. This action cannot be undone."
        confirmLabel="Delete review"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}