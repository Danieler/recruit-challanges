const moment = require('moment');
const fs = require('fs');

class CalendarUtils {
  // Lee y carga los datos del calendario desde un archivo JSON
  static loadCalendarData(calendarId) {
    try {
      let rawData = fs.readFileSync(`./calendars/calendar.${calendarId}.json`);
      return JSON.parse(rawData);
    } catch (error) {
      throw new Error('Error loading calendar data');
    }
  }

  static isValidDate(date) {
    return moment.utc(date, 'DD-MM-YYYY', true).isValid();
  }

  static isValidDuration(duration) {
    return Number.isInteger(duration) && duration > 0;
  }

  static formatDateToDayMonthYear(date) {
    return moment.utc(date, 'DD-MM-YYYY').format('DD-MM-YYYY');
  }

  static formatDateToYearMonthDay(date) {
    return moment.utc(date, 'DD-MM-YYYY').format('YYYY-MM-DD');
  }
}

module.exports = CalendarUtils;
