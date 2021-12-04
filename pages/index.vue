<template>
  <div class="container">
    <Navbar />
    <div>
      <h3 class="title">
        STREAM
      </h3>
      <div class="row no-gutters streams">
        <div>
          <h5>LOCAL</h5>
          <Stream class="video-left" v-bind:source-stream="'http://localhost/playlist.m3u8'" />
        </div>
        <div>
          <h5>OUT</h5>
          <Stream class="video-right" v-bind:source-stream="'http://externalhost/playlist.m3u8'" />
        </div>
      </div>
      <b-row class="row no-gutters player">
        <b-col sm="6">
          <!-- <h5>LOCAL</h5> -->
          <AssetUploader class="assets" />
        </b-col>
        <b-col sm="6">
          <!-- <h5>OUT</h5> -->
          <Cards class="cards" />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Simple',
  data () {
    return {
      enabled: true,
      dragging: false,
      list: {},
      event: '',
      eventSource: '',
      sourceStream: ''
    }
  },
  head () {
    return {
      title: 'Player M9'
    }
  },
  computed: {
  },
  mounted () {
    // this.getList()
    // this.getCurrentFile()
  },
  display: 'Simple',
  order: 0,
  methods: {
    setState (name, value) {
      this.$store.commit('setState', { name, value })
    },
    async getList () {
      await axios.get('/api/videos')
        .then(({ data }) => {
          const updatedFiles = data.list.map(
            e => ({ ...e, busy: false })
          )
          this.setState('files', updatedFiles)
          this.setState('havePlaying', data.havePlaying)
          this.$store.commit('updateSpace', data.diskSpace)
        })
    },
    async save (files) {
      await axios.post('/api/save', { data: files })
    },
    async readList () {
      await axios.get('/api/unsave')
        .then(({ data }) => {
          this.list = Object.assign({}, this.list, data.data)
        })
    },
    getCurrentFile () {
      const eventSource = new EventSource('/api/current-file')
      eventSource.addEventListener('message', function (e) {
        this.event = e.data
      })
    }
  }
}
</script>

<style>
.player {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
}
.streams {
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: space-around;
}
.buttons {
  margin-top: 35px;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.disk-space {
  color: rgb(255, 255, 255);
  font-weight: 600;
  border-bottom: 3px solid rgb(255, 255, 255);
}
.title
{
  margin: 10px 0;
}
.streams {
  display: flex;
  flex-wrap: wrap-reverse;
  justify-content: space-around;
}
</style>
