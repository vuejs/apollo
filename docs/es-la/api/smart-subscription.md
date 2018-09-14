# Smart Subscription

Cada suscripción declarada en la opción `apollo.$Subscribe` en un componente da como resultado la creación de un objeto de Smart Subscription.

## Opciones

- `query`: documento GraphQL (puede ser un archivo o un string `gql`).
- `variables`: Objeto o función reactiva que devuelve un objeto. Cada clave se asignará con un `'$'` en el documento GraphQL, por ejemplo `foo` se convertirá en`$foo`.
- `throttle`: actualizaciones de las variables del acelerador (en ms).
- `debounce`: actualizaciones de las variables de rebote (en ms).
- `result(data)` es un hook llamado cuando se recibe un resultado

## Propiedades

### Skip

Puede pausar o reanudar(unpause) con `skip`:

```js
this.$apollo.subscriptions.users.skip = true
```

## Métodos

### refresh

Detiene y reinicia la consulta:

```js
this.$apollo.subscriptions.users.restart()
```

### start

Inicia la consulta:

```js
this.$apollo.subscriptions.users.start()
```

### stop

Detiene la consulta:

```js
this.$apollo.subscriptions.users.stop()
```
