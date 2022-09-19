<?php
if (!defined('included')) {
    header('HTTP/1.0 404 Not Found');
    die;
}
function POST_ONLY()
{
    if ('POST' != $_SERVER['REQUEST_METHOD']) {
        header('Allow: POST');
        header('HTTP/1.1 405 Method Not Allowed');
        header('Content-Type: text/plain');
        echo "only allow post request";
        exit;
    }
}
function GET_ONLY()
{
    if ('GET' != $_SERVER['REQUEST_METHOD']) {
        header('Allow: GET');
        header('HTTP/1.1 405 Method Not Allowed');
        header('Content-Type: text/plain');
        echo "only allow get request";
        exit;
    }
}
