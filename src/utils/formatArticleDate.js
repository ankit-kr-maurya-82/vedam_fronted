const ARTICLE_DATE_LOCALE = "en-IN";

export const formatArticleDate = (value) => {
  if (!value) {
    return {
      day: "Recently",
      date: "Date unavailable",
      time: "",
      full: "Recently published",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      day: "Recently",
      date: "Date unavailable",
      time: "",
      full: "Recently published",
    };
  }

  const day = new Intl.DateTimeFormat(ARTICLE_DATE_LOCALE, {
    weekday: "long",
  }).format(date);

  const formattedDate = new Intl.DateTimeFormat(ARTICLE_DATE_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const time = new Intl.DateTimeFormat(ARTICLE_DATE_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return {
    day,
    date: formattedDate,
    time,
    full: `${day}, ${formattedDate} at ${time}`,
  };
};
