export function getChoiceOptionStyles(
  isAnswered: boolean,
  isSelected: boolean,
  isCorrectOption: boolean,
) {
  if (!isAnswered) {
    return {
      borderColor: isSelected ? '#84CC16' : '#3F3F46',
      bg: isSelected ? '#27272A' : 'transparent',
      color: '#FFFFFF',
    }
  }
  if (isCorrectOption) {
    return {
      borderColor: '#84CC16',
      bg: 'rgba(132, 204, 22, 0.2)',
      color: '#FFFFFF',
    }
  }
  if (isSelected && !isCorrectOption) {
    return {
      borderColor: '#F87171',
      bg: 'rgba(248, 113, 113, 0.15)',
      color: '#FFFFFF',
    }
  }
  return {
    borderColor: '#3F3F46',
    bg: 'transparent',
    color: '#A1A1AA',
  }
}
