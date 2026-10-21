1. Enviar codigo por email
'https://investigacion.iqsec.com.mx:8013/Utilities/SendCodeEmail'
body: {
  "email": "string"
}

2. Verificar codigo de email
https://investigacion.iqsec.com.mx:8013/Utilities/VerifyCodeEmail
body: {
  "email": "string",
  "code": "string"
}
reponse example: 
{
  "success": true,
  "statusCode": 0,
  "message": "Verificación satisfactoria",
  "data": {
    "estado": -7,
    "descripcion": "Código incorrecto. Verifique que el código ingresado sea el ultimó que recibió "
  }
}