<?php
// site name
define('SITE_NAME', env('SITE_NAME', 'Coin City México'));
define('SITE_TITLE_H1', env('SITE_TITLE_H1', null));
define('SITE_PHONE', env('SITE_PHONE', '5529001793'));
define('HASH_NUMBERS', env('HASH_NUMBERS', 'lyZeIk5UTw1gVN6pWzRdMx2crXhjDtHs7iJB04GKCnPfYqFS3oOmv8QbLaEu9A'));
define('DD_CRE', env('DD_CRE', 'RXN0ZSBzaXRpbyBmdWUgZGVzYXJyb2xsYWRvIHBvciBEYW5pZWwgU2FuZG92YWwgQUtBLiBkYW5pZG9ibGUgZW4gMjAyMA=='));
define('ENABLE_STOCK', env('ENABLE_STOCK', false));

/**
 * Development or production
 */

if (RELEASE_APP !== 'production') {
    define('BD_NAME', env('LOCAL_BD_NAME'));
    define('DB_USER', env('LOCAL_DB_USER'));
    define('DB_PASS', env('LOCAL_BD_PASSWORD'));
    define('D_HOST', env('LOCAL_D_HOST'));
    define('BD_HOST', env('LOCAL_BD_HOST', 'localhost'));

    if (strpos($_SERVER['HTTP_HOST'], '.test') !== false || strpos($_SERVER['HTTP_HOST'], '.local') !== false) {
        define('BASE_URL', env('LOCAL_BASE_URL', 'https://' . $_SERVER['HTTP_HOST']));
        define('BASE_FOLDER', env('BASE_FOLDER', ''));
    } else {
        define('BASE_URL', env('LOCAL_BASE_URL', 'https://' . $_SERVER['HTTP_HOST'] . '/' . env('LOCAL_BASE_FOLDER', '')));
        define('BASE_FOLDER', env('LOCAL_BASE_FOLDER', null));
    }
} elseif (strpos($_SERVER['HTTP_HOST'], env('D_HOST')) !== false) {
    define('BASE_URL', env('BASE_URL'));
    define('BD_NAME', env('BD_NAME'));
    define('DB_USER', env('BD_USER'));
    define('DB_PASS', env('BD_PASSWORD'));
    define('D_HOST', env('D_HOST'));
    define('BASE_FOLDER', env('BASE_FOLDER', ''));
    define('BD_HOST', env('BD_HOST', 'localhost'));
} else {
    header('HTTP/3.0 500 Internal Server Error', true, 500);
    exit("La configuracion del sistema no es correcta");
}

//Constant of uri of site
define('BASE_URI', rtrim(str_replace('https://' . $_SERVER["HTTP_HOST"], '', BASE_URL), '/'));


//  Ruta del sitio completa, Ej. https://localhost/owl/coincity
define('COMPLETE_URL', BASE_URL . BASE_FOLDER);
//  Ruta de los estilos "css"
define('CSS_PATH', env('CSS_PATH', '/app/includes/css/'));
//  Ruta de los "scripts"
define('JS_PATH', env('JS_PATH', '/app/includes/js/'));
//  Ruta de las imagenes estaticas
define('IMAGE_PATH', env('IMAGE_PATH', '/app/includes/images/'));


/**
 * Oauth2
 * La autenticacion por redes
 * */

/**
 * Google
 */
//  Este tipo de autenticacion es por un archivo ".json" se debe hacer la configuracion correspondiente
//  y descomentar las lineas correspondientes si se quiere utilizar con este metodo de autenticacion
define('OAUTH_GOOGLE_CREDENCIALS', env('OAUTH_G_CREDENCIALS', 'app/config/googled2354df34t34r.json'));//Autenticacion por archivo/ descomentar lineas correspondientes
//  Autenticacion por credenciales, es la forma predeterminada para la autenticacion
define('OAUTH_GOOGLE_CLIENT_ID', env('OAUTH_G_CLIENT_ID', '556413221578-icckmvo0unf5hlotnt2jjar7r3d4c53j.apps.googleusercontent.com'));
define('OAUTH_GOOGLE_CLIENT_SECRET', env('OAUTH_G_CLIENT_SECRET', 'fkQReYg9PoxbULnc91pbl-9I'));
//  Redireccion para iniciar sesion
define('OAUTH_GOOGLE_REDIRECT_URI', COMPLETE_URL . env('OAUTH_G_CLIENT_REDIRECT', '/oauth/google'));

/**
 * Facebook
 */
//  Id de la aplicacion
define('OAUTH_FB_APP_ID', env('OAUTH_FB_APP_ID', '576317506630548'));
//  Clave secreta de la aplicacion
define('OAUTH_FB_APP_SECRET', env('OAUTH_FB_APP_SECRET', '5a5d8a4c06da3db5afe12a7e9a5d79e2'));

