export function useCategoryColor() {
  const badgeColors = [
    'badge-blue', 'badge-purple', 'badge-green', 'badge-yellow', 'badge-red',
    'badge-pink', 'badge-cyan', 'badge-orange', 'badge-indigo', 'badge-teal'
  ]

  function getCategoryBadgeClass(idOrName) {
    if (!idOrName) return 'badge-gray'
    const str = String(idOrName)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return badgeColors[Math.abs(hash) % badgeColors.length]
  }

  return {
    getCategoryBadgeClass
  }
}
