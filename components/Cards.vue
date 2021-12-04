<template>
  <div class="container">
    <div>
      <h3 class="title">
        PLAYER
      </h3>
      <div>
        <div
          class="control-panel"
          :class="[activeCard && 'on-air']"
        >
          <span class="total-duration" style="width: 33%">total: {{ countTotalDuration() }}</span>
          <span class="control-item btn-control-play">
            <svg
              v-if="!activeCard && !actionBusy"
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="currentColor"
              class="bi bi-stop-circle-fill"
              viewBox="0 0 16 16"
              color="black"
              @click="play(selectedCard)"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z" />
            </svg>
            <svg
              v-if="activeCard && !actionBusy"
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="currentColor"
              class="bi bi-stop-circle-fill"
              viewBox="0 0 16 16"
              color="black"
              @click="stop()"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z" />
            </svg>
            <svg
              v-if="actionBusy"
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="currentColor"
              class="bi bi-arrow-clockwise"
              viewBox="0 0 16 16"
              color="black"
              disabled
            >
              <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z">
                <animateTransform
                  attributeType="xml"
                  attributeName="transform"
                  type="rotate"
                  from="0 8 8"
                  to="360 8 8"
                  dur="0.5s"
                  additive="sum"
                  repeatCount="indefinite"
                />
              </path>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z">
                <animateTransform
                  attributeType="xml"
                  attributeName="transform"
                  type="rotate"
                  from="0 8 8"
                  to="360 8 8"
                  dur="0.5s"
                  additive="sum"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </span>
          <span class="time-left" style="width: 33%">time left: {{ timeLeft }}</span>
        </div>
        <hr>
        <table class="table table-sm table-striped card-table">
          <thead>
            <tr>
              <th>
                name
              </th>
              <th>
                duration
              </th>
              <th>
                <b-dropdown variant="outline reset-btn">
                  <b-dropdown-item class="dropdown-item reset-item" href="#" @click="resetPlayer()">
                    reset
                  </b-dropdown-item>
                </b-dropdown>
              </th>
            </tr>
          </thead>
          <draggable
            :list="cards"
            class="dragArea"
            tag="tbody"
            group="people"
            @end="cardMoved"
            @add="addNewCard"
          >
            <tr
              v-for="element in cards"
              :key="element.cardName"
              class="justify-content-between align-items-center card-item"
              :class="[selectedCard === element.cardName && 'selected', element.cardName === activeCard && 'on-air']"
              @click="selectedCard = selectedCard === element.cardName ? '' : element.cardName"
            >
              <td>{{ element.fileName }}</td>
              <td>{{ parseTime($store.state.durations[element.fileName]) }}</td>
              <td>
                <b-dropdown variant="outline">
                  <b-dropdown-item class="dropdown-item" href="#" @click="removeCard(element.cardName)">
                    Delete
                  </b-dropdown-item>
                </b-dropdown>
              </td>
            </tr>
          </draggable>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import draggable from 'vuedraggable'
