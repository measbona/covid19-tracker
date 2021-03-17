const fs = require('fs')
const _ = require('lodash')
const fetch = require('node-fetch')
const currentData = require('./db.json')
const cambodiaProvinces = require('./provinces.json')
const { covidAmount } = require('./covidAmount')

const covid19cambodiaUrl = 'https://covid19cambodia.herokuapp.com/?fbclid=IwAR3ee982vjb97WZPqMmyRt_B1VhKAy3nSXfg2QeN5AbYtYp6z4l4WnZF9iY'

appendEnglishLocation = remoteData => {
  let newProvince = []

  _.forEach(remoteData.provinces, data => {
    const findProvince = _.find(cambodiaProvinces, province => data.location === province.name_kh)

    if (findProvince) {
      data.en_location = findProvince.name_en
    } else {
      newProvince.push(_.toString(data.location))
    }
  })

  return { remoteData, newProvince }
}

getRemoteData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = await fetch(covid19cambodiaUrl)
      const result = await url.json()
      const { newProvince, remoteData: data } = appendEnglishLocation(result)

      resolve({ data, newProvince })
    } catch (err) {
      reject('Fail get covid19Cambodia')
    }
  })
}

setNewProvinceToJson = (remote, local) => {
  const newLocalData = local

  _.forEach(remote, remoteProvince => {
    const localData = _.find(local, data => _.lowerCase(data.place_name) === _.lowerCase(remoteProvince.en_location))

    if (!localData) {
      const pushData = {
        place_name: remoteProvince.en_location,
        latitude: remoteProvince.lat,
        longitude: remoteProvince.lng,
        infected_count: remoteProvince.cases - remoteProvince.recovered - remoteProvince.deaths,
        recovered_count: remoteProvince.recovered,
        dead_count: remoteProvince.deaths,
      }

      newLocalData.push(pushData)
    }
  })

  overwriteFile()
}

updater = async (remote, local, newProvince) => {
  try {
    await setNewProvinceToJson(remote, local)

    _.forEach(local, province => {
      const remoteData = _.find(remote, data => _.lowerCase(data.en_location) === _.lowerCase(province.place_name))
      province.infected_count = remoteData.cases - remoteData.recovered - remoteData.deaths
      province.recovered_count = remoteData.recovered
      province.dead_count = remoteData.deaths
    })

  } catch (err) {
    console.log(`Error updater: ${err.message}`)
  }
}

overwriteFile = () => new Promise((resolve) => resolve(fs.writeFileSync('./db.json', JSON.stringify(currentData))))

const covidUpdate = async () => {
  try {
    const { data: remoteData, newProvince } = await getRemoteData()
    await updater(remoteData.provinces, currentData.region_infection, newProvince)
    await overwriteFile()

    covidAmount(newProvince)
  } catch (err) {
    console.log(`Error covidUpdate: ${err.message}`)
  }
}

module.exports = { covidUpdate }