/**
 * Github
 */
//  Id de la aplicacion
define('OAUTH_GH_CLIENT_ID', env('OAUTH_GH_CLIENT_ID', 'e333ec6a25cea8c846b7'));
//  Clave secreta de la aplicacion
define('OAUTH_GH_CLIENT_SECRET', env('OAUTH_GH_CLIENT_SECRET', 'd88c49fc06f5c4df5d52d4266a2b7c599580233d'));


/**
 * reCaptcha v3
 * La version 3 de recaptcha no funciona con cuadros de desafio es por puntaje del 0.0 al 1.0
 * (Configurable) se puso que si es menor  a 0.6 se mostrara una opcion adicional para validar
 * que es humano y no robot spamero XD.
 * Se debe tener en cuenta que la verificacion adicional se debe agregar a todos los sitio
 * donde se use el rechaptcha ya que no se hace solo
 *
 */

//  Clave del sitio
define('RECAPTCHA_SITEKEY', env('RECAPTCHA_SITEKEY', '6LeqeukUAAAAAAxs9KYqFETsgkQraxM4RFA61SlJ'));
//  Clave secreta para el sitio
define('RECAPTCHA_SECRETKEY', env('RECAPTCHA_SECRETKEY', '6LeqeukUAAAAAOanQT0gNS7ajBsRsvSfG71jGooZ'));


/**
 * PAYPAL
 *
 * Paypal no esta integrado del todo, se deben hacer pruebas y recibir las respuestas webhook o ipn
 * Tambien verificar que en la base de datos este creada su tabla para los pagos o intentos de estos
 *
 * Id del cliente -> PAYPAL_CLIENTID
 * Clave secreta -> PAYPAL_SECRET
 */


/**
 * MercadoPago
 * Las Claves que comienzan con TEST- solo son para pruebas, no funcionaran para produccion
 * Las de produccion comienzan con APP_USR-
 *
 * El monto maximo expresado en la documentacion es de 200k
 * Pero en pruebas dejo agregar hasta 300k pero no mas
 *
 * Clave publica -> MERCADOLIBRE_PUBLICKEY
 * Token privado de la app -> MERCADOLIBRE_TOKEN
 */
//  MP regresa una respuesta a 5 rutas
//  1- ipn
//  2- success
//  3- failure
//  4- pending
//  5- pedidos
//  La ruta inicial para esos archivos
define('MERCADOPAGO_URL_PAYMENT', env('MERCADOPAGO_RETURN_URI', null));
//  Dias para la expiracion de un pago luego de su creacion, por defecto se usan 2 dias
define('MERCADOLIBRE_EXPIRE_DAYS', (intval(env('MERCADOPAGO_EXPIRE_DAYS', 2)) <= 0) ? 2 : intval(env('MERCADOPAGO_EXPIRE_DAYS', 2)));
//define('MERCADOLIBRE_EXPIRE_DAYS', intval(trim(env('MERCADOPAGO_EXPIRE_DAYS', 2) === '') ? 2 : env('MERCADOPAGO_EXPIRE_DAYS', 2)));
/**
 * Mitec
 *
 * Url para generar los pagos -> MITEC_URL
 * Key de mitec -> MITEC_KEY
 * Cadena fija asignada al comercio -> MITEC_DATA_KEY
 * Id de la compañia -> MITEC__ID
 * Id de la rama -> MITEC__BRANCH
 * Usuario -> MITEC__USER
 * Contraseña -> MITEC__PASSWORD
 */
define('MITEC_CHANNEL', env('MIT_CHANNEL', 'W'));
define('MITEC_CURRENCY', env('MIT_CURRENCY', 'MXN'));


/**
 * ENVIOS
 * El codigo postal desde donde se originan los envios
 */
define('PARCEL_PC_ORIGIN', env('PARCEL_PC_ORIGIN', '53370'));
define('PARCEL_CTRY_ORIGIN', env('PARCEL_CTRY_ORIGIN', 'MX'));
define('PARCEL_RESPONSABLE_NAME', env('PARCEL_RESPONSABLE_NAME', 'ARTURO MOLINA'));

define('PARCEL_PICKUP_NEIGHBORHOOD', env('PARCEL_PICKUP_NEIGHBORHOOD', 'Industrial Alce Blanco'));
define('PARCEL_PICKUP_DISTRICT', env('PARCEL_PICKUP_DISTRICT', 'Naucalpan de Juárez'));
define('PARCEL_PICKUP_STATE', env('PARCEL_PICKUP_STATE', 'México'));
define('PARCEL_PICKUP_STATE_CODE', env('PARCEL_PICKUP_STATE_CODE', 'MX'));
define('PARCEL_PICKUP_CITY', env('PARCEL_PICKUP_CITY', 'Naucalpan de Juárez'));
define('PARCEL_PICKUP_DIR_1', env('PARCEL_PICKUP_DIR_1', "Av. 16 de Septiembre 70-A"));
define('PARCEL_PICKUP_DIR_2', env('PARCEL_PICKUP_DIR_2', "Int. C"));

