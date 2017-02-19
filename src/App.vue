<template>
<div>
<div class="container-fluid app">
  <div class="header">Hue Player Demo</div>
  <div class="text-center text-info" v-if="initailizing">Initailizing</div>
  <div v-else>
    <form @submit.prevent="save">
      <div class="form-group">
        <label>Hue Bridge</label>
        <select class="form-control" v-model="bridge">
          <option :value="item.id" v-for="item in bridges">{{ item.id }}</option>
        </select>
      </div>

      <div class="text-center text-info" v-if="bridge && !username">
        <big>~~~</big>
      </div>

      <div class="form-group" v-if="bridge && username">
        <label>Sync to</label>
        <select class="form-control" v-model="light">
          <optgroup label="Lights" v-if="lights.length">
            <option :value="'lights/' + item.key" v-for="item in lights">{{ item.name }}</option>
          </optgroup>
          <optgroup label="Groups" v-if="groups.length">
            <option :value="'groups/' + item.key" v-for="item in groups">{{ item.name }}</option>
          </optgroup>
        </select>
      </div>

      <div class="form-group">
        <button type="submit" class="btn btn-default">Save</button>
      </div>
    </form>

    <hr>

    <Player @changecolor="handleVideoColorChange"></Player>
  </div>
</div>

<Toast :toasts="toasts"></Toast>
</div>
</template>

<script>
import {find, extend, map} from 'underscore'
import hue from './hue.js'
import Toast from './Toast.vue'
import Player from './Player.vue'

let storage
if (typeof chrome !== 'undefined' && chrome.storage) {
  storage = chrome.storage.sync || chrome.storage.local;
}
else {
  storage = {
    get(key) { return localStorage.getItem(key) },
    set(key, val) { return localStorage.setItem(key, val) }
  }
}

export default {
  name: 'app',
  data() {
    return {
      initailizing: true,

      username: '',
      bridge: '',
      light: '',
      videoUrl: '',

      bridges: [],
      lights: [],
      groups: [],

      toasts: []
    }
  },
  components: {
    Toast, Player
  },
  computed: {
    bridgeIpaddr() {
      let bridge = find(this.bridges, bridge => bridge.id === this.bridge)
      return bridge ? bridge.internalipaddress : ''
    }
  },
  watch: {
    bridge(val) {
      if (this.bridgeIpaddr && (!this.username || this.bridgeOfUsername !== this.bridge)) {
        hue.createUser(this.bridgeIpaddr).then(({username}) => {
          this.username = username
          this.save()
        }).catch((err) => {
          this.toasts.push(err.message)
        })
        this.toasts.push('Please press the button on the bue bridge.')
      }
    },
    username(val) {
      if (this.bridgeIpaddr && val) {
        hue.getLights(this.bridgeIpaddr, val).then((lights) => {
          this.lights = map(lights, insetLightKey)
        })
        hue.getGroups(this.bridgeIpaddr, val).then((groups) => {
          this.groups = map(groups, insetLightKey)
        })
      }
    }
  },
  methods: {
    save() {
      storage.set('bridge-id', this.bridge ? this.bridge : '')
      storage.set('bridge-ipaddr', this.bridgeIpaddr ? this.bridgeIpaddr : '')
      storage.set('username', this.username ? this.username : '')
      storage.set('light', this.light ? this.light : '')
    },

    read() {
      return {
        bridge: storage.get('bridge-id'),
        bridgeIpaddr: storage.get('bridge-ipaddr'),
        username: storage.get('username'),
        bridgeOfUsername: storage.get('bridge-id'),
        light: storage.get('light')
      }
    },

    handleVideoColorChange(color) {
      hue.updateHueColor(this.bridgeIpaddr, this.username, this.light, color)
    }
  },
  mounted() {
    hue.discoverBridges().then(bridges => {
      this.bridges = bridges
      if (bridges.length < 1) {
        this.toasts.push('No bridges.')
      }
      extend(this, this.read())
      this.initailizing = false
    }).catch(err => {
      this.toasts.push('Can not discover bridges.')
    })
  }
}

function insetLightKey(light, key) {
  light.key = key
  return light
}
</script>

<style>
.app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.header {
  margin: 1em 0 1em;
  font-size: 2em;
}

.toasts {
  position: fixed;
  width: 240px;
  margin: 0 auto;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
