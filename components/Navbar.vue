<template>
  <b-navbar toggleable="lg" type="dark" variant="primary" class="main-nav-bar">
    <b-navbar-brand>
      backup player
    </b-navbar-brand>
    <b-navbar-toggle target="nav-collapse" />
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav class="ml-auto">
        <b-navbar-brand>
          disk space:
          <span v-if="$store.state.diskSpace" class="disk-space">
            {{ $store.state.diskSpace }} GB
          </span>
          <b-spinner v-if="!$store.state.diskSpace" style="width: 1.5rem; height: 1.5rem;" label="Small Spinner" />
        </b-navbar-brand>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<script>
export default {
  name: 'Navbar',
  data () {
    return {
      path: this.$route.name
    }
  }
}
</script>
<style>
.main-nav-bar {
  font-weight: 500;
  text-transform: uppercase;
}
.disk-space {
  color: rgb(255, 255, 255);
  font-weight: 600;
  border-bottom: 3px solid rgb(255, 255, 255);
}
</style>
