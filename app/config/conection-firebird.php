<?php

$db_Connection;


function do_ConnectFB(){
	global $db_Connection;
	//$Host = $_SERVER['DOCUMENT_ROOT'].'/hielos/app/databases/SAE70EMPRE04.FDB';
	//Conexion a servidor remoto
	$Host="192.168.1.251:C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Empresa01\Datos\SAE80EMPRE01.FDB";
	// $Host='C:\xampp\htdocs\SAE70EMPRE01.FDB';
	//$Host="C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE7.00\Empresa01\Datos\SAE70EMPRE01.FDB";

	//$Host="192.168.1.183:C:\xampp\htdocs\SAE70EMPRE01_cp.FDB";
	//$Host=__DIR__."/SAE70EMPRE01_cp.FDB";
	//var_dump($Host);
	$User_Database_Name = 'sysdba';
	$User_Pass = 'masterkey';
	$db_Connection = new FireBird($Host, $User_Database_Name, $User_Pass);
	//$db_Connection->FireBirdc($Host, $User_Database_Name, $User_Pass);
}

function do_ConnectFBOWL(){
	global $db_Connection;
	//$Host = $_SERVER['DOCUMENT_ROOT'].'/hielos/app/databases/SAE70EMPRE04.FDB';
	//Conexion a servidor remoto
	$Host="192.168.1.251:C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Empresa06\Datos\SAE80EMPRE06.FDB";
	// $Host='C:\xampp\htdocs\SAE70EMPRE01.FDB';
	//$Host="C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE7.00\Empresa01\Datos\SAE70EMPRE01.FDB";

	//$Host="192.168.1.183:C:\xampp\htdocs\SAE70EMPRE01_cp.FDB";
	//$Host=__DIR__."/SAE70EMPRE01_cp.FDB";
	//var_dump($Host);
	$User_Database_Name = 'sysdba';
	$User_Pass = 'masterkey';
	$db_Connection = new FireBird($Host, $User_Database_Name, $User_Pass);
	//$db_Connection->FireBirdc($Host, $User_Database_Name, $User_Pass);
}

function do_ConnectFBMODA(){
	global $db_Connection;
	//$Host = $_SERVER['DOCUMENT_ROOT'].'/hielos/app/databases/SAE70EMPRE04.FDB';
	//Conexion a servidor remoto
	$Host="192.168.1.251:C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Empresa05\Datos\SAE80EMPRE05.FDB";
	// $Host='C:\xampp\htdocs\SAE70EMPRE01.FDB';
	//$Host="C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE7.00\Empresa01\Datos\SAE70EMPRE01.FDB";

	//$Host="192.168.1.183:C:\xampp\htdocs\SAE70EMPRE01_cp.FDB";
	//$Host=__DIR__."/SAE70EMPRE01_cp.FDB";
	//var_dump($Host);
	$User_Database_Name = 'sysdba';
	$User_Pass = 'masterkey';
	$db_Connection = new FireBird($Host, $User_Database_Name, $User_Pass);
	//$db_Connection->FireBirdc($Host, $User_Database_Name, $User_Pass);
}

?>

