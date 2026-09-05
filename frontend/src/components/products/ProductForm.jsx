import { useState } from 'react'
import ErrorState from '../ui/ErrorState'
import { validateProduct } from './validateProduct'

const inputClassName =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

function FieldError({ id, message }) {
  return message ? (
    <p id={id} className="mt-1 text-xs text-red-600">
      {message}
    </p>
  ) : null
}

export default function ProductForm({
  categories,
  initialValues,
  mode,
  onSubmit,
  onSaveAndSubmit,
  busy,
  error,
  canSaveAndSubmit = false,
}) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [price, setPrice] = useState(initialValues?.price ?? '')
  const [validationErrors, setValidationErrors] = useState({})

  const isEdit = mode === 'edit'
  const isBusy = Boolean(busy)

  const primaryLabel = isEdit
    ? busy === 'save'
      ? 'Saving…'
      : 'Save Changes'
    : busy === 'save'
      ? 'Creating…'
      : 'Create Product'

  const handleSubmit = (event, flow = 'save') => {
    event.preventDefault()
    if (isBusy) {
      return
    }
    const { errors, values } = validateProduct({ title, categoryId, description, price })
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    if (flow === 'approval' && onSaveAndSubmit) {
      onSaveAndSubmit(values)
    } else {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {error ? <ErrorState message={error} /> : null}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(validationErrors.title)}
          aria-describedby={validationErrors.title ? 'title-error' : undefined}
          className={inputClassName}
        />
        <FieldError id="title-error" message={validationErrors.title} />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="categoryId"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-invalid={Boolean(validationErrors.categoryId)}
          aria-describedby={validationErrors.categoryId ? 'categoryId-error' : undefined}
          className={`${inputClassName} bg-white`}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldError id="categoryId-error" message={validationErrors.categoryId} />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (USD)
        </label>
        <input
          id="price"
          type="number"
          required
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          aria-invalid={Boolean(validationErrors.price)}
          aria-describedby={validationErrors.price ? 'price-error' : undefined}
          className={inputClassName}
        />
        <FieldError id="price-error" message={validationErrors.price} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          maxLength={10000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClassName}
        />
        <p className="mt-1 text-xs text-gray-400">Optional. Provide details about your digital product.</p>
      </div>

      {canSaveAndSubmit ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={isBusy}
            onClick={(event) => handleSubmit(event, 'approval')}
            className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
          >
            {busy === 'approval' ? 'Saving & submitting…' : 'Save & Submit for Approval'}
          </button>
          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 sm:w-auto"
          >
            {isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {primaryLabel}
        </button>
      )}
    </form>
  )
}