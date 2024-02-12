export function getElapsedTimeString(createdAtTimestamp: string, completedAtTimestamp?: string | null): string {
  const start = new Date(createdAtTimestamp);
    const end = completedAtTimestamp ? new Date(completedAtTimestamp) : new Date();
    const elapsed = end.getTime() - start.getTime();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    let timeString = "";
    if (hours > 0) {
      timeString += hours + "h ";
    }
    if (minutes > 0) {
      timeString += minutes % 60 + "m ";
    }
    timeString += seconds % 60 + "s";
    return timeString;
}