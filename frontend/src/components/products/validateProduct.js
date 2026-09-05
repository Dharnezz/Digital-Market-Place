export function validateProduct({ title, categoryId, description = '', price }) {
  const errors = {}

  const trimmedTitle = String(title ?? '').trim()
  if (!trimmedTitle) {
    errors.title = 'Title is required'
  } else if (trimmedTitle.length > 200) {
    errors.title = 'Title must be at most 200 characters'
  }

  if (!categoryId && categoryId !== 0) {
    errors.categoryId = 'Category is required'
  }

  const priceString = price === null || price === undefined ? '' : String(price).trim()
  if (priceString === '') {
    errors.price = 'Price is required'
  } else if (Number.isNaN(Number(priceString))) {
    errors.price = 'Price must be a valid number'
  } else if (Number(priceString) < 0) {
    errors.price = 'Price must not be negative'
  } else {
    const [integerPart, fractionPart] = priceString.split('.')
    if (integerPart.replace(/-/g, '').length > 10) {
      errors.price = 'Price must have at most 10 integer digits'
    } else if (fractionPart && fractionPart.length > 2) {
      errors.price = 'Price must have at most 2 decimal places'
    }
  }

  const trimmedDescription = String(description ?? '').trim()
  if (trimmedDescription.length > 10000) {
    errors.description = 'Description must be at most 10000 characters'
  }

  return {
    errors,
    values: {
      title: trimmedTitle,
      categoryId: Number(categoryId),
      description: trimmedDescription,
      price: Number(priceString),
    },
  }
}