// Helper function to convert 24-hour time to 12-hour format
export const formatTimeTo12Hour = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const formattedTime = `${hour12}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
  return formattedTime;
};
