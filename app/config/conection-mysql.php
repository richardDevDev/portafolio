<?php

$db_Connection;
$DataBase;

function do_Connect(){
	global $db_Connection;


	$DataBase = __DB__NAME;
	$Host = __DB__HOST;
	$User_Database_Name = __DB__USER;
	$User_Pass = __DB__PASS;
	$Database_Name = $DataBase;

	$db_Connection = new MySQL();
	$db_Connection->MySQLc($Host, $User_Database_Name, $User_Pass, $Database_Name);
}

function do_ConnectRemote(){
	global $db_Connection;
	$DataBase = '';
	$Host = '';
	$User_Database_Name = '';
	$User_Pass = '';
	$Database_Name = $DataBase;
	$db_Connection = new MySQL();
	$db_Connection->MySQLc($Host, $User_Database_Name, $User_Pass, $Database_Name);
}

function customConnect($data){
	global $db_Connection;
	$DataBase = $data["db"];
	$Host = $data["host"];
	$User_Database_Name = $data["usr"];
	$User_Pass = $data["pwd"];
	$db_Connection = new MySQL();
	$db_Connection->MySQLc($Host, $User_Database_Name, $User_Pass, $DataBase);
}

?>
