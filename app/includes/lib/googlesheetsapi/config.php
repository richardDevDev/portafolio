<?php
require_once 'vendor/autoload.php';
require_once 'class-db.php';
  
define('GOOGLE_CLIENT_ID', '766473385528-scb8pvnlg75cugb339pmarg7i8o2eji0.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', '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');
  
$config = [
    'callback' => 'http://localhost/google-sheets-api/callback.php',
    'keys'     => [
                    'id' => GOOGLE_CLIENT_ID,
                    'secret' => GOOGLE_CLIENT_SECRET
                ],
    'scope'    => 'https://www.googleapis.com/auth/spreadsheets',
    'authorize_url_parameters' => [
            'approval_prompt' => 'force', // to pass only when you need to acquire a new refresh token.
            'access_type' => 'offline'
    ]
];
  
$adapter = new Hybridauth\Provider\Google( $config );