const moment = require('moment');
const CalendarUtils = require('./CalendarUtils');

class CalendarSlotCalculator {
  constructor(calendarData) {
    this.calendarData = calendarData;
  }

  // Calcula los espacios disponibles evitando conflictos con sesiones existentes
  calculateAvailableSpots(daySlots, dateISO, duration) {
    return daySlots.filter(slot => {
      const slotStart = moment.utc(`${dateISO} ${slot.start}`, 'DD-MM-YYYY HH:mm');
      const slotEnd = moment.utc(`${dateISO} ${slot.end}`, 'DD-MM-YYYY HH:mm');
      const expandedSlotStart = slotStart.clone().subtract(this.calendarData.durationBefore, 'minutes');
      const expandedSlotEnd = slotEnd.clone().add(this.calendarData.durationAfter, 'minutes');

      return !this.hasConflictingSession(dateISO, expandedSlotStart, expandedSlotEnd) &&
        this.isDurationSufficient(slotStart, slotEnd, duration);
    });
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
      const formattedDateISO = moment(dateISO, 'DD-MM-YYYY').format('YYYY-MM-DD');
      const slotStartMoment = moment.utc(`${formattedDateISO}T${slot.start}`);
      const totalDuration = duration + this.calendarData.durationBefore + this.calendarData.durationAfter;
      const slotEndMoment = slotStartMoment.clone().add(totalDuration, 'minutes');

      return {
        startHour: slotStartMoment.toDate(),
        endHour: slotEndMoment.toDate()
      };
    });
  }
}

module.exports = CalendarSlotCalculator;
