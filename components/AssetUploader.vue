<template>
  <div>
    <h3 class="title">
      FILES
    </h3>
    <form>
      <div class="input-group mb-3">
        <div
          class="custom-file"
          :class="[uploading && 'block-pointer']"
          @change="setPlaceholder"
        >
          <input id="inputGroupFile02" ref="file" accept="video/*" type="file" class="custom-file-input">
          <label class="custom-file-label" for="inputGroupFile02" aria-describedby="inputGroupFileAddon02">
            {{ placeholder }}
          </label>
        </div>
        <div v-if="uploading" class="input-group-append disabled">
          <span id="btn-cancel" class="input-group-text btn-cancel" @click="cancel()">Cancel</span>
        </div>
        <div class="input-group-append disabled">
          <span id="btn-upload" class="input-group-text" @click="sendFile">Upload</span>
        </div>
      </div>
      <div v-if="uploading">
        <div class="progress" :value="progress" max="100">
          <div
            class="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            :style="'width:' + progress + '%'"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span class="percent">{{ progress }}%</span>
          </div>
        </div>
      </div>
    </form>
    <hr>
    <table class="table table-sm table-striped">
      <thead>
        <tr>
          <th>
            name
          </th>
          <th>
            duration
          </th>
          <th />
        </tr>
      </thead>
      <draggable
        :list="$store.state.files"
        :disabled="!enabled"
        :sort="false"
        tag="tbody"
        class="dragArea"
        :group="{ name: 'people', pull: 'clone', put: false }"
        ghost-class="ghost"
      >
        <tr
          v-for="element in $store.state.files"
          :key="element.name"
          class="justify-content-between align-items-center video-item"
        >
          <td>{{ element.name }}</td>
          <td>{{ parseTime(element.duration) }}</td>
          <td>
            <b-dropdown variant="outline">
              <b-dropdown-item class="dropdown-item" href="#" @click="remove(element.name)">
                Delete
              </b-dropdown-item>
            </b-dropdown>
          </td>
        </tr>
      </draggable>
    </table>
  </div>
</template>

<script>
import axios from 'axios'
import draggable from 'vuedraggable'
let request = axios.CancelToken.source()
export default {
  components: {
    draggable
  },
  data () {
    return {
      enabled: true,
      placeholder: 'Choose File',
      progress: 0,
      uploading: false
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    cancel () {
      request.cancel()
      this.clearPlaceholder()
      this.$refs.file.value = null
      this.progress = 0
      this.uploading = false
      request = axios.CancelToken.source()
    },
    setPlaceholder () {
      const file = this.$refs.file.files[0]
      const newPlaceholder = file ? file.name : 'Choose File'
      this.placeholder = newPlaceholder
    },
    clearPlaceholder () {
      this.placeholder = 'Choose File'
    },
    isExist (fileName) {
      return this.$store.state.files.filter(({ name }) => name === fileName).length > 0
    },
    async sendFile () {
      const file = this.$refs.file.files[0]
      if (this.uploading || !file) { return }
      if (this.isExist(file.name)) {
        this.clearPlaceholder()
        return
      }
      const formData = new FormData()
      formData.append('file', file)
      try {
        this.uploading = true
        const res = await axios.post('/api/upload', formData, {
          onUploadProgress: e => (
            this.progress = Math.round(e.loaded * 100 / e.total)
          ),
          cancelToken: request.token
        })
        if (!res) {
          this.uploading = false
          return
        }
        this.clearPlaceholder()
        this.$refs.file.value = null
        this.progress = 0
        this.getList()
        this.uploading = false
      } catch (err) {
        this.setState('err', err)
        this.uploading = false
      }
    },
    async getList () {
      await axios.get('/api/assets')
        .then(({ data }) => {
          const durations = {}
          const nbFrames = {}
          const frameRate = {}
          const updatedFiles = data.list.map((e) => {
            durations[e.name] = Number(e.duration)
            nbFrames[e.name] = Number(e.nbFrames)
            frameRate[e.name] = Number(e.frameRate)
            return { ...e, busy: false }
          })
          this.setState('durations', durations)
          this.setState('nbFrames', nbFrames)
          this.setState('frameRate', frameRate)
          this.setState('files', updatedFiles)
          this.$store.commit('updateSpace', data.diskSpace)
        })
    },
    async remove (fileName) {
      await axios.post('/api/remove-file', { fileName })
      this.getList()
    },
    parseTime (sec) {
      const hours = ('0' + Math.floor(sec / 3600)).slice(-2)
      const minutes = ('0' + Math.floor(sec / 60 - Number(hours) * 60)).slice(-2)
      const seconds = ('0' + Math.floor(sec % 60)).slice(-2)
      return hours + ':' + minutes + ':' + seconds
    },
    setState (name, value) {
      this.$store.commit('setState', { name, value })
    }
  }
}
</script>

<style scoped>
  .table thead {
    background: #99b9fd;
  }
  .table td {
    vertical-align: baseline;
  }
  .block-pointer {
    pointer-events: none;
  }
  .btn-cancel {
    background: #dc3545;
    color: #fff;
  }
  .btn-cancel:hover {
    background: #c82333;
  }
  .percent {
    position: absolute;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    text-align: center;
    font-weight: 900;
    font-size: 12px;
    color:black;
  }
  .custom-file-label {
    text-align: left;
  }
  .input-group-text {
    cursor: pointer;
  }
  #btn-upload:hover {
    background: lightgrey;
  }
  .fileSize {
    padding-right: 5px;
    font-weight: 500;
  }
  .delete {
    margin-left: 40px;
  }
  .video-item:hover {
    cursor: move;
  }
</style>
