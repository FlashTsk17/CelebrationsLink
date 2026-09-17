export function getAbsoluteUrl(path) {
  return new URL(path, window.location.origin).toString()
}

export async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return true
  }

  const area = document.createElement('textarea')
  area.value = value
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const copied = document.execCommand('copy')
  area.remove()
  return copied
}

export async function shareLink({ title, text, url }) {
  if (!navigator.share) return false
  await navigator.share({ title, text, url })
  return true
}
