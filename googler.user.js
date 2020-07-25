// ==UserScript==
// @name         googler
// @namespace    http://tampermonkey.net/
// @version      0.6
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
    let triggers = {
        "a": "area",
        "d": "definition",
        "e": "etymology",
        "f": "flag",
        "i": "image",
        "p": "population",
        "bd": "birthday",
        "fs": "founders",
        "fw": "founded when",
        "hm": "how many",
        "ig": "instagram followers",
        "rd": "release date",
        "tw": "twitter followers"
    }

    let exp = []
    for(let key in triggers){
        if (triggers.hasOwnProperty(key)) {
            exp.push(key)
        }
    }
    let regexp = new RegExp("\\b" + `(${exp.join("|")})` + "\\b", "gi");

    var searchform = $("#searchform").find('form');
    var parent = searchform.length > 0 ? searchform : $("#sf")
    $(parent).on("keydown", (e) => {
        if(e.keyCode == 13) {
            //console.log(e.keyCode)
            let search = $(e.target).val()

            if(search.match(regexp)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                for(let key in triggers) {
                    if (triggers.hasOwnProperty(key)) {
                        if(key == "i" && search.match(/\bi\b$/gi)) {
                            break;
                        } else {
                            search = search.replace(new RegExp(`\\b` + key + `\\b$`, `gi`), triggers[key]);
                        }
                    }
                }
                if(search.match(/\bi\b$/gi)) {
                    console.log('img')
                    search = search.replace(/\bi\b$/gi, "").trim();
                    window.location.href = `https://www.google.com/search?q=${search}&tbm=isch`;

                } else {
                    $(e.target).val(search)
                    if($("#sf").length > 0) {
                        window.location.href = `https://www.google.com/search?q=${search}`;
                    } else {
                        searchform.submit();
                    }
                }
            } else {
                searchform.submit();
            }
        }
    })
});
