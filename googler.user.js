// ==UserScript==
// @name         googler
// @namespace    http://tampermonkey.net/
// @version      0.9
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
    $('head').append(`<style type="text/css">
.hi1 { background-color: rgba(255,0,0,0.25)}
.hi2 { background-color: rgba(255,165,0,0.25)}
.hi3 { background-color: rgba(255,255,0,0.25)}
.hi4 { background-color: rgba(0,128,0,0.25)}
.hi5 { background-color: rgba(0,0,255,0.25)}
.hi6 { background-color: rgba(75,0,130,0.25)}
.hi7 { background-color: rgba(238,130,238,0.25)}
</style>`);

    var options = {
        "accuracy": "partially",
        "acrossElements": true,
        "separateWordSearch": false,
        "ignorePunctuation": "?:;.,-–—‒_(){}[]!'\"+=".split("")
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
    let ctn, solid, mix;
    $(parent).css({"position": "relative"});
    ctn = document.createElement("div");
    $(parent).append(ctn);
    $(ctn).css({"position": "absolute", "right": "0", "top": "0", "width": "auto"});

    solid = document.createElement("input");
    solid.type = "radio";
    solid.name = 'hilite';
    solid.value = 'solid';

    solid.onclick = () => {
        sessionStorage.setItem("hilite", "solid");
        searchform.submit();
    }

    $(ctn).append("<label for='radio' style='right: -30px; position: absolute;'>solid</label>");
    $(ctn).append(solid);
    $(solid).css({"border":"1px solid red", "position": "absolute", "right": "0", "top": "0"});

    mix = document.createElement("input");
    mix.type = "radio";
    mix.name = 'hilite';
    mix.value = 'mix';
    mix.onclick = () => {
        sessionStorage.setItem("hilite", "mix");
        searchform.submit();
    }
    var hi = sessionStorage.getItem("hilite");
    if(!hi || hi == "solid") {
        solid.checked = true;
    } else {
        mix.checked = true;
    }


    $(ctn).append("<label for='radio' style='top: 20px; right: -25px; position: absolute;'>mix</label>");
    $(ctn).append(mix);
    $(mix).css({"border":"1px solid red", "position": "absolute", "right": "0", "top": "20px"});

    if(q) {
        if(solid.checked) {
            instance.mark(q, options);
            q = q.split(" ");

            q.map(w => {
                if(w.length >= 3) {
                    instance.mark(w, {
                        ...options
                    });
                }
            });
        } else {
            q = q.split(" ");
            q = q.filter(w => w.length > 0);
            q.map((w,i) => {
                if(w.length >= 3) {
                    instance.mark(w, {
                        ...options,
                        "className": `hi${i+1}`,
                    });
                }
            });
        }
    }


    $(parent).on("keydown", (e) => {
        if(e.keyCode == 13) {
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
