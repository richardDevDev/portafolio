<?php
/*
 * Created by (c)danidoble 2021.
 */

namespace Danidoble\Interfaces;

use Danidoble\Build;

/**
 * @Interface IDanidoble
 * @author danidoble <Daniel Sandoval>
 */
interface IDanidoble
{
    /**
     * @return array
     */
    public function getCredits(): array;

    /**
     * @return mixed
     */
    public function getMessage();

    /**
     * @param $value
     * @return Build
     */
    public function SetMessage($value): Build;

    /**
     * @return mixed
     */
    public function getAction();

    /**
     * @param $value
     * @return Build
     */
    public function SetAction($value): Build;

    /**
     * @return mixed
     */
    public function getNo();

    /**
     * @param $value
     * @return Build
     */
    public function SetNo($value): Build;

    /**
     * @return mixed
     */
    public function getType();

    /**
     * @param $value
     * @return Build
     */
    public function SetType($value): Build;

    /**
     * @return mixed
     */
    public function getError();

    /**
     * @param $value
     * @return Build
     */
    public function SetError($value): Build;

    /**
     * @return mixed
     */
    public function getErrors();

    /**
     * @param $value
     * @return Build
     */
    public function SetErrors($value): Build;

    /**
     * @param null $no
     * @param null $message
     * @param null $type
     * @param null $action
     * @param null $error
     * @param null $errors
     */
    public function __construct($no = null, $message = null, $type = null, $action = null, $error = null, $errors = null);

    /**
     * @return false|string
     */
    public function __toString();

    /**
     * @return Build
     */
    public function __invoke(): Build;

    /**
     * @param string $name
     * @param $value
     */
    public function __set(string $name, $value): void;

    /**
     * @param string $name
     * @return mixed
     */
    public function __get(string $name);

    /**
     * @param string $name
     * @return bool
     */
    public function __isset(string $name): bool;

    /**
     * @param string $name
     */
    public function __unset(string $name): void;

    /**
     * @param null $no
     * @param null $message
     * @param null $type
     * @param null $action
     */
    public function bind($no = null, $message = null, $type = null, $action = null): void;
}