export default {
  name: 'Simple',
  components: {
    draggable
  },
  data () {
    return {
      enabled: true,
      dragging: false,
      cards: [],
      activeCard: '',
      timeLeft: '00:00:00',
      selectedCard: '',
      actionBusy: false
    }
  },
  computed: {
  },
  mounted () {
    this.getCards()
    this.getActiveCard()
  },
  display: 'Simple',
  order: 0,
  methods: {
    async addNewCard (event) {
      this.selectedCard = ''
      const id = event.newIndex
      const fileName = this.$store.state.files[event.oldIndex].name
      this.cards[id].fileName = fileName
      await this.writeCards()
    },
    cardMoved () {
      if (this.cards.length < 2) { return }
      this.writeCards()
    },
    async writeCards () {
      const data = this.cards.map((item) => {
        if (item.cardName === this.activeCard) { return item }
        return { fileName: item.fileName }
      })
      await axios.post('/api/cards', { data })
        .then(() => {
          this.getCards()
        })
    },
    async getCards () {
      this.selectedCard = ''
      await axios.get('/api/cards')
        .then(({ data }) => {
          this.cards.length = 0
          this.cards.push(...data.data)
        })
    },
    getActiveCard () {
      const t = this
      const eventSource = new EventSource('/api/current-file')
      eventSource.addEventListener('message', function (e) {
        const data = e.data.split(',')
        const currentPlaylist = data[0].trim()
        const startFrame = Number(data[1].trim())
        const currentFrame = Number(data[2].trim())
        if (!currentPlaylist.trim()) {
          t.activeCard = ''
          t.timeLeft = '00:00:00'
          return
        }
        t.activeCard = currentPlaylist.trim()
        const eventAsset = t.cards.filter(({ cardName }) => cardName === t.activeCard)[0].fileName
        const frameRate = t.$store.state.frameRate[eventAsset]
        t.timeLeft = t.parseTime((startFrame + t.$store.state.nbFrames[eventAsset] - currentFrame) / frameRate)
      })
    },
    async play (file) {
      this.actionBusy = true
      if (!this.selectedCard || this.cards.length < 2) {
        this.actionBusy = false
        return
      }
      await axios.post('/api/play-card', { fileName: file })
        .then(() => {
          this.getCards()
        })
        .then(() => {
          this.actionBusy = false
        })
    },
    async stop () {
      this.actionBusy = true
      await axios.post('/api/stop-card')
        .then(({ data }) => {
          if (data) {
            this.setState('err', data.err)
            this.setState('stdout', data.stdout)
            this.setState('stderr', data.stderr)
          }
        })
        .then(() => {
          this.getCards()
        })
        .then(() => {
          this.actionBusy = false
        })
    },
    removeCard (name) {
      if ((this.activeCard && (this.cards.length < 3)) || name === this.activeCard) { return }
      this.cards = this.cards.filter(({ cardName }) => name !== cardName)
      this.selectedCard = ''
      this.writeCards()
    },
    countTotalDuration () {
      let acc = 0
      this.cards.forEach(({ fileName }) => {
        acc += this.$store.state.durations[fileName]
      })
      return this.parseTime(acc)
    },
    parseTime (sec) {
      const hours = ('0' + Math.floor(sec / 3600)).slice(-2)
      const minutes = ('0' + Math.floor(sec / 60 - Number(hours) * 60)).slice(-2)
      const seconds = ('0' + Math.floor(sec % 60)).slice(-2)
      return hours + ':' + minutes + ':' + seconds
    },
    async resetPlayer () {
      await axios.post('/api/reset-player')
        .then(() => {
          this.getCards()
        })
    },
    setState (name, value) {
      this.$store.commit('setState', { name, value })
    }
  }
}
</script>

<style>
.card-table thead {
    background: #99b9fd;
    vertical-align: baseline;
  }
.table thead th {
  border: none;
  text-transform: uppercase;
}
.table td {
  vertical-align: baseline;
}
.control-panel {
  display: flex;
  background: #e9ecef;
  border: 1px solid #ced4da;
  justify-content: space-between;
  text-align: center;
  align-items: center;
  padding: 3px;
  font-weight: 700;
  text-transform: uppercase;
}
.btn-control-play {
  margin: 0 30px 0 30px;
  align-items: center;
}
.control-item:hover {
  cursor: pointer;
}
.control-item:active {
  -webkit-transform: scale(0.90);
    transform: scale(0.90);
}
.card-item:hover {
  cursor: move;
}
.selected {
  background: rgb(169, 225, 247) !important;
}
.on-air {
  background: #99fddc !important;
}
.reset-btn {
  margin: 0;
  padding-top: 0;
  padding-bottom: 0;
  max-height: 22px;
  align-self: center;
}
.reset-item {
  vertical-align: baseline;
  align-self: center;
}
</style>
