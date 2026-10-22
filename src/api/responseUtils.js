export async function readResponse(response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  return response.text()
}

export function getErrorMessage(data, fallbackMessage) {
  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data?.message) {
    return data.message
  }

  if (data && typeof data === 'object') {
    const values = Object.values(data).filter(Boolean)

    if (values.length > 0) {
      return values.join(', ')
    }
  }

  return fallbackMessage
}
