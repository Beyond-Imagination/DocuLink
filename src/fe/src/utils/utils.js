function getLinkColor(type) {
  if(type === 'keyword') {
    return '#ffff00'
  } else if (type === 'hierarchy') {
    return '#00ffff'
  }
  return '#ffffff'
}

export { getLinkColor }