<template>
<div class="toasts">
  <div class="toast" v-for="(message, index) in toasts">
    <div class="pull-right" @click="remove(index)">&times;</div>
    <div class="text">{{ message }}</div>
  </div>
</div>
</template>

<script>
export default {
  name: 'toast',
  props: {
    toasts: {
      type: Array,
      default() {
        return []
      }
    }
  },
  methods: {
    remove(index) {
      this.toasts.splice(index, 1)
    }
  }
}
</script>

<style>
.toasts {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column-reverse;
}

.toast {
  width: 100%;
  margin: .2em;
  padding: .5em .8em;
  background: black;
  color: white;
}

.toast .pull-right {
  margin-left: 1em;
}
</style>
