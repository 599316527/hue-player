<template>
<div>
<div class="player">
  <div>
    <div class="form-group">
        <label>Pick a MP4</label>
        <div class="input-group">
          <input type="file" ref="file" class="form-control" @change="handleVideoFileChange">
          <span class="input-group-btn">
            <button class="btn btn-default" type="button" @click="handleVideoClear">Clear</button>
          </span>
        </div>
    </div>
  </div>
  <div>
    <video ref="video" @loadedmetadata="handleLoadedMetadata"
      @timeupdate="hanleVideoTimeUpdate" controls></video>
  </div>
  <div style="display: none">
    <canvas :width="width" :height="height" ref="canvas"></canvas>
  </div>
</div>
</template>

<script>
import kolor from 'kolor'

export default {
  name: 'player',
  data() {
    return {
      width: 100,
      height: 100
    }
  },
  methods: {
    handleVideoFileChange({target}) {
      let file = target.files[0]
      this.$refs.video.src = URL.createObjectURL(file)
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

    handleVideoClear() {
      this.$refs.file.value = ''
      this.$refs.video.src = ''
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

</style>
