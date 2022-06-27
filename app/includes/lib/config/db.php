<?php
/**
 * Created by (c) danidoble 2021
 */
use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Events\Dispatcher;

$capsule = new Capsule;

/**
 * Conexion predeterminada no es necesario ponerle de donde obtener por que se asigna automaticamente a obtener
 * de esta base
 */
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => LOCAL_DB_HOST,
    'database' => LOCAL_DB_NAME,
    'username' => LOCAL_DB_USER,
    'password' => LOCAL_DB_PASS,
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
    //'timezone' => SITE_MYSQL_TIMEZONE,
    //'timezone' => "+00:00",
], 'default');

/**
 * Conexion secundaria para conexion remota
 * se debe especificar que se quiere obtener o hacer algo con esta base
 *
 * EJ. $online_users = \Site\Models\Productos::on('online')->get();
 */
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => ONLINE_DB_HOST,
    'database' => ONLINE_DB_NAME,
    'username' => ONLINE_DB_USER,
    'password' => ONLINE_DB_PASS,
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
    //'timezone' => SITE_MYSQL_TIMEZONE,
    //'timezone' => "+00:00",
], 'online');


$capsule->setEventDispatcher(new Dispatcher(new Container));
// Make this Capsule instance available globally via static methods... (optional)
$capsule->setAsGlobal();
// Setup the Eloquent ORM... (optional; unless you've used setEventDispatcher())
$capsule->bootEloquent();


/**
 * Para pruebas puedes descomentar las lineas de abajo
 */

//$local_users = \Site\Models\Productos::get();
//$online_users = \Site\Models\Productos::on('online')->get();
//dd($online_users,$local_users);