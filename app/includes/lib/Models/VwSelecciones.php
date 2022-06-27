<?php

namespace Site\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VwSelecciones extends Model
{
    //if you don't want 'deleted_at' in your table comment this line
    //use SoftDeletes;

    public $timestamps = false;
    protected $table = "vw_selecciones";
    protected $primaryKey = "id_seleccion";

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [

    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [

    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        //'created_at' => 'datetime',
        //'updated_at' => 'datetime',
    ];

}