<?php

/**
 *
 */
class routes
{

	function dirServer()
	{
		$expS = str_replace(" ", "", "\ ");
		$res = explode($expS, __FILE__);
		$documentRoot = $_SERVER["DOCUMENT_ROOT"] . "/" . $res[3];
		$localDir = $documentRoot;
		return $localDir;
	}

	function dirSections()
	{
		//direccion http con '/' siempre al final
		$servidor = "";
		return $servidor;
	}

	function dirIncludes()
	{
		$base = rtrim(str_replace('\\app\\config', '', str_replace('/app/config', '', __DIR__)), '/') . '/';
		return $base;
	}
}
