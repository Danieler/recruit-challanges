const moment = require('moment');
const fs = require('fs');

class Calendar {
	constructor(calendarId) {
		this.calendarId = calendarId;
		this.calendarData = this.loadCalendarData();
	}

	// Lee y carga los datos del calendario desde un archivo JSON
	loadCalendarData() {
		try {
			let rawData = fs.readFileSync(`./calendars/calendar.${this.calendarId}.json`);
			return JSON.parse(rawData);
		} catch (error) {
			throw new Error('Error loading calendar data');
		}
	}

	// Valida el formato de la fecha
	isValidDate(date) {
		return moment.utc(date, 'DD-MM-YYYY', true).isValid();
	}

	// Valida que la duración sea un número entero positivo
	isValidDuration(duration) {
		return Number.isInteger(duration) && duration > 0;
	}

	// Formatea una fecha del formato 'DD-MM-YYYY' al formato 'YYYY-MM-DD'
	formatDate(date) {
		return moment.utc(date, 'DD-MM-YYYY').format('DD-MM-YYYY');
	}

	// Obtiene las ranuras (slots) para una fecha específica
	getSlotsForDate(dateISO) {
		return this.calendarData.slots[dateISO] || [];
	}

	// Obtiene los espacios disponibles para una fecha y duración dadas
	getAvailableSpots(date, duration) {
		if (!this.isValidDate(date) || !this.isValidDuration(duration)) {
			throw new Error('Invalid date or duration');
		}

		const dateISO = this.formatDate(date);
		const daySlots = this.getSlotsForDate(dateISO);

		let availableSpots = this.calculateAvailableSpots(daySlots, dateISO, duration);
		return this.convertSlotsToClientTime(availableSpots, dateISO, duration);
	}


	// Calcula los espacios disponibles evitando conflictos con sesiones existentes
	calculateAvailableSpots(daySlots, dateISO, duration) {
		let availableSlots = [];


		daySlots.forEach(slot => {
			const slotStart = moment.utc(`${dateISO} ${slot.start}`, 'DD-MM-YYYY HH:mm');
			const slotEnd = moment.utc(`${dateISO} ${slot.end}`, 'DD-MM-YYYY HH:mm');

			// Ampliar el slot para incluir durationBefore y durationAfter
			let expandedSlotStart = slotStart.clone().subtract(this.calendarData.durationBefore, 'minutes');
			let expandedSlotEnd = slotEnd.clone().add(this.calendarData.durationAfter, 'minutes');

			let slotIsAvailable = true;

			if (this.hasSessionsOnDate(dateISO)) {
				for (let session of this.calendarData.sessions[dateISO]) {
					let sessionStart =  moment.utc(`${dateISO} ${session.start}`, 'DD-MM-YYYY HH:mm');
					let sessionEnd = moment.utc(`${dateISO} ${session.end}`, 'DD-MM-YYYY HH:mm');

					if (sessionStart.isBefore(expandedSlotEnd) && sessionEnd.isAfter(expandedSlotStart)) {
						slotIsAvailable = false;
						break; // Romper el bucle si se encuentra un conflicto
					}
				}
			}

			// Comprobar si el slot tiene suficiente tiempo para la duración total del evento
			if (slotIsAvailable) {
				let totalDurationRequired = duration + this.calendarData.durationBefore + this.calendarData.durationAfter;
				let availableDuration = slotEnd.diff(slotStart, 'minutes');

				if (availableDuration >= totalDurationRequired) {
					availableSlots.push({ start: slot.start, end: slot.end });
				}
			}
		});

		return availableSlots;
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
