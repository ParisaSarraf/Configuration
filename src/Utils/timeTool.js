import moment from 'moment-jalaali';

export function getPersianDayOfWeek(enDate) {
	// this condition used for part of project that not converted to TS
	if ([null, undefined, '', 'null'].includes(enDate?.trim())) return '';
	const persianWeekDaysArray = ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

	return persianWeekDaysArray[moment(enDate).weekday()];
}

export function georgianDateToJalaliDate(enDate) {
	// this condition used for part of project that not converted to TS
	// if ([null, undefined, '', 'null'].includes(enDate?.trim())) return '';
	if (!isGeorgianDateValid(enDate)) return '';

	return moment(enDate).format('jYYYY/jMM/jDD');
}

export function georgianDateTimeToTime(enDate) {
	// this condition used for part of project that not converted to TS
	if ([null, undefined, '', 'null'].includes(enDate?.trim())) return '';

	return moment(enDate).format('HH:mm:ss');
}

export function georgianDateTimeToJalaliDateTime(enDateTime) {
	// this condition used for part of project that not converted to TS
	if ([null, undefined, '', 'null'].includes(enDateTime?.trim())) return '';

	return moment(enDateTime).format('HH:mm - jYYYY/jMM/jDD');
}

export function georgianDateTimeToExactJalaliDateTime(enDateTime) {
	// this condition used for part of project that not converted to TS
	if ([null, undefined, '', 'null'].includes(enDateTime?.trim())) return '';

	return moment(enDateTime).format('HH:mm:ss.S - jYYYY/jMM/jDD');
}

export function georgianDateTimeToJalaliDateTimeWithSeconds(enDateTime) {
	// this condition used for part of project that not converted to TS
	if ([null, undefined, '', 'null'].includes(enDateTime?.trim())) return '';

	return moment(enDateTime).format('HH:mm:ss - jYYYY/jMM/jDD');
}

export function jalaliDateToGeorgianDate(faDate) {
	// this condition used for part of project that not converted to TS
	if ([null, undefined, '', 'null'].includes(faDate?.trim())) return '';

	// if (!faDate) return null
	return isJalaliDateValid(faDate) ? moment(faDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD') : null;
}

export function jalaliDateToGeorgianDateTime(faDateTime) {
	// this condition used for part of project that not converted to TS
	if ([null, undefined, '', 'null'].includes(faDateTime?.trim())) return '';

	return moment(faDateTime, 'jYYYY/jMM/jDD').format('YYYY-MM-DDTHH:mm:ss');
}

export function jalaliDateTimeToGeorgianDateTime(faDateTime) {
	// this condition used for part of project that not converted to TS
	if ([null, undefined, '', 'null'].includes(faDateTime?.trim())) return '';

	return moment(faDateTime, 'jYYYY/jMM/jDDTHH:mm').format('YYYY-MM-DDTHH:mm:ss');
}

export function getCurrentJalaliDate() {
	return moment().format('jYYYY/jMM/jDD');
}

export function getCurrentGregorianDateTime() {
	return moment().format('YYYY-MM-DDTHH:mm:ss');
}

// export function getStartOfMonth(date) {
export function getStartOfMonth(date) {
	return moment(date).startOf('jMonth').format('jYYYY/jMM/jDD');
}

export function getStartOfYear() {
	return moment().startOf('jYear').format('jYYYY/jMM/jDD');
}

export function getEndOfYear() {
	return moment().endOf('jYear').format('jYYYY/jMM/jDD');
}

export function getCurrentTime() {
	return moment().format('HH:mm');
}

export function getValidTimeFromTimeString(timeString) {
	return moment(timeString, 'HH:mm').format('HH:mm');
}

export function getCurrentJalaliDateTime() {
	return moment().format('jYYYY/jMM/jDD - HH:mm');
}

export function isJalaliDateValid(date) {
	if (date) {
		return moment(date, 'jYYYY/jMM/jDD')._isValid;
	}
	return false;
}

export function isGeorgianDateValid(date) {
	if (date) {
		return moment(date).isValid;
	}
	return false;
}

export function isTimeValid(time) {
	return moment(time, 'HH:mm')._isValid;
}

export function getDiffDate(startDate, endDate) {
	const date1 = moment(startDate); // First date
	const date2 = moment(endDate); // Second date
	// Calculate the difference in days
	const diffInDays = date2.diff(date1, 'days');

	// Calculate the difference in months
	const diffInMonths = date2.diff(date1, 'months');

	// Calculate the difference in years
	const diffInYears = date2.diff(date1, 'years');

	const diffInHours = date2.diff(date1, 'hours');
	const diffInMinutes = date2.diff(date1, 'minutes');

	return {
		year: diffInYears,
		month: diffInMonths,
		day: diffInDays,
		hours: diffInHours,
		minutes: diffInMinutes,
	};
}

/**
 * Returns the Jalali date a specified number of days before the current date.
 *
 * @param {number} days - The number of days before today.
 * @returns {string} The Jalali date in the format 'JYYYY/JMM/JDD'.
 */
export const getJalaliDateBeforeDays = (days) => {
	return moment().subtract(days, 'days').format('jYYYY/jMM/jDD');
};

export const getDaysOfMonth = (date) => {
	return moment(date, 'jYYYY/jMM').endOf('jMonth').jDate();
};

export const isDateAfterDate = (date, comparedDate = getCurrentJalaliDateTime()) => {
	const isAfter = moment(date, 'jYYYY/jMM/jDDTHH:mm').isAfter(moment(comparedDate, 'jYYYY/jMM/jDDTHH:mm'));
	return isAfter;
};
