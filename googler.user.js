// ==UserScript==
// @name         googler
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  nothing to see here
// @author       burger
// @match        https://www.google.com/*
// @match        https://www.bing.com/*
// @grant        GM_addStyle
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js
// ==/UserScript==

/* eslint-disable */
GM_addStyle(`
.Oh5wg .PZPZlf div {
  margin-bottom: 12px !important;
  max-height: initial;
}
.Oh5wg div.OULBYb {
  display: none;
}
.Oh5wg div.u7wWjf {
  display: block;
}
.xpdxpnd {
  max-height: initial;
}
.hi1 { background-color: rgba(255,0,0,0.25)}
.hi2 { background-color: rgba(255,165,0,0.25)}
.hi3 { background-color: rgba(255,255,0,0.25)}
.hi4 { background-color: rgba(0,128,0,0.25)}
.hi5 { background-color: rgba(0,0,255,0.25)}
.hi6 { background-color: rgba(75,0,130,0.25)}
.hi7 { background-color: rgba(238,130,238,0.25)}
`);
$().ready(()=>{
    'use strict';
    var x = document.getElementsByTagName("g-text-expander");
    if(x && x[0] && x[0].children[0] && x[0].children[0].innerText == "More") {
        x[0].children[0].click();
    }
    var urlParams = new URLSearchParams(window.location.search);
    var q = urlParams.get('q')
    var prepend1 = urlParams.get('prepend1');
    var prepend2 = urlParams.get('prepend2');
    var prepend3 = urlParams.get('prepend3');
    var fork = urlParams.get('fork');
    var forkw;
    var w = urlParams.get('width');
    var height = urlParams.get('height');
    var left = urlParams.get('left');
    var offset = urlParams.get('offset');
    var imgoffset = left == "true" ? 0 : Number(w) + Number(offset);
    /*if(prepend1 || prepend2 || prepend3 ){
        if(fork) {
            forkw = window.open(`https://www.google.com/search?q=${prepend1||prepend2||prepend3}&tbm=isch`, `forkw`, `width=${w},height=${height},left=${imgoffset}`);
        }
    }*/

    if(prepend1) {
        $('#tsf').find("input").val(prepend1 + " ")
    }
    if(prepend2) {
        $('#tsf').find("input").val(prepend2 + " ")
    }
    if(prepend3) {
        $('#tsf').find("input").val(prepend3 + " ")
    }

    var instance = new Mark(document.querySelector("*"));
    var options = {
        "accuracy": "partially",
        "acrossElements": true,
        "separateWordSearch": false,
        "ignorePunctuation": "?:;.,-–—‒_(){}[]!'\"+=".split("")
    }

    let triggers = {
        "a": "area",
        "b": "bordering",
        "c": "coordinates",
        "d": "definition",
        "e": "etymology",
        "f": "flag",
        "i": "image",
        "l": "lyrics",
        "m": "map",
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
    let ctn, off, solid, mix;
    $(parent).css({"position": "relative"});
    ctn = document.createElement("div");
    $(parent).append(ctn);
    $(ctn).css({"position": "absolute", "right": "0", "top": "0", "width": "auto"});

    off = document.createElement("input");
    off.type = "radio";
    off.name = 'hilite';
    off.value = 'off';
    off.onclick = () => {
        sessionStorage.setItem("hilite", "off");
        searchform.submit();
    }
    $(ctn).append("<label for='radio' style='right: -70px; position: absolute;white-space: nowrap;'>highlight off</label>");
    $(ctn).append(off);
    $(off).css({"border":"1px solid red", "position": "absolute", "right": "0", "top": "0"});

    solid = document.createElement("input");
    solid.type = "radio";
    solid.name = 'hilite';
    solid.value = 'solid';
    solid.onclick = () => {
        sessionStorage.setItem("hilite", "solid");
        searchform.submit();
    }
    $(ctn).append("<label for='radio' style='top: 20px; right: -70px; position: absolute;white-space: nowrap;'>highlight on</label>");
    $(ctn).append(solid);
    $(solid).css({"border":"1px solid red", "position": "absolute", "right": "0", "top": "20px"});

    /*mix = document.createElement("input");
    mix.type = "radio";
    mix.name = 'hilite';
    mix.value = 'mix';
    mix.onclick = () => {
        sessionStorage.setItem("hilite", "mix");
        searchform.submit();
    }
    $(ctn).append("<label for='radio' style='top: 40px; right: -30px; position: absolute;'>mix</label>");
    $(ctn).append(mix);
    $(mix).css({"border":"1px solid red", "position": "absolute", "right": "0", "top": "40px"});*/

    var hi = sessionStorage.getItem("hilite");
    if(!hi || hi == "solid") {
        solid.checked = true;
    } else {
        off.checked = true;
    }

    if(q && solid.checked) {
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

    var openImgW = (search) => {
        if(fork) {
            forkw = window.open(`https://www.google.com/search?q=${search}&tbm=isch`, `forkw`, `width=${w},height=${height},left=${imgoffset}`);
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
                    openImgW(search);
                    setTimeout(()=>{
                        window.location.href = `https://www.google.com/search?q=${search}&tbm=isch`;
                    },100);


                } else {
                    $(e.target).val(search)
                    if($("#sf").length > 0) {
                        openImgW(search);
                        window.location.href = `https://www.google.com/search?q=${search}`;
                    } else {
                        openImgW(search);
                        searchform.submit();
                    }
                }
            } else {
                openImgW(search);
                searchform.submit();
            }
        }
    })

    window.onbeforeunload = function(){
        if(forkw) {
            //forkw.close();
            //forkw = null;
        }
    };
});
