// ==UserScript==
// @name         persephone
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.ext-twitch.tv/*
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @grant      GM_addStyle
// ==/UserScript==
/* global $ */

$().ready(function() {
    'use strict';
    GM_addStyle(`

#inputscont {
position: absolute;
top:0;
left:0;
background-color: rgba(0,0,0,0.5);
zright: 0;
zheight: 100px;
}

#bing, #quotes {
line-height: 15px;
height: 15px;
display: flex;
align-items:center;
}

#bing:after {
content: 'use bing';
color: white;
font-weight:bold;
white-space: nowrap;
margin-left: 15px;
font-size: 12px;
}

#quotes:after {
content: 'qoutes';
color: white;
font-weight:bold;
white-space: nowrap;
margin-left: 15px;
font-size: 12px;
}

#layer, #roles {
color: white;
font-weight:bold;
font-size: 12px;
}
input[name^="layer"], input[name^="role"] {
padding: 0;
margin: 0 0 0 5px;
}
#searchtype {
display:block;
font-size: 10px;
padding:0;
margin:0;
}
.f9 {
color: white;
font-weight:bold;
font-size: 10px;
}
`);

    var questionClass = ".trivia-question", answerClass="trivia-answer";
    var q, ans, qencoded, op1 = null, op2 = null, op3 = null, op4 = null, layer=null, tester = null, searchtype=null, cycle=null;
    var words = null, ans1 = null, ans2 = null, ans3 = null, ans4 = null, uk=null, mainprefix = null, prefix={}, suffix={};
    var radioall, radioimg, radiomap, bing, google, quotes= null;
    var output, db;
    var btns, force, lock, combine = {}, birthday, age, death, young, capacity, opening, closing, dateof, release, phone, flag, lat, founder, cont;
    var scrabble;
    var currentRoute;
    var lastq = "", lastans1 = "", lastans2 = "", lastans3 = "", lastans4 = "";
    var w = 700;
    var deviceHeight = screen.height - 100;
    var deviceWidth = screen.width;
    var bottomrow = 640;
    var urlImages = {};
    var urlAll = {};
    var testq=1;
    var cookieappend = `;path=/;max-age=31556952`;
    prefix.value ="";
    suffix.value ="";
    combine.checked = true;
    var openwindows = () => {
        if(!words && layer.checked) {
            if(searchtype.value == "manualoption" || searchtype.value == "manualquestion") {
                words = window.open('https://www.google.com/', 'words', "width=1030, height="+deviceHeight+", left=0");
            } else {
                words = window.open('https://www.google.com/', 'words', "width=1030, height="+deviceHeight+", left=2400");
            }
        }
        if(!ans1 && op1.checked && searchtype && searchtype.value == "auto") {
            ans1 = window.open('https://www.google.com/', 'ans1', "width="+w+", height="+bottomrow)
        }
        if(!ans2 && op2.checked && searchtype && searchtype.value == "auto") {
            ans2 = window.open('https://www.google.com/', 'ans2', "width="+w+", height="+bottomrow+", left="+(w+1))
        }
        if(!ans3 && op3.checked && searchtype && searchtype.value == "auto") {
            ans3 = window.open('https://www.google.com/', 'ans3', "width="+w+", height="+bottomrow+", top=700")
        }
        if(!ans4 && op4.checked && searchtype && searchtype.value == "auto") {
            ans4 = window.open('https://www.google.com/', 'ans4', "width="+w+", height="+bottomrow+", top=700, left="+(w+1))
        }
    }
    var closewindows = () => {
        if(words) {
            words.close();
            words=null;
        }
        if(ans1) {
            ans1.close();
            ans1=null;
        }
        if(ans2) {
            ans2.close();
            ans2=null;
        }
        if(ans3) {
            ans3.close();
            ans3=null;
        }
        if(ans4) {
            ans4.close();
            ans4=null;
        }
    }
    window.onbeforeunload = function(){
        closewindows();
    };

    var createinputs = () => {
        if($("#inputscont").length == 0) {
            console.log('createinputs');
            var cookies = document.cookie || "";
            if($(".Trivia-Wrapper").length > 0) {
                $(".Trivia-Wrapper").prepend("<div id='inputscont'></div>");
            } else {
                $("body").prepend("<div id='inputscont'></div>");
            }

            bing = document.createElement("input");
            bing.id = "bing";
            bing.type = "checkbox";
            bing.name = 'bing';
            bing.value = 'bing';
            bing.checked = cookies && cookies.match(/nuekbing=true/gi) ? true : false;
            bing.onclick = (e) => {
                document.cookie = `nuekbing=${bing.checked}${cookieappend}`;
            };
            $("#inputscont").append(bing);

            quotes = document.createElement("input");
            quotes.id = "quotes";
            quotes.type = "checkbox";
            quotes.name = 'quotes';
            quotes.value = 'quotes';
            quotes.checked = cookies && cookies.match(/nuekquotes=true/gi) ? true : false;
            quotes.onclick = (e) => {
                document.cookie = `nuekquotes=${quotes.checked}${cookieappend}`;
            };
            $("#inputscont").append(quotes);

            $("#inputscont").append("<div id='layer'>layer</div>");
            layer = document.createElement("input");
            layer.type = "checkbox";
            layer.name = 'layer';
            layer.checked = cookies && cookies.match(/nueklayer=false/gi) ? false : true;
            layer.onclick = (e) => {
                document.cookie = `nueklayer=${layer.checked}${cookieappend}`;
            };
            $("#layer").append(layer);

            $("#inputscont").append("<div id='roles'>roles</div>");
            op1 = document.createElement("input");
            op1.type = "checkbox";
            op1.name = 'role';
            op1.checked = cookies && cookies.match(/nuekop1=false/gi) ? false : true;
            op1.onclick = (e) => {
                document.cookie = `nuekop1=${op1.checked}${cookieappend}`;
            };
            $("#roles").append(op1);

            op2 = document.createElement("input");
            op2.type = "checkbox";
            op2.name = 'role';
            op2.checked = true;
            op2.checked = cookies && cookies.match(/nuekop2=false/gi) ? false : true;
            op2.onclick = (e) => {
                document.cookie = `nuekop2=${op2.checked}${cookieappend}`;
            };
            $("#roles").append(op2);

            op3 = document.createElement("input");
            op3.type = "checkbox";
            op3.name = 'role';
            op3.checked = true;
            op3.checked = cookies && cookies.match(/nuekop3=false/gi) ? false : true;
            op3.onclick = (e) => {
                document.cookie = `nuekop3=${op3.checked}${cookieappend}`;
            };
            $("#roles").append(op3);

            op4 = document.createElement("input");
            op4.type = "checkbox";
            op4.name = 'role';
            op4.checked = true;
            op4.checked = cookies && cookies.match(/nuekop4=false/gi) ? false : true;
            op4.onclick = (e) => {
                document.cookie = `nuekop4=${op4.checked}${cookieappend}`;
            };
            $("#roles").append(op4);

            searchtype = document.createElement("select");
            searchtype.id="searchtype";

            searchtype.onchange = () => {
                console.log(searchtype.value)
                document.cookie = `nuekselect=${searchtype.value}${cookieappend}`;
            }
            $("#inputscont").append(searchtype);

            var option = document.createElement("option");
            option.text = "auto option + question";
            option.value = "auto";
            searchtype.add(option);

            option = document.createElement("option");
            option.text = "{option} + {input}";
            option.value = "manualoption";
            searchtype.add(option);

            option = document.createElement("option");
            option.text = "{question} + {input}";
            option.value = "manualquestion";
            searchtype.add(option);
            searchtype.selectedIndex = cookies.match(/nuekselect=auto/gi) ? 0 : cookies.match(/nuekselect=manualoption/gi) ? 1 : 2;

            $("#inputscont").append(`<div class='f9'>F9 to preload windows</div>`);
            if($(".Trivia-Wrapper").length == 0 && $("#root").length > 0) {
                tester = document.createElement("button");
                tester.innerHTML = "test q";
                tester.onclick = (e) => {
                    openwindows();
                    if(cycle) {
                        clearInterval(cycle);
                    }
                    testinterval();
                };
                $("#inputscont").append(tester);

                tester = document.createElement("button");
                tester.style.margin = "0 0 0 10px";
                tester.innerHTML = "cycle q";
                tester.onclick = (e) => {
                    openwindows();
                    testinterval();
                    if(cycle) {
                        clearInterval(cycle);
                    }
                    cycle = setInterval(() => {
                         testinterval();
                    }, 3000);
                };
                $("#inputscont").append(tester);
            }
        }
    }

    var waitbody = setInterval(() =>{
        var x = document.querySelector("body");
        if(x) {
            clearInterval(waitbody);
            waitbody=null;
            createinputs();
            var observer = new MutationObserver(function() {
                //console.log('mutation');
                var origin = "", phrase = "", qtype = "", anagramorigin = "", venue="", ansqs = "";
                createinputs();
                q = document.querySelector(questionClass);
                ans = document.getElementsByClassName(answerClass);
                //console.log(q)
                //console.log(ans)
                if(currentRoute && currentRoute != window.location.href){
                    currentRoute = null;
                    document.body.classList.remove("hideoverflowY");
                }

                if(ans) {
                    ans = Array.from(ans);
                    ans.map((z, i) => {
                        ansqs += `&brg${i+1}=${encodeURIComponent(z.innerText)}`;
                    });
                }

                if(q && q.innerText && ans && lastq != q.innerText) {

                    qencoded = encodeURIComponent(q.innerText);
                    openwindows();
                    let googlebase = `https://www.google.com/search?q=`;
                    let bingbase = `https://www.bing.com/search?q=`;
                    let enginebase = bing && bing.checked ? bingbase : googlebase;
                    if(searchtype.value == "manualoption" || searchtype.value == "manualquestion") {
                        layer.checked = true;
                        enginebase = "https://www.google.com/webhp?&hl=en&"
                    }
                    if(words && layer && layer.checked) {
                        if(searchtype.value == "manualoption") {
                            let yourans = op1.checked && ans[0] ? `${ans[0].innerText}` :
                            op2.checked && ans[1] ? `${ans[1].innerText}` :
                            op3.checked && ans[2] ? `${ans[2].innerText}` :
                            op4.checked && ans[3] ? `${ans[3].innerText}` : '';
                            if(quotes.checked) {
                                yourans = `"${yourans}"`;
                            }
                            yourans = encodeURIComponent(yourans);
                            yourans = op1.checked && ans[0] ? `prepend1=${yourans}` :
                            op2.checked && ans[1] ? `prepend2=${yourans}` :
                            op3.checked && ans[2] ? `prepend3=${yourans}` :
                            op4.checked && ans[3] ? `prepend1=${yourans}` : '';
                            words.location.href = `${enginebase}${mainprefix && mainprefix.value ? mainprefix.value + " " : ""}${yourans}${ansqs}`
                        } else if(searchtype.value == "manualquestion"){
                            words.location.href = `${enginebase}${mainprefix && mainprefix.value ? mainprefix.value + " " : ""}prepend1=${qencoded}${ansqs}`
                        } else {
                            words.location.href = `${enginebase}${mainprefix && mainprefix.value ? mainprefix.value + " " : ""}${qencoded}${ansqs}`
                        }
                    }

                    if(ans && ans.length > 0) {
                        // GAME TITLE
                        var desc = document.getElementById("quiz-details-title");
                        var islogogame = "";
                        if(desc && desc.innerText) {
                            if(desc.innerText.match(/\blogo(s*)\b/gi)) {
                                islogogame = "logo"
                            }
                            if(desc.innerText.match(/\bairline logo(s*)\b/gi)) {
                                islogogame = "airline logo"
                            }
                            if(desc.innerText.match(/\bsilhouette(s*)\b/gi)) {
                                islogogame = "silhouette"
                            }
                            if(desc.innerText.match(/\bpainting(s*)\b/gi)) {
                                islogogame = "painting"
                            }
                            if(desc.innerText.match(/\btv\b/gi)) {
                                islogogame = "tv"
                            }
                            if(desc.innerText.match(/\bmovie(s*)\b/gi)) {
                                islogogame = "movie"
                            }
                            if(desc.innerText.match(/\bvideo game(s*)\b/gi)) {
                                islogogame = "video game"
                            }
                            if(desc.innerText.match(/\bflag(s*)\b/gi)) {
                                islogogame = "flag"
                            }
                            if(suffix.value) {
                                islogogame = suffix.value;
                            }
                            if(desc.innerText.match(/(movie|film) (quote(s*))/gi)) {

                                let quote = q.innerText
                                let rgx = /("|'|“|”|‘|’)+(.*)("|'|“|”|‘|’)+/gi;
                                quote = quote.match(rgx);
                                if(quote && quote[0]) {
                                    quote = quote[0];
                                    quote = quote.substring(1, quote.length-1);
                                    quote = quote.replace(/\//gi, "");
                                    window.open(`http://www.quodb.com/search/${quote}?${ansqs}`, "uk");
                                }
                            }
                            if(desc.innerText.match(/(cheesy music|music lyric(s*))/gi)) {
                                let quote = q.innerText
                                let rgx = /("|'|“|”|‘|’)+(.*)("|'|“|”|‘|’)+/gi;
                                quote = quote.match(rgx);
                                if(quote && quote[0]) {
                                    quote = quote[0];
                                    quote = quote.substring(1, quote.length-1);
                                    quote = quote.replace(/\//gi, "");
                                    window.open(`https://genius.com/search?q=${quote}`, "uk");
                                }
                            }
                        }

                        try {
                            if(q && q.innerText.match(/\b(anagram(s*))\b/gi)) {
                                qtype = "anagram"
                                anagramorigin = q.innerText
                                var rx = /("|'|“|”|‘|’)+(.*)("|'|“|”|‘|’)+/gi;
                                anagramorigin = anagramorigin.match(rx);
                                if(anagramorigin && anagramorigin[0]) {
                                    anagramorigin = anagramorigin[0];
                                    anagramorigin = anagramorigin.substring(1, anagramorigin.length-1);
                                }
                            }
                            if(q && q.innerText.match(/\b(palindrome(s*)|pallindrome(s*)|palandrome(s*)|pallandrome(s*))\b/gi)) {
                                qtype = "palindrome"
                            }
                            if(q && q.innerText.match(/\b(monarch|monarchy|reign|monarchs)\b/gi)) {
                                qtype = "monarchy";
                                if(q.innerText.match(/\b(not have a monarchy)\b/gi)) {
                                    window.open(`https://en.wikipedia.org/wiki/List_of_current_monarchies?${ansqs}&brgq=${qencoded}`, "uk");
                                } else {
                                    window.open(`https://www.historic-uk.com/HistoryUK/KingsQueensofBritain/?${ansqs}`, "uk");
                                }
                            }
                            if(q && q.innerText.match(/\b(closest|furthest|farthest)\b\s*(\w*)\s*(\w*)/gi)) {
                                phrase = q.innerText.match(/\b(closest|furthest|farthest)\b\s*(\w*)\s*(\w*)/gi);
                                if(phrase && phrase[0]) {
                                    qtype = "distance"
                                    origin = phrase[0].split(" ");
                                    origin = origin[origin.length-1];
                                }
                            }
                            if((q && q.innerText.match(/\b(furthest|farthest|further|farther)\b\s*(\bnorth|south|east|west\b)\s*/gi) || (lat && lat.value == "true"))) {
                                qtype = "global"
                                lat.value = false;
                            }
                            if((q && q.innerText.match(/\b(born)\b/gi)) || (birthday && birthday.value == "true")) {
                                qtype = "birth"
                                birthday.value = "false";
                            }
                            if((q && q.innerText.match(/\b(death|died|dies)\b/gi)) || (death && death.value == "true")) {
                                qtype = "death"
                                death.value = "false";
                            }
                            if(young && young.value == "true") {
                                qtype = "young"
                                young.value = "false";
                            }
                            if(dateof && dateof.value == "true") {
                                qtype = "dateof"
                                dateof.value = "false";
                            }
                            if(capacity && capacity.value == "true") {
                                qtype = "capacity"
                                capacity.value = "false";
                            }
                            if(opening && opening.value == "true") {
                                qtype = "opening"
                                opening.value = "false";
                            }
                            if(closing && closing.value == "true") {
                                qtype = "closing"
                                closing.value = "false";
                            }

                            if(q && q.innerText.match(/\bin area\b/gi)) {
                                qtype = "area"
                            }
                            if(q && q.innerText.match(/\balbum(s*)\b/gi) && q.innerText.match(/\breleased\b/gi)) {
                                qtype = "album"
                            }
                            if(q && q.innerText.match(/\b(border(s*)|bordering)\b/gi) && uk) {
                                window.open(`https://en.wikipedia.org/wiki/List_of_countries_and_territories_by_land_borders?${ansqs}&brgq=${qencoded}&deeplink=y`, "uk");
                            }
                            if(q && q.innerText.match(/\bnative language(s*)\b/gi) && uk) {
                                window.open(`https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_and_their_capitals_in_native_languages?${ansqs}&brgq=${qencoded}&deeplink=y`, "uk");
                            }
                            if(q && q.innerText.match(/\buk\b/gi) && q.innerText.match(/\bnumber\b/gi) && uk) {
                                window.open(`https://www.old-record-shop.co.uk/numberones/All-UK-Number-Ones.aspx?${ansqs}`, "uk");
                            }
                            if(q && q.innerText.match(/(.*)\s*(perform(s*)|performer(s*))\s*(at)\s*/gi)) {
                                qtype = "perform"
                                venue = q.innerText.match(/(.*)\s*(perform(s*)|performer(s*))\s*(at)\s*/gi)
                                venue = q.innerText.replace(venue, "");
                            }
                            if(age && age.value == "true") {
                                qtype = "age";
                                age.value = "false";
                            }
                            if(radiomap && radiomap.checked) {
                                qtype = "map";
                            }
                            if(release && release.value == "true") {
                                qtype = "release";
                                release.value = "false";
                            }
                            if(phone && phone.value == "true") {
                                qtype = "phone";
                                phone.value = "false";
                            }
                            if(flag && flag.value == "true") {
                                qtype = "flag";
                                flag.value = "false";
                            }
                            if(cont && cont.value == "true") {
                                qtype = "cont";
                                cont.value = "false";
                            }
                            if(q && q.innerText.match(/\bwhich.*is in the (northern|southern) hemisphere\b/gi)) {
                                qtype = "global"
                                lat.value = false;
                            }
                            if(q && q.innerText.match(/\bcontinent\s*-\s*capital\s*groups\b/gi)) {
                                qtype = "contcapital"
                            }
                            if(q && q.innerText.match(/\bcountry\s*-\s*capital\s*groups\b/gi)) {
                                qtype = "countrycapital"
                            }
                        } catch(e) {
                            console.log(e);
                        }

                        let answerquestion = document.querySelector(questionClass) || "";
                        if(answerquestion) {
                            answerquestion = answerquestion.innerText;
                            if(answerquestion[answerquestion.length-1] == "?") {
                                answerquestion = answerquestion.substring(0, answerquestion.length-1);
                            }
                            answerquestion=encodeURIComponent((answerquestion || "").trim());
                        }
                        let googlemain = `https://www.google.com/search?q=`;
                        let bingmain = `https://www.bing.com/search?q=`;
                        let enginemain = bing && bing.checked ? bingmain : googlemain;

                        let googlealt = `https://www.google.com/search?${radioimg && radioimg.checked ? 'tbm=isch&' : ''}q=`;
                        let bingalt = `https://www.bing.com/${radioimg && radioimg.checked ? 'images/' : ''}search?q=`;
                        let enginealt = bing && bing.checked ? bingalt : googlealt;

                        let combinewithq = combine && combine.checked ? `${answerquestion}` : ``;
                        let href = "";
                        ans.map((a, i)=> {
                            let answer = (a.innerText || "").trim();
                            if(quotes.checked) {
                                answer = `"${answer}"`;
                            }
                            answer = encodeURIComponent(answer);
                            let highlight = combine && combine.checked ? `&brg1=${answer}&brgq=${answerquestion}` : `&brg1=${answer}`;
                            switch(qtype) {
                                case 'anagram':
                                    href = `https://anagram-solver.net/${a.innerText}`;
                                    break;
                                case 'palindrome':
                                    href = `https://www.willpeavy.com/palindrome/?t=${a.innerText}`;
                                    break;
                                case 'monarchy':
                                    href = `${enginemain}date of rule ${answer} ${highlight}`;
                                    break;
                                case 'distance':
                                    href = `${enginemain}miles distance ${origin} to ${answer} ${highlight}`;
                                    break;
                                case 'global':
                                    href = `${enginemain}latitude ${answer} ${highlight}`;
                                    break;
                                case 'birth':
                                    href = `${enginemain}date of birth ${answer} ${highlight}`;
                                    break;
                                case 'flag':
                                    href = `${enginealt}flag of ${prefix.value} ${answer} ${highlight}`;
                                    break;
                                case 'age':
                                    href = `${enginemain}${answer} age ${highlight}`;
                                    break;
                                case 'death':
                                    href = `${enginemain}date of death ${answer} ${highlight}`;
                                    break;
                                case 'young':
                                    href = `${enginealt}young photo of ${prefix.value} ${answer} ${highlight}`;
                                    break;
                                case 'dateof':
                                    href = `${enginemain}date of ${prefix.value} ${answer} ${highlight}`;
                                    break;
                                case 'capacity':
                                    href = `${enginemain}capacity of ${prefix.value} ${answer} ${highlight}`;
                                    break;
                                case 'opening':
                                    href = `${enginemain}date of opening ${prefix.value} ${answer} ${highlight}`;
                                    break;
                                case 'closing':
                                    href = `${enginemain}date of closing ${prefix.value} ${answer} ${highlight}`;
                                    break;
                                case 'area':
                                    href = `${enginemain}area of ${answer}${highlight}`;
                                    break;
                                case 'album':
                                    href = `${enginemain}album date of release ${answer}${highlight}`;
                                    break;
                                case 'perform':
                                    href = `${enginemain}${answer} ${venue} ${combinewithq}${highlight}`;
                                    break;
                                case 'map':
                                    href = `https://www.bing.com/maps?q=${answer}`;
                                    break;
                                case 'release':
                                    href = `${enginemain}date of release ${prefix.value} ${answer}&brg1=${answer}`;
                                    break;
                                case 'cont':
                                    href = `${enginemain}continent of ${prefix.value} ${answer}${highlight}`;
                                    break;
                                case 'contcapital':
                                    try{
                                        let capital = answer.split("-")[1]
                                        href = `${enginemain}which continent of capital ${capital}&brg1=${answer.split("-")[0]}`;
                                    } catch(e){}
                                    break;
                                case 'countrycapital':
                                    try{
                                        let capital = answer.split("-")[1]
                                        href = `${enginemain}which country of capital ${capital}&brg1=${answer.split("-")[0]}`;
                                    } catch(e){}
                                    break;
                                case 'phone':
                                    href = `https://www.gsmarena.com/res.php3?sSearch=${answer}&brg1=${answer}`;
                                    break;
                                default:
                                    href = `${enginealt}${prefix.value}${answer} ${combinewithq}${highlight}`;
                            }

                            //var urlImages = {};
                            //var urlAll = {};
                            if(i==0 && ans1 && op1 && op1.checked && searchtype.value == "auto"){
                                lastans1 = a.innerText;
                                ans1.location.href = href;
                                urlImages[1] = `https://www.google.com/search?q=${a.innerText}`
                                urlAll[1] = href;
                            }
                            if(i==1 && ans2 && op2 && op2.checked && searchtype.value == "auto"){
                                lastans2 = a.innerText;
                                ans2.location.href = href
                                urlImages[2] = `https://www.google.com/search?q=${a.innerText}`
                                urlAll[2] = href;
                            }
                            if(i==2 && ans3 && op3 && op3.checked && searchtype.value == "auto"){
                                lastans3 = a.innerText;
                                ans3.location.href = href
                                urlImages[3] = `https://www.google.com/search?q=${a.innerText}`
                                urlAll[3] = href;
                            }
                            if(i==3 && ans4 && op4 && op4.checked && searchtype.value == "auto"){
                                lastans4 = a.innerText;
                                ans4.location.href = href
                                urlImages[4] = `https://www.google.com/search?q=${a.innerText}`
                                urlAll[4] = href;
                            }

                        });

                        var blankout = 4 - ans.length;
                        if(blankout == 2) {
                            if(ans3) {
                                urlImages[3] = "";
                                urlAll[3] = "";
                                lastans3 = "";
                                ans3.location.href = `about:blank`;
                            }
                            if(ans4) {
                                urlImages[4] = "";
                                urlAll[4] = "";
                                lastans4 = "";
                                ans4.location.href = `about:blank`;
                            }
                        }
                        if(blankout == 1) {
                            if(ans4) {
                                urlImages[4] = "";
                                urlAll[4] = "";
                                lastans4 = "";
                                ans4.location.href = `about:blank`;
                            }
                        }
                    }

                    //resetbuttons();
                    lastq = q.innerText;
                }

            });

            observer.observe(x, {characterData: true, subtree: true, childList: true, attributes: false});

            //$(".load-more-container").find("button").click();

            document.onkeydown = function(evt) {
                evt = evt || window.event;
                var ha = document.getElementsByClassName(answerClass);
                // keybinds
                if(ha && ha.length > 0) {
                    ha = Array.from(ha);
                    if(evt.keyCode == 49) {
                        ha[0].click();
                    }
                    if(evt.keyCode == 50) {
                        ha[1].click();
                    }
                    if(evt.keyCode == 51) {
                        ha[2].click();
                    }
                    if(evt.keyCode == 52) {
                        ha[3].click();
                    }
                }

                try{
                    //F9 windows
                    if(evt.keyCode == 120) {
                        if(words){
                            closewindows()
                        } else {
                            openwindows();
                            //const event = new Event('createinputs');
                            //window.dispatchEvent(event);
                        }
                    }
                    //RIGHCTRL flip image
                    if(evt.keyCode == 17 && GM_info.script.version < 5.0 && searchtype && searchtype.value == "auto") {
                        if(ans1 && lastans1) {
                            if(!urlImages[1].match(/&tbm=isch/gi)) {
                                let u = `${urlImages[1]}&tbm=isch`;
                                ans1.location.href = u;
                                urlImages[1] = u;
                            } else {
                                urlImages[1] = urlImages[1].replace(/&tbm=isch/gi, "");
                                ans1.location.href = urlAll[1];
                            }
                        }
                        if(ans2 && lastans2) {
                            if(!urlImages[2].match(/&tbm=isch/gi)) {
                                let u = `${urlImages[2]}&tbm=isch`;
                                ans2.location.href = u;
                                urlImages[2] = u;
                            } else {
                                urlImages[2] = urlImages[2].replace(/&tbm=isch/gi, "");
                                ans2.location.href = urlAll[2];
                            }
                        }
                        if(ans3 && lastans3) {
                            if(!urlImages[3].match(/&tbm=isch/gi)) {
                                let u = `${urlImages[3]}&tbm=isch`;
                                ans3.location.href = u;
                                urlImages[3] = u;
                            } else {
                                urlImages[3] = urlImages[3].replace(/&tbm=isch/gi, "");
                                ans3.location.href = urlAll[3];
                            }
                        }
                        if(ans4 && lastans4) {
                            if(!urlImages[4].match(/&tbm=isch/gi)) {
                                let u = `${urlImages[4]}&tbm=isch`;
                                ans4.location.href = u;
                                urlImages[4] = u;
                            } else {
                                urlImages[4] = urlImages[4].replace(/&tbm=isch/gi, "");
                                ans4.location.href = urlAll[4];
                            }
                        }

                    }

                } catch(e) {
                    console.log(e)
                }

            };
        }
    }, 1000);

    var testinterval = () => {
        if(testq==1) {
            testq = 2;
            $("#root").html(`<div class="trivia-question" style="font-size: 1.25vw;text-align:center;">what profession was indiana jones?</div> <div class="trivia-answers-wrapper"> <div title="" class="trivia-answer d-flex align-items-center justify-content-center click-disabled" style="font-size: 1.2vw; line-height: 1.2vw;"> <div class="trivia-answer-text">Bank Teller</div></div> <div title="" class="trivia-answer d-flex align-items-center justify-content-center click-disabled" style="font-size: 1.3vw; line-height: 1.3vw;"> <div class="trivia-answer-text">Novelist</div></div> <div title="" class="trivia-answer d-flex align-items-center justify-content-center users-answer click-disabled" style="font-size: 1.2vw; line-height: 1.2vw;"> <div class="trivia-answer-text">College Professor</div></div> <div title="" class="trivia-answer d-flex align-items-center justify-content-center click-disabled" style="font-size: 1.2vw; line-height: 1.2vw;"> <div class="trivia-answer-text">Yoga Instructor</div></div></div>`);
        } else if(testq==2) {
            testq = 3;
            $("#root").html(`<div class="trivia-question" style="font-size: 1.25vw;text-align:center;">who first proposed heliocentric model?</div> <div class="trivia-answers-wrapper"> <div title="" class="trivia-answer d-flex align-items-center justify-content-center click-disabled" style="font-size: 1.2vw; line-height: 1.2vw;"> <div class="trivia-answer-text">william shakespeare</div></div> <div title="" class="trivia-answer d-flex align-items-center justify-content-center click-disabled" style="font-size: 1.3vw; line-height: 1.3vw;"> <div class="trivia-answer-text">galileo</div></div> <div title="" class="trivia-answer d-flex align-items-center justify-content-center users-answer click-disabled" style="font-size: 1.2vw; line-height: 1.2vw;"> <div class="trivia-answer-text">santa claus</div></div> <div title="" class="trivia-answer d-flex align-items-center justify-content-center click-disabled" style="font-size: 1.2vw; line-height: 1.2vw;"> <div class="trivia-answer-text">Aristarchus</div></div></div>`);
        } else if(testq==3) {
            testq = 1;
            $("#root").html(`<div class="trivia-question" style="font-size: 1.25vw;text-align:center;"> who was the first disney princess </div> <div class="trivia-answers-wrapper"> <div title="" class="trivia-answer d-flex align-items-center justify-content-center click-disabled" style="font-size: 1.2vw; line-height: 1.2vw;"> <div class="trivia-answer-text">snow white</div> </div> <div title="" class="trivia-answer d-flex align-items-center justify-content-center click-disabled" style="font-size: 1.3vw; line-height: 1.3vw;"> <div class="trivia-answer-text">persephone</div> </div> </div>`);
        }
    }

});
