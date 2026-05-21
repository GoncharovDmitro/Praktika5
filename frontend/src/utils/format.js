export function formatPrice(price) {
  return new Intl.NumberFormat('uk-UA').format(price) + ' грн'
}

export function getCategoryName(category) {
  const map = {
    CPU: 'Процесори',
    GPU: 'Відеокарти',
    RAM: 'Оперативна пам\u02bcять',
    'накопичувачі': 'Накопичувачі',
  }
  return map[category] || category
}

export function getCategoryIcon(category) {
  const map = { CPU: '⚡', GPU: '🎮', RAM: '💾', 'накопичувачі': '💿' }
  return map[category] || '📦'
}
