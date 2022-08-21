<?php
include_once "app/autoloader.php";
?>
<html lang="es">

<head>
    <title>Ricardo Mandujano | Web Developer Full Stack</title>
    <?php $sections->css(); ?>
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container-fluid fs-5">
            <a class="navbar-brand" href="#"><img class="img__logo" src="app/assets/img/RMC.png" alt=""></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="nav justify-content-end" id="navbarText">
                <ul class="nav nav-pills  me-auto mb-3 mb-lg-0">
                    <select class="nav-item link-light border-0 mr-3 text-black rounded-pill p-2 select" name="" id="">
                        <option value="Es">&#x1F1F2;&#x1F1FD;
                            Español</option>
                        <option value="En">🇺🇸 English</option>
                    </select>
                    <li class="nav-item">
                        <a class="nav-link link-light mr-3" aria-current="page" href="#">Home</a>
                    </li>
                    <li class="nav-item">
                        <button type="button" class="btn btn-outline-light fs-5 rounded-pill border-3">Say Hello</button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <main>
        <div class="container col-16 mt-5">
            <div class="row text-center title mt-3">
                <h1 class="mt-4">Hi! my name is Richard Mandujano.</h1>
                <p class="fs-5 fs-xs-6 text-justify col-xs-12 col-sm-12 col-md-8 offset-sm-1 offset-md-2">
                    I'm a FullStack Web Developer and UI/UX javascript specialist.
                    I design applications, digital products, websites, and brand identities.
                    I'm here to help turn your dreams and ideas into focused clear products.
                </p>
            </div>

            <div class="row  text-center mt-5">
                <img class="img__title" src="app/assets/img/fondo.png" alt="">
            </div>

            <div class="row  text-center mt-5 col-8 offset-4">
                <img class="" src="app/assets/img/img lang.png" alt="">
            </div>

        </div>
    </main>
    <div class="container2 col-16 ">
        <div class="row text-center title">
            <h1 class="anim-typewriter line-1">Hi! my name is Richard Mandujano.</h1>
            <p class="fs-5 col-8 offset-4">
                I'm a FullStack Web Developer and UI/UX javascript specialist.
                I design applications, digital products, websites, and brand identities.
                I'm here to help turn your dreams and ideas into focused clear products.
            </p>
        </div>

        <div class="row img__title text-center mt-5">
            <img class="" src="app/assets/img/fondo.png" alt="">
        </div>

        <div class="row  text-center mt-5 col-8 offset-4">
            <img class="" src="app/assets/img/programacion-web.png" alt="">
        </div>

    </div>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>

</body>

</html>

<style>
    .animated-gradient-text_foreground__kb6tN {
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        padding-left: var(--padding);
        padding-right: var(--padding);
        background-image: linear-gradient(90deg, var(--start-color), var(--end-color));
        position: relative;
        z-index: 1;
    }

    .img__logo {
        width: 70px;
        margin-left: 30px;
    }

    p {
        color: #fff;
    }

    option {
        background: transparent;
        color: #000;
    }

    body {
        border: 0px solid #000;
        background-image: linear-gradient(113.3deg, rgba(217, 9, 27, 1) 6.9%, rgba(22, 68, 150, 1) 75%);
        color: #fff;
    }

    .container2 {
        background: #fff;
        color: #000;
    }

    select {
        background: transparent;
    }

    h1 {
        border: none;
        font: 40px;
        text-align: center;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        color: #fff;

    }

    .bg-light {
        background: transparent;
    }

    .img__title {
        width: 300px;
        margin: auto;
        border-radius: 20px;
        cursor: pointer;
    }

    .img__title:hover {
        -webkit-transform: rotateY(180deg);
        -webkit-transform-style: preserve-3d;
        transform: rotateY(180deg);
        transform-style: preserve-3d;
    }

    .link .active {
        color: #000;
    }



    .navbar-light .navbar-nav .nav-link {
        color: #2c6bf7;
        padding: 10px 20px;
    }

    .anim-typewriter {
        animation: typewriter 4s steps(44) 1s 1 normal both,
            blinkTextCursor 500ms steps(44) infinite normal;
    }

    .line-1 {
        position: relative;
        top: 50%;
        margin: 0 auto;
        border-right: 2px solid transparent;
        font-size: 180%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        transform: translateY(-50%);
    }
</style>