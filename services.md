1. Crear identidad
https://investigacion.iqsec.com.mx:8013/UserRegistration/CreateIndentityWeb
body: {
  "browserName": "string",
  "browserVersion": "string",
  "os": "string"
}
response: {
  "success": true,
  "statusCode": 201,
  "message": "Identidad creada correctamente.",
  "data": {
    "identityId": "d892d138-5a8e-458f-8fb0-427c49eb0b2c",
    "deviceId": "15dc02bf-b609-40ae-9f97-797bb54d40da"
  }
}
2. Registrar al ususario
https://investigacion.iqsec.com.mx:8013/UserRegistration/RegisterWeb
body: {
  "identityId": "45a767b7-cf2f-491e-a62f-e07574b1a835",
  "fullName": "rene test",
  "email": "rene@mail.com",
  "phoneNumber": "5537200981",
  "password": "Rene1234",
  "deviceId": "e9804047-d6fb-423b-974b-c10dc42f99f4"
}
response: {
  "success": true,
  "statusCode": 201,
  "message": "Usuario creado correctamente.",
  "data": {
    "userId": "051a1651-23d2-402e-98ea-c8659ba2f890"
  }
}
3. Options passkey
https://investigacion.iqsec.com.mx:8013/Challenge/OptionsPassKey
body: {
  "identityId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "string",
  "displayName": "string"
}
response: {
  "success": true,
  "statusCode": 200,
  "message": "Opciones para passkey creadas correctamente.",
  "data": {
    "options": {
      "server_url": "https://investigacion.iqsec.com.mx:8013/Authentication/RegisterPassKey",
      "challenge": "vrlETd1/v3RoqHGMWn99BG/4fJvX1u/MzdOf+7bOFZc=",
      "identityId": "45a767b7-cf2f-491e-a62f-e07574b1a835",
      "rp": {
        "id": "localhost",
        "name": "PassKey Iqsec Corp"
      },
      "user": {
        "name": "rene@mail.com",
        "id": "dDJlblJTL1BIa21tTCtCMWRMR29OUT09",
        "displayName": "rene test"
      },
      "pubKeyCredParams": [
        {
          "type": "public-key",
          "alg": -7
        },
        {
          "type": "public-key",
          "alg": -257
        },
        {
          "type": "public-key",
          "alg": -8
        }
      ],
      "timeout": 120000,
      "authenticatorSelection": {
        "residentKey": "required",
        "requireResidentKey": true,
        "userVerification": "required"
      }
    }
  }
}
4. Registrar passkey, de este no se tiene info como los demás solo el body y el url porque no podemos sacar el credential hasta que hagamos la prueba en la web que construyas y por lo tanto no tenemos el response completo
https://investigacion.iqsec.com.mx:8013/Authentication/RegisterPassKey
body: {
  "credential": {
    "id": "string",
    "rawId": "string",
    "response": {
      "attestationObject": "string",
      "clientDataJSON": "string"
    },
    "type": "string"
  },
  "challenge": "vrlETd1/v3RoqHGMWn99BG/4fJvX1u/MzdOf+7bOFZc=",
  "identityId": "45a767b7-cf2f-491e-a62f-e07574b1a835"
}
response: response: {
  "success": true,
  "statusCode": 200,
  "message": "Mensaje de la transaccion",
  "data": {

  }
}