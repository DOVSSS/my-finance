export const getCurrentMonth = () => {
  const now = new Date();
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
};

export const formatDate = (date) => {
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (date) => {
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};