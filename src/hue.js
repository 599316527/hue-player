
function getJSON(url, options) {
  return fetch(url, options).then(function (response) {
    return response.json()
  })
}

function discoverBridges() {
  return getJSON('https://www.meethue.com/api/nupnp')
}

function createUser(bridgeIpAddr) {
  return getJSON(buildApiUrl(bridgeIpAddr, '/api'), {
    method: 'POST',
    body: JSON.stringify({
      devicetype: 'youtube_hue#chrome'
    })
  }).then(function ([result]) {
    if (result.success) {
      return Promise.resolve(result.success)
    }
    else if (result.error) {
      return Promise.reject(new Error(result.error.description))
    }
    return Promise.reject(new Error('Unknown'))
  })
}

function getLights(bridgeIpAddr, username) {
  return getJSON(buildApiUrl(bridgeIpAddr, '/api', username, 'lights'))
}
function getGroups(bridgeIpAddr, username) {
  return getJSON(buildApiUrl(bridgeIpAddr, '/api', username, 'groups'))
}

function updateHueColor(bridgeIpAddr, username, light, color) {
  let url = buildApiUrl(bridgeIpAddr, '/api', username, light,
                        light.indexOf('light') >= 0 ? 'state' : 'action')
  let hue = Math.round(color.h / 360 * 65535)
  let sat = Math.floor(color.s * 255)
  let bri = Math.ceil(color.v * 254)

  let body = JSON.stringify({
    on: true,
    hue,
    sat,
    bri
  })

  // console.log(body)

  return getJSON(url, {
    method: 'PUT',
    body
  })
}

function buildApiUrl(ip, ...path) {
  return `http://${ip}${path.join('/')}`
}

export default {
  discoverBridges,
  createUser,
  getLights,
  getGroups,
  updateHueColor
}
