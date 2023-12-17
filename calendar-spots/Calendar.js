const moment = require('moment');
const CalendarUtils = require('./CalendarUtils');

class Calendar {
	constructor(calendarId) {
		this.calendarData = CalendarUtils.loadCalendarData(calendarId);
	}

	// Obtiene las ranuras (slots) para una fecha específica
	getSlotsForDate(dateISO) {
		return this.calendarData.slots[dateISO] || [];
	}

	// Obtiene los espacios disponibles para una fecha y duración dadas
	getAvailableSpots(date, duration) {
		if (!CalendarUtils.isValidDate(date) || !CalendarUtils.isValidDuration(duration)) {
			throw new Error('Invalid date or duration');
		}

		const dateISO = CalendarUtils.formatDate(date);
		const daySlots = this.getSlotsForDate(dateISO);

		let availableSpots = this.calculateAvailableSpots(daySlots, dateISO, duration);
		return this.convertSlotsToClientTime(availableSpots, dateISO, duration);
	}


	// Calcula los espacios disponibles evitando conflictos con sesiones existentes
	calculateAvailableSpots(daySlots, dateISO, duration) {
		return daySlots
			.filter(slot => {
				const slotStart = moment.utc(`${dateISO} ${slot.start}`, 'DD-MM-YYYY HH:mm');
				const slotEnd = moment.utc(`${dateISO} ${slot.end}`, 'DD-MM-YYYY HH:mm');

				// Expande el slot para incluir el tiempo antes y después de la cita
				const expandedSlotStart = slotStart.clone().subtract(this.calendarData.durationBefore, 'minutes');
				const expandedSlotEnd = slotEnd.clone().add(this.calendarData.durationAfter, 'minutes');

				// Comprueba si el slot está disponible y cumple con la duración
				return !this.hasConflictingSession(dateISO, expandedSlotStart, expandedSlotEnd) &&
					this.isDurationSufficient(slotStart, slotEnd, duration);
			})
	}

// Verifica si hay alguna sesión que se solape con el slot actual
	hasConflictingSession(dateISO, expandedSlotStart, expandedSlotEnd) {
		if (!this.hasSessionsOnDate(dateISO)) {
			return false;
		}

		return this.calendarData.sessions[dateISO].some(session => {
			const sessionStart = moment.utc(`${dateISO} ${session.start}`, 'DD-MM-YYYY HH:mm');
			const sessionEnd = moment.utc(`${dateISO} ${session.end}`, 'DD-MM-YYYY HH:mm');
			return sessionStart.isBefore(expandedSlotEnd) && sessionEnd.isAfter(expandedSlotStart);
		});
	}

// Comprueba si la duración del slot es suficiente
	isDurationSufficient(slotStart, slotEnd, duration) {
		const totalDurationRequired = duration + this.calendarData.durationBefore + this.calendarData.durationAfter;
		const availableDuration = slotEnd.diff(slotStart, 'minutes');
		return availableDuration >= totalDurationRequired;
	}

// Comprueba si hay sesiones en la fecha especificada
	hasSessionsOnDate(dateISO) {
		return this.calendarData.sessions && this.calendarData.sessions[dateISO];
	}

	// Convierte los espacios disponibles al formato de tiempo del cliente
	convertSlotsToClientTime(slots, dateISO, duration) {
		return slots.map(slot => {
			// Convertir dateISO a formato 'YYYY-MM-DD'
			const formattedDateISO = moment(dateISO, 'DD-MM-YYYY').format('YYYY-MM-DD');

			// Crear momentos en UTC para el inicio del slot
			const slotStartMoment = moment.utc(`${formattedDateISO}T${slot.start}`);
			const totalDuration = duration + this.calendarData.durationBefore + this.calendarData.durationAfter;

			// Calcular el momento de fin del slot basado en la duración
			const slotEndMoment = slotStartMoment.clone().add(totalDuration, 'minutes');

			return {
				startHour: slotStartMoment.toDate(),
				endHour: slotEndMoment.toDate()
			};
		});
	}
}

module.exports = Calendar;
