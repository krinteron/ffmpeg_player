<template>
  <!-- <client-only> -->
  <video
    id="my_video_1"
    ref="video"
    class="video-js vjs-default-skin vjs-big-play-centered"
    controls
    preload="auto"
    data-setup="{}"
  >
    <source :src=sourceStream type="application/x-mpegURL">
  </video>
  <!-- </client-only> -->
</template>
<script>

import videojs from 'video.js'

export default {
  props: {
    sourceStream: String
  },
  mounted () {
    videojs(this.$refs.video)
  }

}
</script>
<style scoped>
  .vjs-default-skin {
    /* width: 426px; */
    /* height: 240px; */
    width: 345px;
    height: 195px;
    margin-bottom: 20px;
  }

</style>
