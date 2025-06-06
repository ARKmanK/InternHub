export const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const truncateDescription = (description: string, maxLength: number = 300): string => {
  return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
};