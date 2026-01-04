import { format, fromZonedTime } from 'date-fns-tz';

export function getUserTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
        return 'UTC';
    }
}

/**
 * Converts a UTC ISO string (from DB) to user's localized date and time strings.
 */
export function formatToUserTimezone(isoString: string | null | undefined, timezone: string): { date: string, time: string } | undefined {
    if (!isoString) return undefined;

    try {
        const date = new Date(isoString);
        return {
            date: format(date, 'yyyy-MM-dd', { timeZone: timezone }),
            time: format(date, 'HH:mm', { timeZone: timezone })
        };
    } catch (e) {
        console.error('Error formatting date:', e);
        return undefined;
    }
}

/**
 * Converts user's wall time input (Date and Time strings) in their timezone to a UTC ISO string.
 */
export function createUtcFromUserInput(dateStr: string, timeStr: string | undefined, timezone: string): string | null {
    if (!dateStr) return null;

    try {
        const time = timeStr || '00:00';
        const input = `${dateStr} ${time}`;

        // Treat this wall time as belonging to the timezone, return UTC date
        const utcDate = fromZonedTime(input, timezone);
        return utcDate.toISOString();
    } catch (e) {
        console.error('Error creating date:', e);
        return null;
    }
}
