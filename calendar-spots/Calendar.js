
const CalendarUtils = require('./CalendarUtils');
const CalendarSlotCalculator = require('./CalendarSlotCalculator');

class Calendar {
	constructor(calendarId) {
		this.calendarData = CalendarUtils.loadCalendarData(calendarId);
		this.slotCalculator = new CalendarSlotCalculator(this.calendarData);
	}

	// Obtiene las slots de una fecha específica
	getSlotsForDate(dateISO) {
		return this.calendarData.slots[dateISO] || [];
	}

	// Obtiene los slots disponibles para una fecha y duración dadas
	getAvailableSpots(date, duration) {
		if (!CalendarUtils.isValidDate(date) || !CalendarUtils.isValidDuration(duration)) {
			throw new Error('Invalid date or duration');
		}

		const dateISO = CalendarUtils.formatDateToDayMonthYear(date);
		const daySlots = this.getSlotsForDate(dateISO);

		let availableSpots = this.slotCalculator.calculateAvailableSpots(daySlots, dateISO, duration);
		return this.slotCalculator.convertSlotsToClientTime(availableSpots, dateISO, duration);
	}
}

module.exports = Calendar;
