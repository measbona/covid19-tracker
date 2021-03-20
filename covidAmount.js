const _ = require("lodash")
const Table = require('cli-table3')
const coronaData = require('./db.json')

const table = new Table({
  head: ['Province', 'Infected', 'Recovered', 'Dead']
, colWidths: [20, 11, 11, 11]
});

const amountPlus = object => {
  const { region_infection: regionInfecting } = object

  let infectedCount = 0
  let recoveredCount = 0
  let deadCount = 0

  _.forEach(regionInfecting, data => {
    //plus infected amount
    infectedCount += data.infected_count
    //plus recovered amount
    recoveredCount += data.recovered_count
    //plus dead amount
    deadCount += data.dead_count
    // province data in row
    table.push([`${data.place_name}`, data.infected_count, data.recovered_count, data.dead_count])
  })

  table.push(['Amount', infectedCount, recoveredCount, deadCount])
  table.push(['Total', infectedCount + recoveredCount + deadCount])
}

const covidAmount = newProvince => {
  amountPlus(coronaData)

  console.log(table.toString())

  if (_.size(newProvince)) console.log(newProvince)
}

module.exports = { covidAmount }