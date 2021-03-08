const fetch = require('node-fetch')
const currentData = require('./db.json')
const _ = require('lodash')
const fs = require('fs')

const covid19cambodiaUrl = 'https://covid19cambodia.herokuapp.com/?fbclid=IwAR3ee982vjb97WZPqMmyRt_B1VhKAy3nSXfg2QeN5AbYtYp6z4l4WnZF9iY'

appendEnglishLocation = remoteData => {
  _.forEach(remoteData.provinces, data => {
    switch (data.location) {
      case 'ព្រះសីហនុ':
         data.en_location = 'Preah Sihanouk'
        break;
      case 'បន្ទាយមានជ័យ':
         data.en_location = 'Banteay Meanchey'
        break;
      case 'បាត់ដំបង':
        data.en_location = 'Battambang'
        break;
      case 'ប៉ៃលិន':
        data.en_location = 'Pailin'
        break;
      case 'កំពង់ចាម':
        data.en_location = 'Kampong Cham'
        break
      case 'កណ្ដាល':
        data.en_location = 'Kandal'
        break
      case 'កំពង់ស្ពឺ':
        data.en_location = 'Kampong Speu'
        break
      case 'សៀមរាប':
        data.en_location = 'Siem Reap'
        break
      case 'ត្បូងឃ្មុំ':
        data.en_location = 'Thbong Khmom'
        break
      case 'កោះកុង':
        data.en_location = 'Koh Kong'
        break
      case 'កែប':
        data.en_location = 'Kep'
        break
      case 'កំពង់ឆ្នាំង':
        data.en_location = 'Kampong Chhnang'
        break
      case 'កំពង់ធំ':
        data.en_location = 'Kampong Thom'
        break
      case 'ស្វាយរៀង':
        data.en_location = 'Svay Rieng'
        break
      case 'ឧត្ដរមានជ័យ':
        data.en_location = 'Oddar Meanchey'
        break
      case 'កំពត':
        data.en_location = 'Kampot'
        break
      case 'ព្រះវិហារ':
        data.en_location = 'Preah Vihear'
        break
      case 'ព្រៃវែង':
        data.en_location = 'Prey Veng'
        break
      case 'ភ្នំពេញ':
        data.en_location = 'Phnom Penh'
        break
      default:
        console.log(`New Province: ${data.location}`)
    }
  })

  return remoteData
}

getRemoteData = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = await fetch(covid19cambodiaUrl)
      const result = await url.json()
      const data = appendEnglishLocation(result)

      resolve(data)
    } catch (err) {
      reject('Fail get covid19Cambodia')
    }
  })
}

updater = (remote, local) => {
  _.forEach(local, province => {
    const remoteData = _.find(remote, data => _.lowerCase(data.en_location) === _.lowerCase(province.place_name))
    province.infected_count = remoteData.cases - remoteData.recovered
    province.recovered_count = remoteData.recovered
  })

  return true
}

execute = async () => {
  try {
    const remoteData = await getRemoteData()
    const updated = await updater(remoteData.provinces, currentData.region_infection)

    if (updated) {
      fs.writeFileSync('./db.json', JSON.stringify(currentData))
    }
  } catch (err) {
    console.log(err.message)
  }
}

execute()