/**
 * Ambiente de desarrollo
 *
 * Aqui se mostraran todas las claves de SANDBOX
 * [los comentarios de cada seccion se encuentran arriba de este comentario]
 */

if (RELEASE_APP === 'development') {
    //Mostrar errores
    define('ERROR_DISPLAY', -1);

    //  MercadoPago
    define('MERCADOLIBRE_PUBLICKEY', env('SANDBOX_MERCADOPAGO_PUBLICKEY', 'TEST-b90bb340-a9ba-4820-9337-72baedcee7ef'));
    define('MERCADOLIBRE_TOKEN', env('SANDBOX_MERCADOPAGO_TOKEN', 'TEST-4985642353651507-080418-3baad3217e5074366f42f8277509e66b-171403374'));

    // Mitec
    define('MITEC_URL', env('SANDBOX_MIT_URL', 'https://wppsandbox.mit.com.mx/gen'));
    define('MITEC_KEY', env('SANDBOX_MIT_KEY', '5dcc67393750523cd165f17e1efadd21'));
    define('MITEC_DATA_KEY', env('SANDBOX_MIT_DATA_KEY', 'SNDBX123'));
    define('MITEC__ID', env('SANDBOX_MIT_U_ID', 'SNBX'));
    define('MITEC__BRANCH', env('SANDBOX_MIT_U_BRANCH', '01SNBXBRNCH'));
    define('MITEC__USER', env('SANDBOX_MIT_U_USER', 'SNBXUSR01'));
    define('MITEC__PASSWORD', env('SANDBOX_MIT_U_PASSWORD', 'SECRETO'));

    // Mitec
    define('OWL_MITEC_URL', env('SANDBOX_MIT_URL', 'https://wppsandbox.mit.com.mx/gen'));
    define('OWL_MITEC_KEY', env('SANDBOX_MIT_KEY', '5dcc67393750523cd165f17e1efadd21'));
    define('OWL_MITEC_DATA_KEY', env('SANDBOX_MIT_DATA_KEY', 'SNDBX123'));
    define('OWL_MITEC__ID', env('SANDBOX_MIT_U_ID', 'SNBX'));
    define('OWL_MITEC__BRANCH', env('SANDBOX_MIT_U_BRANCH', '01SNBXBRNCH'));
    define('OWL_MITEC__USER', env('SANDBOX_MIT_U_USER', 'SNBXUSR01'));
    define('OWL_MITEC__PASSWORD', env('SANDBOX_MIT_U_PASSWORD', 'SECRETO'));

    //STRIPE
    define('STRIPE_KEY',env('SANDBOX_STRIPE_KEY'));


    define('PAYPAL_CLIENTID', env('SANDBOX_PAYPAL_CLIENTID', null));
    define('PAYPAL_SECRET', env('SANDBOX_PAYPAL_SECRET', null));

    define('MAIL_SET_ASSISTANCE', env('SANDBOX_MAIL_SET_ASSISTANCE', 'dsandoval@coincitymexico.com'));
    define('MAIL_SET_CONTACT', env('SANDBOX_MAIL_SET_CONTACT', 'dsandoval@coincitymexico.com'));
    define('MAIL_SET_VOUCHER', env('SANDBOX_MAIL_SET_VOUCHER', 'dsandoval@coincitymexico.com'));

    define('MAIL_HOST', env('SANDBOX_MAIL_HOST', 'smtp.mailtrap.io'));
    define('MAIL_USERNAME', env('SANDBOX_MAIL_USERNAME', '16731665abaf9c'));
    define('MAIL_PASSWORD', env('SANDBOX_MAIL_PASSWORD', '518adcff9b1749'));
    define('MAIL_PORT', env('SANDBOX_MAIL_PORT', 2525));

    define('PARCEL_ENVIAYA_ACCOUNT', env('SANDBOX_PARCEL_ENVIAYA_ACCOUNT', null));
    define('PARCEL_ENVIAYA_APIKEY', env('SANDBOX_PARCEL_ENVIAYA_APIKEY', null));

} else {   //Ambiente de produccion
    //No mostrar errores
    define('ERROR_DISPLAY', 0);

    //  MercadoPago
    define('MERCADOLIBRE_PUBLICKEY', env('MERCADOPAGO_PUBLICKEY', 'TEST-b90bb340-a9ba-4820-9337-72baedcee7ef'));
    define('MERCADOLIBRE_TOKEN', env('MERCADOPAGO_TOKEN', 'TEST-4985642353651507-080418-3baad3217e5074366f42f8277509e66b-171403374'));

    //  Mitec
    define('MITEC_URL', env('MIT_URL', 'https://wppsandbox.mit.com.mx/gen'));
    define('MITEC_KEY', env('MIT_KEY', '5dcc67393750523cd165f17e1efadd21'));
    define('MITEC_DATA_KEY', env('MIT_DATA_KEY', 'SNDBX123'));
    define('MITEC__ID', env('MIT_U_ID', 'SNBX'));
    define('MITEC__BRANCH', env('MIT_U_BRANCH', '01SNBXBRNCH'));
    define('MITEC__USER', env('MIT_U_USER', 'SNBXUSR01'));
    define('MITEC__PASSWORD', env('MIT_U_PASSWORD', 'SECRETO'));

    //OWL
    define('OWL_MITEC_URL', env('OWL_MIT_URL'));
    define('OWL_MITEC_KEY', env('OWL_MIT_KEY'));
    define('OWL_MITEC_DATA_KEY', env('OWL_MIT_DATA_KEY'));
    define('OWL_MITEC__ID', env('OWL_MIT_U_ID'));
    define('OWL_MITEC__BRANCH', env('OWL_MIT_U_BRANCH'));
    define('OWL_MITEC__USER', env('OWL_MIT_U_USER'));
    define('OWL_MITEC__PASSWORD', env('OWL_MIT_U_PASSWORD'));

    //STRIPE
    define('STRIPE_KEY',env('PRODUCTION_STRIPE_KEY'));

    define('PAYPAL_CLIENTID', env('PAYPAL_CLIENTID', null));
    define('PAYPAL_SECRET', env('PAYPAL_SECRET', null));

    define('MAIL_SET_ASSISTANCE', env('MAIL_SET_ASSISTANCE', 'ventas@coincitymexico.com'));
    define('MAIL_SET_CONTACT', env('MAIL_SET_CONTACT', 'ventas@coincitymexico.com'));
    define('MAIL_SET_VOUCHER', env('MAIL_SET_VOUCHER', 'facturacion@coincitymexico.com'));

    define('MAIL_HOST', env('MAIL_HOST', 'mail.coincitymexico.com'));
    define('MAIL_USERNAME', env('MAIL_USERNAME', 'noreply@coincitymexico.com'));
    define('MAIL_PASSWORD', env('MAIL_PASSWORD', 'F5Da.Cb1e2'));
    //define('MAIL_PORT', env('MAIL_PORT', 587));
    define('MAIL_PORT', env('MAIL_PORT', 465));

    define('PARCEL_ENVIAYA_ACCOUNT', env('PARCEL_ENVIAYA_ACCOUNT', null));
    define('PARCEL_ENVIAYA_APIKEY', env('PARCEL_ENVIAYA_APIKEY', null));
}


