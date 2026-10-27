1. GET Obtener crdenciales https://investigacion.iqsec.com.mx:8013/Authentication/GetCredentials/{IndentityId}
Response:{
  "success": true,
  "statusCode": 200,
  "message": "Credenciales encontradas.",
  "data": {
    "credentials": [
      {
        "identityId": "string",
        "fidoCredentialId": "string",
        "dateCreate": "string"
      }
    ]
  }
}
2. POST Elmina passkey https://investigacion.iqsec.com.mx:8013/Authentication/DeleteCredential
Body: {
  "identityId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fidoCredentialId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
Response: {
  "success": true,
  "statusCode": 200,
  "message": "Credencial eliminada correctamente.",
  "data": {
    "identityId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
}
