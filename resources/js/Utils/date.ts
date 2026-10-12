const INDONESIAN_MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const INDONESIAN_DAYS = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
];

export function formatIndonesianDate(
    dateString?: string | null,
    options?: { withDayName?: boolean },
): string {
    if (!dateString) return '-';

    const cleanDate = dateString.split('T')[0];
    const parts = cleanDate.split('-');

    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        if (!isNaN(year) && monthIndex >= 0 && monthIndex < 12 && !isNaN(day)) {
            const monthName = INDONESIAN_MONTHS[monthIndex];
            if (options?.withDayName) {
                const dateObj = new Date(year, monthIndex, day);
                const dayName = INDONESIAN_DAYS[dateObj.getDay()];
                return `${dayName}, ${day} ${monthName} ${year}`;
            }
            return `${day} ${monthName} ${year}`;
        }
    }

    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return dateString;

    return parsed.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
