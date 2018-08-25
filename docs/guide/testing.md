# Testing

To create unit tests for vue-apollo queries and mutations you can choose either a simple testing or tests with mocked GraqhQL schema. All examples here use [Jest](https://jestjs.io/) and [vue-test-utils](https://github.com/vuejs/vue-test-utils)

## Simple tests

For simple query testing you can just set the components data and check how component renders with a Jest snapshot feature. Say, if you have a query to display all Vue heroes, you can add a mocked array with a single hero:

```js
test('displayed heroes correctly with query data', () => {
    const wrapper = shallowMount(App, { localVue });
    wrapper.setData({
      allHeroes: [
        {
          id: 'some-id',
          name: 'Evan You',
          image:
            'https://pbs.twimg.com/profile_images/888432310504370176/mhoGA4uj_400x400.jpg',
          twitter: 'youyuxi',
          github: 'yyx990803',
        },
      ],
    });
    expect(wrapper.element).toMatchSnapshot();
});
```

## Tests with mocked GraqhQL schema

123

---