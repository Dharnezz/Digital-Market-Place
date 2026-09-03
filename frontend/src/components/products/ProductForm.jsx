import { useState } from 'react'
import ErrorState from '../ui/ErrorState'

const inputClassName =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

function FieldError({ message }) {
  return message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null
}

export default function ProductForm({ categories, initialValues, mode, onSubmit, submitting, error }) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [price, setPrice] = useState(initialValues?.price ?? '')
  const [validationErrors, setValidationErrors] = useState({})

  const isEdit = mode === 'edit'
  const submitLabel = isEdit ? (submitting ? 'Saving…' : 'Save Changes') : submitting ? 'Creating…' : 'Create Product'

  const validate = () => {
    const errors = {}
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      errors.title = 'Title is required'
    } else if (trimmedTitle.length > 200) {
      errors.title = 'Title must be at most 200 characters'
    }
    if (!categoryId) {
      errors.categoryId = 'Category is required'
    }
    const numericPrice = Number(price)
    if (price === '' || price === null) {
      errors.price = 'Price is required'
    } else if (Number.isNaN(numericPrice) || numericPrice < 0) {
      errors.price = 'Price must not be negative'
    }
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validate()
    setValidationErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }
    onSubmit({
      title: title.trim(),
      categoryId: Number(categoryId),
      description: description.trim(),
      price: Number(price),
    })
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
          className={inputClassName}
        />
        <FieldError message={validationErrors.title} />
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
        <FieldError message={validationErrors.categoryId} />
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
          className={inputClassName}
        />
        <FieldError message={validationErrors.price} />
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

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  )
}