<?php
	session_start();
	define('ROOT_PATH',dirname(dirname(__DIR__)));
	define('APP_PATH',ROOT_PATH."/application");
	define('PUBLIC_PATH',ROOT_PATH."/public");
	define('CORE',APP_PATH."/core");
	define('CONFIG',APP_PATH."/config");
	define('VIEW',APP_PATH."/template");
	define('ROOT_URL',"/leotek_dashboard");
	define('IMG_URL',ROOT_URL."/img");
	define('CSS_URL',ROOT_URL."/css");
	define('JS_URL',ROOT_URL."/js");

	