const moment = require('moment')
const Calendar = require('./Calendar')
const assert = require('assert')

describe('getAvailableSpot', function () {
	it('Should get 1 available spots of calendar 1', function () {
		const calendar = new Calendar(1);
		const result = calendar.getAvailableSpots("10-04-2023", 30);
		assert.ok(result)
		assert.equal(result.length, 1)
		assert.equal(result[0].startHour.valueOf(), moment.utc('2023-04-10T16:00:00.000Z').valueOf())
		assert.equal(result[0].endHour.valueOf(), moment.utc('2023-04-10T16:50:00.000Z').valueOf())
	})
})

describe('getAvailableSpot', function () {
	it('Should get 1 available spots of calendar 2', function () {
		const calendar = new Calendar(2);
		const result = calendar.getAvailableSpots("13-04-2023", 25);
		assert.ok(result)
		assert.equal(result.length, 1)
		assert.equal(result[0].startHour.valueOf(), moment.utc('2023-04-13T18:00:00.000Z').valueOf())
		assert.equal(result[0].endHour.valueOf(), moment.utc('2023-04-13T18:25:00.000Z').valueOf())
	})
})

describe('getAvailableSpot', function () {
	it('Should get no available spots of calendar 3', function () {
		const calendar = new Calendar(3);
		const result = calendar.getAvailableSpots("13-04-2023", 25);
		assert.ok(result)
		assert.equal(result.length, 0)
	})
})
