<template>
<div>
<div class="player">
  <div>
    <div class="form-group">
        <label>Pick a MP4</label>
        <div class="input-group">
          <input type="file" ref="file" class="form-control" @change="handleVideoFileChange">
          <span class="input-group-btn">
            <button class="btn btn-default" type="button" @click="clearSources">Clear</button>
          </span>
        </div>
    </div>
  </div>
  <div class="media">
    <video v-show="media === 2" ref="video" @loadedmetadata="handleLoadedMetadata"
      @timeupdate="hanleVideoTimeUpdate" controls></video>
    <img v-show="media === 1" :width="width" :height="height" ref="image" @load="handleImageLoaded" />
  </div>
  <div style="display: none">
    <canvas :width="width" :height="height" ref="canvas"></canvas>
  </div>
</div>
</template>

<script>
import kolor from 'kolor'

let medias = {
  image: 1,
  video: 2
}

export default {
  name: 'player',
  data() {
    return {
      media: 0,
      width: 100,
      height: 100
    }
  },
  methods: {
    handleVideoFileChange({target}) {
      let file = target.files[0]
      let objectUrl = URL.createObjectURL(file)

      this.clearSources()

      if (file.type.indexOf('image/') === 0) {
        this.media = medias.image
        this.$refs.image.src = objectUrl
      }
      else if (file.type.indexOf('video/') === 0) {
        this.media = medias.video
        this.$refs.video.src = objectUrl
      }
    },

    handleLoadedMetadata({target}) {
      this.width = target.videoWidth
      this.height = target.videoHeight
      this.canvasContext = this.$refs.canvas.getContext('2d')
      this.previousSecond = 0
    },

    hanleVideoTimeUpdate({target}) {
      let currentTime = ~~target.currentTime
      if (currentTime !== this.previousSecond) {
        this.previousSecond = currentTime
        this.canvasContext.drawImage(target, 0, 0, this.width, this.height)
        let imageData = this.canvasContext.getImageData(0, 0, this.width, this.height)
        this.$emit('changecolor', rgb2hsv(calculateAverageColor(imageData)))
      }
    },

    handleImageLoaded({target}) {
      this.width = target.naturalWidth
      this.height = target.naturalHeight
      this.canvasContext = this.$refs.canvas.getContext('2d')
      this.canvasContext.drawImage(target, 0, 0, this.width, this.height)
      let imageData = this.canvasContext.getImageData(0, 0, this.width, this.height)
      this.$emit('changecolor', rgb2hsv(calculateAverageColor(imageData)))
    },

    clearSources() {
      this.media = 0
      this.$refs.file.value = ''
      this.$refs.video.src = ''
      this.$refs.image.src = ''
    }
  }
}

function calculateAverageColor({data}) {
  let i = 0
  let count = 0
  let length = data.length
  let blockSize = 5

  let r = 0
  let g = 0
  let b = 0

  while((i += blockSize * 4) < length){
    ++count
    r += data[i]
    g += data[i+1]
    b += data[i+2]
  }

  // ~~used to floor values
  r = ~~(r/count)
  g = ~~(g/count)
  b = ~~(b/count)

  return [r, g, b]
}

function rgb2hsv(rgb) {
  let color = kolor.rgb(rgb).hsv()
  return {
    h: color[0],
    s: color[1],
    v: color[2]
  }
}
</script>

<style>
.player .media video,
.player .media img {
  max-width: 100%;
}
</style>
