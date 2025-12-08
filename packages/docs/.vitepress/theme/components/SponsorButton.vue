<script setup lang="ts">
import GithubButton from 'vue-github-button'
</script>

<template>
  <p class="sponsor-button">
    <GithubButton
      href="https://github.com/sponsors/Akryum"
      data-icon="octicon-heart"
      data-size="large"
      aria-label="Sponsor @Akryum on GitHub"
    >
      Sponsor on GitHub
    </GithubButton>
  </p>
</template>

<style scoped>
.sponsor-button {
  text-align: center;
  margin: 24px 0;
}
</style>
