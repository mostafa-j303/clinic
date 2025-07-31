
export function getDateDifferenceInDays(startDate: Date, endDate: Date): number{
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };
