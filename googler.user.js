// ==UserScript==
// @name         googler
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  nothing to see here
// @author       burger
// @match        https://www.google.com/*
// @match        https://www.bing.com/*
// @grant        none
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js
// ==/UserScript==

/* eslint-disable */
$().ready(()=>{
    'use strict';
    var urlParams = new URLSearchParams(window.location.search);
    var q = urlParams.get('q')
    var instance = new Mark(document.querySelector("*"));
    var options = {
        "className": "highlight",
        "accuracy": "partially",
        "acrossElements": true,
        "separateWordSearch": false,
        "ignorePunctuation": "?:;.,-–—‒_(){}[]!'\"+=".split("")
    }

    if(q) {
        instance.mark(q, options);
        q = q.split(" ");

        q.map(w => {
            if(w.length >= 3) {
                instance.mark(w, options);
            }
        });
    }
    var parent = $("#searchform").find('form') || $("#sf")
    $(parent).on("keydown", (e) => {
        if(e.keyCode == 13) {
            //console.log(e.keyCode)
            let search = $(e.target).val()
            let triggers = new RegExp("\\b" + "(i|e|a|hm|f|p|bd|rd|ig|tw)" + "\\b", "gi");
            if(search.match(triggers)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if(search.match(/\bi\b$/gi)) {
                    search = search.replace(/\bi\b$/gi, "").trim();
                    window.location.href = `https://www.google.com/search?q=${search}&tbm=isch`;
                }
                else {
                    search = search.replace(/\be\b$/gi, "etymology");
                    search = search.replace(/\ba\b$/gi, "area");
                    search = search.replace(/\bhm\b$/gi, "how many");
                    search = search.replace(/\bf\b$/gi, "flag");
                    search = search.replace(/\bp\b$/gi, "population");

                    search = search.replace(/\bbd\b$/gi, "birthday");
                    search = search.replace(/\brd\b$/gi, "release date");
                    search = search.replace(/\bigd\b$/gi, "instagram followers");
                    search = search.replace(/\btw\b$/gi, "twitter followers");

                    $(e.target).val(search)
                    $("#searchform").find('form').submit();
                }
            } else {
                $("#searchform").find('form').submit();
            }
        }
    })
});