/**
 * API BANXICO
 *
 * Banxico, se obtiene el tipo de cambio
 */

define('API_TOKEN_BANXICO', env('BANXICO_API_TOKEN', '569a23270d970e8eb3038c313e9043c5236866ce7ef1325365475427bf5164a1'));
define('API_BANXICO', env('BANXICO_API_URL', 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF60653/datos/'));


/**
 * MAIL
 *
 * Configuracion de correos
 * */
define('MAIL_CLIENT_TEST', env('MAIL_CLIENT_TEST', false));
define('MAIL_FROM_MAIL', env('MAIL_FROM_MAIL', 'noreply@coincitymexico.com'));
define('MAIL_FROM_NAME', env('MAIL_FROM_NAME', 'Coin City M&eacute;xico'));


define('SITE_ADDRESS', env('SITE_ADDRESS', 'Av. 16 de Septiembre 70-A interior C, Col. Fraccionamiento Industrial Alce Blanco, Naucalpan de Juarez, Estado de Mexico, C.P. 53370.'));


/**
 * Timezone
 */
//Zona horaria que se aplicara para el sitio
define('SITE_TIMEZONE', env('SITE_TIMEZONE', 'America/Mexico_City'));
date_default_timezone_set(SITE_TIMEZONE);
try {
    define('SITE_MYSQL_TIMEZONE', timezoneMysql());
} catch (Exception $e) {
    showError($e);
}


define('ZOPIM', env('ZOPIM', false));

/**
 * Halloween
 */

define('HALLOWEEN', env('HALLOWEEN', false));
define('HALLOWEEN_INVERSE', env('HALLOWEEN_INVERSE', false));


/**
 * Buen fin
 */
define('BUENFIN', env('BUENFIN', false));
//dd(BD_NAME,DB_USER,DB_PASS,BD_HOST);