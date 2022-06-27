<?php
/*
 * Created by (c)danidoble 2021.
 */

namespace Danidoble;

use Danidoble\Interfaces\IDanidoble;
use ErrorException;


/**
 * Class Build
 * @package Danidoble\Build
 * @author danidoble <Daniel Sandoval>
 * @internal
 */
class Build implements IDanidoble
{
    public $message, $no, $type, $action, $error, $errors;
    protected $_danidoble;

    /**
     * @param null $no
     * @param null $message
     * @param null $type
     * @param null $action
     * @param null $error
     * @param null $errors
     */
    public function __construct($no = null, $message = null, $type = null, $action = null, $error = null, $errors = null)
    {
        $this->_danidoble = [
            'credits' => 'Created by danidoble.',
            'github' => 'https://github.com/danidoble',
            'website' => 'https://danidoble.com',
        ];
        $this->bind($no, $message, $type, $action, $error, $errors);
    }

    /**
     * @param null $no
     * @param null $message
     * @param null $type
     * @param null $action
     */
    public function bind($no = null, $message = null, $type = null, $action = null, $error = null, $errors = null): void
    {
        if ($no !== null) {
            $this->no = $no;
        } else {
            unset($this->no);
        }
        if ($message !== null) {
            $this->message = $message;
        } else {
            unset($this->message);
        }
        if ($type !== null) {
            $this->type = $type;
        } else {
            unset($this->type);
        }
        if ($action !== null) {
            $this->action = $action;
        } else {
            unset($this->action);
        }
        if ($error !== null) {
            $this->error = $error;
        } else {
            unset($this->error);
        }
        if ($errors !== null) {
            $this->errors = $errors;
        } else {
            unset($this->errors);
        }

    }

    /**
     * @return false|string
     */
    public function __toString()
    {
        $data = json_decode(json_encode($this));
        if (isset($this->message)) {
            $data->message = $this->message;
        }
        if (isset($this->no)) {
            $data->no = $this->no;
        }
        if (isset($this->type)) {
            $data->type = $this->type;
        }
        if (isset($this->action)) {
            $data->action = $this->action;
        }
        if (isset($this->error)) {
            $data->error = $this->error;
        }
        if (isset($this->errors)) {
            $data->errors = $this->errors;
        }

        return json_encode($data);
    }

    /**
     * @return Build
     */
    public function __invoke(): Build
    {
        return $this;
    }

    /**
     * @param string $name
     * @param $value
     * @throws ErrorException
     */
    public function __set(string $name, $value): void
    {
        if ($name === '_danidoble') {
            throw new ErrorException("You cannot modify this property", 500);
        }
        $this->{$name} = $value;
    }

    /**
     * @param string $name
     * @return null
     * @throws ErrorException
     */
    public function __get(string $name)
    {
        if ($name === '_danidoble') {
            throw new ErrorException("Can't view this protected property, use getCredits(), to access", 500);
        }
        if (isset($this->{$name})) {
            return $this->{$name};
        }
        return null;
    }

    /**
     * @param string $name
     * @return bool
     */
    public function __isset(string $name): bool
    {
        if (isset($this->name)) {
            return true;
        }
        return false;
    }

    /**
     * @throws ErrorException
     */
    public function __unset(string $name): void
    {
        if ($name === '_danidoble') {
            throw new ErrorException("You cannot delete this property", 500);
        }
        unset($this->{$name});
    }

    /**
     * @return array
     */
    public function getCredits(): array
    {
        return $this->_danidoble;
    }

    /**
     * @return mixed
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * @param $value
     * @return Build
     */
    public function SetMessage($value): Build
    {
        $this->message = $value;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getAction()
    {
        return $this->action;
    }

    /**
     * @param $value
     * @return Build
     */
    public function SetAction($value): Build
    {
        $this->action = $value;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getNo()
    {
        return $this->no;
    }

    /**
     * @param $value
     * @return Build
     */
    public function SetNo($value): Build
    {
        $this->no = $value;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param $value
     * @return Build
     */
    public function SetType($value): Build
    {
        $this->type = $value;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getError()
    {
        return $this->error;
    }

    /**
     * @param $value
     * @return Build
     */
    public function SetError($value): Build
    {
        $this->error = $value;
        return $this;
    }

    /**
     * @return mixed
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * @param $value
     * @return Build
     */
    public function SetErrors($value): Build
    {
        $this->errors = $value;
        return $this;
    }

}