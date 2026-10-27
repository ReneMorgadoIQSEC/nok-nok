1. POST Obtener opciones https://investigacion.iqsec.com.mx:8013/Challenge/OptionsPassKeyLogin
Body: {
  "identityId": "ed92d0e8-2b3d-48d2-8a6a-aef2eefe7e2b",
  "email": "rene.morgado@iqsec.com.mx"
}
Response: {
  "success": true,
  "statusCode": 200,
  "message": "Opciones para validar passkey creadas correctamente.",
  "data": {
    "options": {
      "server_url": "https://investigacion.iqsec.com.mx:8013/Authentication/ValidatePassKey",
      "challenge": "6G5cXUYr6hFnS5WGY2QfFZmL/5ZV1p4pE48u0bW4cMk=",
      "identityId": "ed92d0e8-2b3d-48d2-8a6a-aef2eefe7e2b",
      "rpid": "localhost",
      "timeout": 120000,
      "userVerification": "required",
      "allowCredentials": [
        {
          "type": "public-key",
          "id": "38PGizoHfNjU1Ze0ftuZskZrIL4="
        }
      ]
    }
  }
}
2. POST Valida passkey https://investigacion.iqsec.com.mx:8013/Authentication/ValidatePassKey
Body: {
  "credential": {
    "id": "string",
    "rawId": "string",
    "response": {
      "authenticatorData": "string",
      "clientDataJSON": "string",
      "signature": "string"
    },
    "type": "string"
  },
  "challenge": "6G5cXUYr6hFnS5WGY2QfFZmL/5ZV1p4pE48u0bW4cMk=",
  "identityId": "ed92d0e8-2b3d-48d2-8a6a-aef2eefe7e2b"
}