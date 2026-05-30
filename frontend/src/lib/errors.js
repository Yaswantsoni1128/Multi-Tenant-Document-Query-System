/** Extract a human-readable message from FastAPI / fetch error payloads. */
export function parseApiError(data, fallback = 'Something went wrong') {
  if (!data) return fallback
  if (typeof data === 'string') return data

  const detail = data.detail ?? data.message ?? data.error
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || item.message || JSON.stringify(item))
      .join('. ')
  }
  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || fallback
  }
  return fallback
}

export async function readJsonResponse(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}
