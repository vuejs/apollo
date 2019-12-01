<script>
import { ref, computed } from '@vue/composition-api'
import { useSubscription, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const subType = ref('dog')
    const history = ref([])

    const { onResult } = useSubscription(gql`
      subscription onCounterUpdate ($type: String!) {
        counterUpdated (type: $type)
      }
    `, () => ({
      type: subType.value,
    }))

    onResult(result => {
      history.value.push(result.data.counterUpdated)
    })

    const historyJson = computed(() => JSON.stringify(history.value))

    const inputType = ref('dog')
    const counterValue = ref(0)

    const { mutate: updateCounter, onDone } = useMutation(gql`
      mutation updateCounter ($type: String!, $value: Int!) {
        updateCounter (type: $type, value: $value)
      }
    `, () => ({
      variables: {
        type: inputType.value,
        value: counterValue.value,
      },
    }))

    onDone(() => {
      counterValue.value++
    })

    return {
      subType,
      historyJson,
      inputType,
      counterValue,
      updateCounter,
    }
  },
}
</script>

<template>
  <div>
    <div>
      <label>
        <input
          v-model="inputType"
          type="radio"
          name="inputType"
          value="dog"
          class="input-dog"
        >
        Dog
      </label>
      <label>
        <input
          v-model="inputType"
          type="radio"
          name="inputType"
          value="cat"
          class="input-cat"
        >
        Cat
      </label>

      <input
        v-model.number="counterValue"
        type="number"
        placeholder="Enter counter value"
        class="input-value"
        @keyup.enter="updateCounter()"
      >

      <button
        class="btn-update"
        @click="updateCounter()"
      >
        +1
      </button>
    </div>

    <hr>

    <div>
      <label>
        <input
          v-model="subType"
          type="radio"
          name="subType"
          value="dog"
          class="sub-dog"
        >
        Dog
      </label>
      <label>
        <input
          v-model="subType"
          type="radio"
          name="subType"
          value="cat"
          class="sub-cat"
        >
        Cat
      </label>
    </div>

    <div class="sub-history">
      {{ historyJson }}
    </div>
  </div>
</template>
