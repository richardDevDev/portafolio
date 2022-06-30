<?php
include_once "app/autoloader.php";
?>
<html lang="es">

<head>
    <title>Ricardo Mandujano | Web Developer Full Stack</title>
    <?php $sections->css(); ?>
</head>

<nav class="navbar navbar-expand-lg navbar-light">
    <div class="container-fluid fs-5">
        <a class="navbar-brand" href="#"><img class="img__logo" src="app/assets/img/RMC.png" alt=""></a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="nav justify-content-end" id="navbarText">
            <ul class="navbar-nav me-auto mb-3 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">Home</a>
                </li>
                <li class="nav-item">
                    <button type="button" class="btn btn-outline-light fs-5 img__nav">Say Hello</button>
                </li>
            </ul>
        </div>
    </div>
</nav>
<main>
    <div class="container col-16 mt-5">
        <div class="row text-center title">
            <h1>Hi! my name is Richard Mandujano.</h1>
            <p class="fs-5">
                I'm a FullStack Web Developer and UI/UX javascript specialist.
            </p>
        </div>

        <div class="row img__title text-center">
            <img class="" src="app/assets/img/RMC.png" alt="">
        </div>

    </div>
</main>

<body>
</body>

</html>

<style>
    .img__logo {
        width: 70px;
        margin-left: 30px;
    }

    h1 {
        color: #CB0000;
    }

    p {
        color: #CB0000;
    }

    .btn {
        border-radius: 20px;
    }

    .container {
        border: 0px solid #000;
    }

    .title {
        border-top: 0px solid #CB0000;
        border-bottom: 0px solid #CB0000;
    }

    .bg-light {
        background: transparent;
    }

    .img__title {
        width: 300px;
        margin: auto;
        border-radius: 20px;
    }

    .link.active {
        color: #CB0000;
    }
 
    .btn-outline-light {
    color: #CB0000;
    background-color: transparent;
    background-image: none;
    border-color: #cb0000;
}
</style>