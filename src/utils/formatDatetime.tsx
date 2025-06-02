// Format date for display
export const formatDateTime = (dateString: string, useUSFormat = false): string => {
    const date = new Date(dateString);
    const locale = useUSFormat ? 'en-US' : 'de-DE'; 
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Intl.DateTimeFormat(locale, options).format(date);
  };