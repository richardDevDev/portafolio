<?php
/*
 * Created by (c)danidoble 2021.
 */

include __DIR__.'/../vendor/autoload.php';

use Danidoble\Danidoble;
use Symfony\Component\ErrorHandler\Debug;
use Symfony\Component\ErrorHandler\ErrorHandler;
use Symfony\Component\ErrorHandler\DebugClassLoader;

//for development
Debug::enable();

//for production
//ErrorHandler::register();
//DebugClassLoader::enable();

// If you want a custom generic template when debug is not enabled
// HtmlErrorRenderer::setTemplate('/path/to/custom/error.html.php');

$danidoble = new Danidoble();
$danidoble->message = 'Hello';

$build = new \Danidoble\Build();
$build->message = 'Hello from build';
//this makes an error
//echo $danidoble->_danidoble;

//this dont makes an error
//echo '<pre>';
//var_dump(($danidoble->getCredits()));
//echo '</pre><br>';

echo '<pre>';
var_dump($danidoble);
echo '</pre><br>';