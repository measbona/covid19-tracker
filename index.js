const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const { covidUpdate } = require('./covidUpdate')
const covidData = require('./db.json')
const _ = require('lodash')

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bonameas3@gmail.com',
    pass: 'Meas@1234',
  },
})

covidTable = () => {
  let htmlData = ``
  let infectedCount = 0
  let recoveredCount = 0
  let deadCount = 0

  return new Promise((resolve) => {
    _.forEach(covidData.region_infection, province => {
      infectedCount += province.infected_count
      recoveredCount += province.recovered_count
      deadCount += province.dead_count

      htmlData += `
        <tr>
          <td>${province.place_name}</td>
          <td>${province.infected_count}</td>
          <td>${province.recovered_count}</td>
          <td>${province.dead_count}</td>
        </tr>
      `
    })

    htmlData += `
      <tr>
        <td>Amount</td>
        <td>${infectedCount}</td>
        <td>${recoveredCount}</td>
        <td>${deadCount}</td>
      </tr>
    `

    htmlData += `
      <tr>
        <td>Total</td>
        <td>${infectedCount + recoveredCount + deadCount}</td>
      </tr>
    `

    resolve(htmlData)
  })
}

mailSender = async (error = false) => {
  const table = await covidTable()

  await mailTransport.sendMail({
    from: `Covid Update <noreply@firebase.com>`,
    to: 'measbona3@gmail.com',
    subject: 'Covid Table',
    html: `
    ${!error ? `
      <h3>Covid Update at ${new Date()}</h3>
      <table style="width:100%">
      <tr>
        <th>Province</th>
        <th>Infected</th> 
        <th>Recovered</th>
        <th>Dead</th>
      </tr>
        ${table}
      </table>
    ` : 
    `
      <h4>At : ${new Date()}</h4>
      <h2>Error on : ${error}</h2>
    `}`
  })
}

schedule.scheduleJob('0 10 * * *', async () => {
  try {
    await covidUpdate()
    await mailSender()
  } catch (err) {
    await mailSender(err.message)
  }
});

schedule.scheduleJob('0 13 * * *', async () => {
  try {
    await covidUpdate()
    await mailSender()
  } catch (err) {
    await mailSender(err.message)
  }
});

schedule.scheduleJob('0 15 * * *', async () => {
  try {
    await covidUpdate()
    await mailSender()
  } catch (err) {
    await mailSender(err.message)
  }
});

schedule.scheduleJob('20 16 * * *', async () => {
  try {
    await covidUpdate()
    await mailSender()
  } catch (err) {
    await mailSender(err.message)
  }
});
