$(function() {
    "use strict";
    $('form[disabled]').find('input').attr('disabled', true);
    $('form[disabled]').find('select').attr('disabled', true);
    $('form[disabled]').find('textarea').attr('disabled', true);
});