// ==UserScript==
// @name         googler
// @namespace    http://tampermonkey.net/
// @version      3.6
// @description  nothing to see here
// @author       burger
// @match        https://www.google.com/*
// @match        https://www.bing.com/*
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/mark.js/8.11.1/mark.min.js
// @require https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @exclude    https://www.google.com/sorry*
// @exclude    https://www.google.com/recaptcha*

// @resource   IMPORTED_CSS https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css
// @grant      GM_getResourceText
// @grant      GM_addStyle
// ==/UserScript==

/* eslint-disable */
const my_css = GM_getResourceText("IMPORTED_CSS");
GM_addStyle(my_css);
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

.ui-dialog{
font-family: "Consolas", Arial, sans-serif;
z-index: 9999;
font-weight:600;
position: fixed;
}

#dialog {
min-height: unset !important;
font-size:12px;
padding:0 5px;
line-height: 15px;
}

.no-close .ui-dialog-titlebar-close {
  background-color:#ccc;
  font-family: "Consolas", Arial, sans-serif;
  font-weight: 600;
line-height:0px;
}

.no-close .ui-button-icon-only {
text-indent:0;
}

input[value=off], input[value=on] {
display:block;
position:relative;
left: -5px;
line-height:12px;
white-space: nowrap !important;
}

input[value=off]:after{
content: 'highlight off';
white-space: nowrap !important;
margin-left: 15px;
font-weight: 600;
font-family: "Consolas", Arial, sans-serif;
font-size:12px;
color: #333333;
}

input[value=on]:after{
content: 'highlight on';
white-space: nowrap !important;
margin-left: 15px;
font-weight: 600;
font-family: "Consolas", Arial, sans-serif;
font-size:12px;
color: #333333;
}
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
    var tbm = urlParams.get('tbm');

    var imgoffset = left == "true" ? 0 : Number(w) + Number(offset);
    /*if(prepend1 || prepend2 || prepend3 ){
        if(fork) {
            forkw = window.open(`https://www.google.com/search?q=${prepend1||prepend2||prepend3}&tbm=isch`, `forkw`, `width=${w},height=${height},left=${imgoffset}`);
        }
    }*/
    if(prepend1) {
        $('input[name=q]').val(prepend1 + " ");
    }
    if(prepend2) {
        $('input[name=q]').val(prepend2 + " ");
    }
    if(prepend3) {
        $('input[name=q]').val(prepend3 + " ");
    }


    var instance = new Mark(document.querySelector("*"));
    var options = {
        "accuracy": "partially",
        "acrossElements": true,
        "separateWordSearch": false,
        "ignorePunctuation": "?:;.,-–—‒_(){}[]!'\"+=".split(""),
        "exclude": [".ui-dialog, #dialog"]
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
    let ctn, off, solid, mix;

    $("body").append(`<div id="dialog" title="Dialog Title">
        a: area<br/>
        b: bordering<br/>
        c: coordinates<br/>
        d: definition<br/>
        e: etymology<br/>
        f: flag<br/>
        i: image<br/>
        l: lyrics<br/>
        m: map<br/>
        p: population<br/><br/>
        bd: birthday<br/>
        fs: founders<br/>
        fw: founded when<br/>
        hm: how many<br/>
        ig: instagram followers<br/>
        rd: release date<br/>
        tw: twitter followers<br/><br/>
</div>`);
    ctn = document.createElement("div");
    $("#dialog").append(ctn);
    $(ctn).css({"position": "relative", "width": "auto"});

    off = document.createElement("input");
    off.type = "radio";
    off.name = 'hilite';
    off.value = 'off';
    off.onclick = () => {
        localStorage.setItem("hilite", "off");
        searchform.submit();
    }
    $(ctn).append(off);

    solid = document.createElement("input");
    solid.type = "radio";
    solid.name = 'hilite';
    solid.value = 'on';
    solid.onclick = () => {
        localStorage.setItem("hilite", "on");
        searchform.submit();
    }
    $(ctn).append(solid);

    var dragposition;
    var dialogclosed = sessionStorage.getItem("dialogclosed");
    $("#dialog").dialog({
        autoOpen: dialogclosed ? false : (tbm && tbm.match(/isch/gi) ? false : true),
        dialogClass: "no-close",
        title: `shorties ${GM_info.script.version}`,
        closeText: "x",
        width: 210,
        dragStop: function( event, ui ) {
            localStorage.setItem("dialogposition", JSON.stringify(ui.position))
            console.log(ui.position)
        },
        position: { my: "left top", at: "right top", of: window },
        open: function( event, ui) {
            var cl = $(".ui-dialog").find(".ui-dialog-titlebar-close");
            var col = $(cl).clone();
            col.insertBefore(cl)
            col.css({"right":"30px"})
            col.html("-");
            col.on("click", ()=>{
                if(!$("#dialog").hasClass("collapsed")) {
                    col.html("+");
                    sessionStorage.setItem("dialogmin", "true");
                    $("#dialog").addClass("collapsed").animate({"height":"0"}, {duration: 150});
                } else {
                    col.html("-");
                    sessionStorage.setItem("dialogmin", "false");
                    $("#dialog").removeClass("collapsed").css({"height":"auto"});
                }
            });
            if(sessionStorage.getItem("dialogmin") == "true") {
                col.html("+");
                $("#dialog").addClass("collapsed").animate({"height":"0"}, {duration: 0});
            }

            $('input[name=q]').focus();
            var tmpStr = $('input[name=q]').val();
            $('input[name=q]').val('');
            $('input[name=q]').val(tmpStr);
            return false;
        },
        close: function() {
            sessionStorage.setItem("dialogclosed", "true");
        }
    });

    setTimeout(()=>{
        var dialogposition = localStorage.getItem("dialogposition")
        if(dialogposition) {
            dialogposition=JSON.parse(dialogposition);
            var w = parseInt($('.ui-dialog').css("width"));
            var h = parseInt($('.ui-dialog').css("height"));
            var tw = w + dialogposition.left;
            var th = h + dialogposition.top;
            $('.ui-dialog').css({
                top: `${th > window.innerHeight ? window.innerHeight - h - 20 : dialogposition.top}px`,
                left: `${tw > window.innerWidth ? window.innerWidth - w - 20 : dialogposition.left}px`
        });
    } else {
        $('.ui-dialog').css({
            left: `${parseInt($('.ui-dialog').css("left")) - 10}px`
        })
    }
    }, 100);



    var hi = localStorage.getItem("hilite");
    if(!hi || hi == "on") {
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
