// ==UserScript==
// @name         qh
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  try to take over the world!
// @author       You
// @match        https://discord.com/*
// @grant        GM_addStyle
// @require http://code.jquery.com/jquery-3.4.1.min.js

// ==/UserScript==
/* eslint-disable */
GM_addStyle(`
.inputscontainer{
display: block;
color: white;
position: relative;
top: 0;
left: 0;
right: 0;
height: auto;
background-color: var(--background-secondary);
padding: 5px 5px 2px 5px;
color: var(--channels-default);
font-weight: 600;
}
.inputscontainer *, .inputscontainer *:after {
font-weight: 600;
font-size:12px;
}

.inputscontainer .sub:hover,
.inputscontainer .searchtype:hover,
.inputscontainer .layout:hover,
.inputscontainer .role:hover,
.inputscontainer input:hover:after{
color: var(--interactive-hover);
}
.inputscontainer input:after {
color: var(--channels-default);
}

.inputscontainer svg.hover path{
fill: var(--interactive-hover);
}

input[name=op1], input[name=op2], input[name=op3], input[name=layout], input[name=searchtype]{
display: block;
color: white;
cursor:pointer;
height:16px;
line-height:16px;
}

input[name=op1]:after, input[name=op2]:after, input[name=op3]:after, input[name=layout]:after, input[name=searchtype]:after{
padding-left: 18px;
width: auto;
white-space: nowrap;
display: inline-block;
font-size: 16px;
font-weight: 500;
}

input[value=full]:after{
content: '{option} + {question}';
}
input[value=fullrev]:after{
content: '{question} + {option}';
}
input[value=justans]:after{
content: '{option}';
}
input[value=justq]:after{
content: '{question}';
}
input[value=manual]:after{
content: '{option} + {manual input}';
}
input[value=manualq]:after{
content: '{question} + {manual input}';
}

input[value=left]:after{
content: 'left';
}
input[value=right]:after{
content: 'right';
}
input[name=op1]:after{
content: 'option 1';
}
input[name=op2]:after{
content: 'option 2';
}
input[name=op3]:after{
content: 'option 3';
}

input[value=justq] {
margin-bottom: 10px;
}
.searchtype, .layout, .role{
cursor: pointer;
}
.layout, .role{
margin-top: 20px;
}

.bezel {
height: 75px;
width:  90%;
margin: 20px auto 0 auto;
padding: 5px 5px 15px 5px;
border:3px solid var(--channels-default);
border-radius: 5px;
}
.monitor{
background-color: var(--interactive-hover);
height: 100%;

margin: 0 auto;
border:1px solid var(--channels-default);
border-radius: 5px;
display:flex;
align-items: center;
justify-content: flex-start;
padding: 0 5px;
}
.s1, .s2, .s3{
color: var(--channels-default);
background-color: var(--background-primary);
height: 75%;
border:1px solid #202225;
display:flex;
align-items: center;
justify-content: center;
font-size:25px;
font-weight:600px;
cursor: pointer;
}
.monitor div[class^=childWrapper-] {
height: 75%;
border:1px solid #202225;
}
.section{
margin-left: 11px;
font-size: 12px;
text-transform: uppercase;
line-height: 16px;
font-weight: 600;
}
.sub {
text-transform: none;
}
.inputscontainer .icon-WnO6o2 {
left:-3px;
top:2px;
}
`);
$().ready(function() {
    'use strict';
    var questionClass = ".vote-question", answerClass=".answer-body";
    var q, ans, qencoded;
    var ans1 = null, ans2 = null, ans3 = null, container, op1, op2, op3, left, right, bezel, monitor, s1, s2, s3, full, fullrev, justans, justq, manual, manualq;
    var lastq = "", lastans1 = "", lastans2 = "", lastans3 = "";
    var deviceHeight = screen.height - 100;

    var createinputs = () =>  {
        var channels=$("div[aria-label=Channels]");
        if(channels && channels[0] && $(".inputscontainer").length == 0) {
            var cookies = document.cookie || "";

            channels[0].style.position = "relative";
            container = document.createElement("div");
            container.className="inputscontainer";
            $(container).insertBefore(channels);

            $(container).append('<div class="searchtype" style="position:relative"><svg class="arrow-gKvcEx icon-WnO6o2" width="24" height="24" viewBox="0 0 24 24"><path fill="#8e9297" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path></svg><div class="section">Search Type</div></div>')
            $(".searchtype").on("click", () => {
                $("input[name=searchtype], .sub").toggle();
                if($("input[name=searchtype]").css("display") == "none") {
                    $(".searchtype").find("svg").css('transform','rotate(-90deg)');
                } else {
                    $(".searchtype").find("svg").css('transform','rotate(0deg)');
                }
            }).on("mouseover", (e) => {
                $(".searchtype").find("svg").addClass("hover");
            }).on("mouseleave", (e) => {
                $(".searchtype").find("svg").removeClass("hover");
            });

            $(container).append("<div class='section sub'>[ automatic ]</div>");
            full = document.createElement("input");
            full.type = "radio";
            full.name = 'searchtype';
            full.value = 'full';
            full.checked = cookies.match(/searchtype=full/gi) || !cookies.match(/searchtype/gi) ? true : false;
            full.onclick = () => {
                updatemonitor();
                document.cookie = `searchtype=full`;
            };
            container.append(full);

            fullrev = document.createElement("input");
            fullrev.type = "radio";
            fullrev.name = 'searchtype';
            fullrev.value = 'fullrev';
            fullrev.checked = cookies.match(/searchtype=fullrev/gi) ? true : false;
            fullrev.onclick = () => {
                updatemonitor();
                document.cookie = `searchtype=fullrev`;
            };
            container.append(fullrev);

            justans = document.createElement("input");
            justans.type = "radio";
            justans.name = 'searchtype';
            justans.value = 'justans';
            justans.checked = cookies.match(/searchtype=justans/gi) ? true : false;
            justans.onclick = () => {
                updatemonitor();
                document.cookie = `searchtype=justans`;
            };
            container.append(justans);

            justq = document.createElement("input");
            justq.type = "radio";
            justq.name = 'searchtype';
            justq.value = 'justq';
            justq.checked = cookies.match(/searchtype=justq/gi) ? true : false;
            justq.onclick = () => {
                updatemonitor();
                document.cookie = `searchtype=justq`;
            };
            container.append(justq);

            $(container).append("<div class='section sub'>[ manual ] works best with 1 role</div>");
            manual = document.createElement("input");
            manual.type = "radio";
            manual.name = 'searchtype';
            manual.value = 'manual';
            manual.checked = cookies.match(/searchtype=manual/gi) ? true : false;
            manual.onclick = () => {
                updatemonitor();
                document.cookie = `searchtype=manual`;
            };
            container.append(manual);

            manualq = document.createElement("input");
            manualq.type = "radio";
            manualq.name = 'searchtype';
            manualq.value = 'manualq';
            manualq.checked = cookies.match(/searchtype=manualq/gi) ? true : false;
            manualq.onclick = () => {
                updatemonitor();
                document.cookie = `searchtype=manualq`;
            };
            container.append(manualq);

            $(container).append('<div class="layout" style="position:relative"><svg class="arrow-gKvcEx icon-WnO6o2" width="24" height="24" viewBox="0 0 24 24"><path fill="#8e9297" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path></svg><div class="section">Layout</div></div>')
            $(".layout").on("click", () => {
                $("input[name=layout]").toggle();
                if($("input[name=layout]").css("display") == "none") {
                    $(".layout").find("svg").css('transform','rotate(-90deg)');
                } else {
                    $(".layout").find("svg").css('transform','rotate(0deg)');
                }
                if($("input[name=layout]").css("display") == "none" && $("input[type=checkbox]").css("display") == "none") {
                    $(".bezel").hide();
                } else {
                    $(".bezel").show();
                }
            }).on("mouseover", (e) => {
                $(".layout").find("svg").addClass("hover");
            }).on("mouseleave", (e) => {
                $(".layout").find("svg").removeClass("hover");
            });
            left = document.createElement("input");
            left.type = "radio";
            left.name = 'layout';
            left.value = 'left';
            left.checked = cookies.match(/layout=left/gi) || !cookies.match(/layout/gi) ? true : false;
            left.onclick = () => {
                updatemonitor();
                document.cookie = `layout=left`;
            };
            container.append(left);

            right = document.createElement("input");
            right.type = "radio";
            right.name = 'layout';
            right.value = 'right';
            right.checked = cookies.match(/layout=right/gi) ? true : false;
            right.onclick = () => {
                updatemonitor();
                document.cookie = `layout=right`;
            };
            container.append(right);

            $(container).append('<div class="role" style="position:relative"><svg class="arrow-gKvcEx icon-WnO6o2" width="24" height="24" viewBox="0 0 24 24"><path fill="#8e9297" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path></svg><div class="section">Role</div></div>')
            $(".role").on("click", () => {
                $("input[type=checkbox]").toggle();
                if($("input[type=checkbox]").css("display") == "none") {
                    $(".role").find("svg").css('transform','rotate(-90deg)');
                } else {
                    $(".role").find("svg").css('transform','rotate(0deg)');
                }
                if($("input[name=layout]").css("display") == "none" && $("input[type=checkbox]").css("display") == "none") {
                    $(".bezel").hide();
                } else {
                    $(".bezel").show();
                }
            }).on("mouseover", (e) => {
                $(".role").find("svg").addClass("hover");
            }).on("mouseleave", (e) => {
                $(".role").find("svg").removeClass("hover");
            });
            op1 = document.createElement("input");
            op1.type = "checkbox";
            op1.name = 'op1';
            op1.checked = cookies && cookies.match(/op1=false/gi) ? false : true;
            op1.onclick = (e) => {
                updatemonitor();
                document.cookie = `op1=${op1.checked}`;
            };
            container.append(op1);

            op2 = document.createElement("input");
            op2.type = "checkbox";
            op2.name = 'op2';
            op2.checked = cookies && cookies.match(/op2=false/gi) ? false : true;
            op2.onclick = (e) => {
                updatemonitor();
                document.cookie = `op2=${op2.checked}`;
            };
            container.append(op2);

            op3 = document.createElement("input");
            op3.type = "checkbox";
            op3.name = 'op3';
            op3.checked = cookies && cookies.match(/op3=false/gi) ? false : true;
            op3.onclick = (e) => {
                updatemonitor();
                document.cookie = `op3=${op3.checked}`;
            };
            container.append(op3);

            bezel = document.createElement("div");
            bezel.className="bezel";
            container.append(bezel);
            monitor = document.createElement("div");
            monitor.className="monitor";
            bezel.append(monitor);

            let count = 0;
            count = op1.checked ? ++count : count;
            count = op2.checked ? ++count : count;
            count = op3.checked ? ++count : count;

            s1 = document.createElement("div");
            s1.className="s1";
            s1.innerText = "1";
            s1.style.width = "25%";
            s1.onclick = (e) => {
                op2.checked = false;
                op3.checked = false;
                updatemonitor();
            };
            monitor.append(s1);

            s2 = document.createElement("div");
            s2.className="s2";
            s2.innerText = "2";
            s2.style.width = "25%";
            s2.onclick = (e) => {
                op1.checked = false;
                op3.checked = false;
                updatemonitor();
            };
            monitor.append(s2);

            s3 = document.createElement("div");
            s3.className="s3";
            s3.innerText = "3";
            s3.style.width = "25%";
            s3.onclick = (e) => {
                op1.checked = false;
                op2.checked = false;
                updatemonitor();
            };
            monitor.append(s3);

            updatemonitor();
        }
    }
    var updatemonitor = () => {
        let count = 0;
        count = op1.checked ? ++count : count;
        count = op2.checked ? ++count : count;
        count = op3.checked ? ++count : count;
        var w = 100 / (count + 1);
        monitor.style.justifyContent = left.checked ? "flex-start" : "flex-end";
        s1.style.width = `${w}%`
        s2.style.width = `${w}%`
        s3.style.width = `${w}%`
        s1.style.display = op1.checked ? "flex" : "none"
        s2.style.display = op2.checked ? "flex" : "none"
        s3.style.display = op3.checked ? "flex" : "none"

        $(".monitor").find("svg[class^=homeIcon-]").parent().remove();
        var logo = $("svg[class^=homeIcon-]").parent().clone();
        if(left.checked) {
            monitor.append(logo[0]);
        }
        if(right.checked) {
            monitor.prepend(logo[0]);
        }
    }

    var openwindows = (override) => {
        let count = 0;
        count = op1.checked ? ++count : count;
        count = op2.checked ? ++count : count;
        count = op3.checked ? ++count : count;
        var w = (screen.width - 630) / count;
        //var maxW = screen.width / 2;
        var offset = right.checked ? 630 : 0;
        //w = Math.min(w, maxW)

        if(override) {
            if(ans1) {
                ans1.close();
            }
            if(ans2) {
                ans2.close();
            }
            if(ans3) {
                ans3.close();
            }
            if(op1.checked)
                ans1 = window.open('https://www.google.com/?&hl=en', 'ans1', "width="+w+", height="+deviceHeight+", left="+offset);
            if(op2.checked)
                ans2 = window.open('https://www.google.com/?&hl=en', 'ans2', "width="+w+", height="+deviceHeight+", left="+(offset + (w*(op1.checked ? 1 : 0))))
            if(op3.checked)
                ans3 = window.open('https://www.google.com/?&hl=en', 'ans3', "width="+w+", height="+deviceHeight+", left="+(offset + (w*(Number(op1.checked ? 1 : 0) + Number(op2.checked ? 1 : 0)))))
        }

    }
    var closewindows = () => {
        try{
            if(ans1) {
                ans1.close();
                ans1 = null;
            }
            if(ans2) {
                ans2.close();
                ans2 = null;
            }
            if(ans3) {
                ans3.close();
                ans3 = null;
            }
            //lastq = null;
            //lastans1 = null;
            //lastans2 = null;
            //lastans3 = null;
        } catch(e){}
    }

    window.onbeforeunload = function(){
        closewindows();
    };

    var waitbody = setInterval(() =>{
        var messageList = $("body");
        var channels=$("div[aria-label=Channels]");
        if(messageList && messageList[0] && channels && channels[0]) {
            //console.log('found')
            clearInterval(waitbody);
            waitbody=null;
            createinputs();
            var observer = new MutationObserver(function() {
                if($(".inputscontainer").length == 0) {
                    createinputs();
                }
                //console.log('mutation')
                var user = messageList.find("span[class*=username-]").last().text()
                //console.log(user)
                if(user == "GrayBot") {
                    let googlemain = `https://www.google.com/search?q=`;
                    let bingmain = `https://www.bing.com/search?q=`;
                    let enginemain = googlemain;
                    if(manual.checked || manualq.checked) {
                        enginemain = "https://www.google.com/?&hl=en&"
                    }
                    var lastmsg = messageList.find("div[id^=chat-messages-]").last();
                    //console.log(lastmsg[0])
                    var embedded = lastmsg.find("div[class*=embedWrapper-]").last();
                    //console.log(embedded)
                    var values = embedded.find("div[class*=embedFieldValue-]");
                    //console.log(values)
                    //console.log(values[0])
                    //console.log(values[0].innerText)
                    q = values[0].innerText;
                    //console.log(q[0].innerText)
                    //console.log(q != lastq)
                    //console.log(values[1].innerText != lastans1)
                    //console.log(values[2].innerText != lastans2)
                    //console.log(values[3].innerText != lastans3)

                    if(q && (q != lastq || values[1].innerText != lastans1 || values[2].innerText != lastans2 || values[3].innerText != lastans3)) {
                        //console.log("inside");
                        if((op1.checked && !ans1) || (op2.checked && !ans2) || (op3.checked && !ans3)) {
                            //console.log('openwindows')
                            openwindows(true)
                        }
                        qencoded = encodeURIComponent(q.trim());
                        if(justans.checked) {
                            qencoded = "";
                        }
                        let allanswers = `&brg1=${encodeURIComponent(values[1].innerText.trim())}&brg2=${encodeURIComponent(values[2].innerText.trim())}&brg3=${encodeURIComponent(values[3].innerText.trim())}`

                        if (ans1 && op1.checked && values[1].innerText) {
                            let answer = encodeURIComponent(values[1].innerText.trim());
                            if(manual.checked) {
                                ans1.location.href = `${enginemain}prepend1=${answer}${allanswers}`;
                            } else if(manualq.checked) {
                                ans1.location.href = `${enginemain}prepend1=${qencoded}${allanswers}`;
                            } else if(fullrev.checked) {
                                ans1.location.href = `${enginemain}${qencoded} ${answer}${allanswers}`;
                            } else if(justq.checked) {
                                ans1.location.href = `${enginemain}${qencoded}${allanswers}`;
                            } else {
                                ans1.location.href = `${enginemain}${answer} ${qencoded}${allanswers}`;
                            }

                        }
                        if (ans2 && op2.checked && values[2].innerText) {
                            let answer = encodeURIComponent(values[2].innerText.trim());
                            if(manual.checked) {
                                ans2.location.href = `${enginemain}prepend2=${answer}${allanswers}`;
                            } else if(manualq.checked) {
                                ans2.location.href = `${enginemain}prepend1=${qencoded}${allanswers}`;
                            } else if(fullrev.checked) {
                                ans2.location.href = `${enginemain}${qencoded} ${answer}${allanswers}`;
                            } else if(justq.checked) {
                                ans2.location.href = `${enginemain}${qencoded}${allanswers}`;
                            } else {
                                ans2.location.href = `${enginemain}${answer} ${qencoded}${allanswers}`;
                            }
                        }
                        if (ans3 && op3.checked && values[3].innerText) {
                            let answer = encodeURIComponent(values[3].innerText.trim());
                            if(manual.checked) {
                                ans3.location.href = `${enginemain}prepend3=${answer}${allanswers}`;
                            } else if(manualq.checked) {
                                ans3.location.href = `${enginemain}prepend1=${qencoded}${allanswers}`;
                            } else if(fullrev.checked) {
                                ans3.location.href = `${enginemain}${qencoded} ${answer}${allanswers}`;
                            } else if(justq.checked) {
                                ans3.location.href = `${enginemain}${qencoded}${allanswers}`;
                            } else {
                                ans3.location.href = `${enginemain}${answer} ${qencoded}${allanswers}`;
                            }
                        }
                        lastq = q;
                        lastans1 = values[1].innerText;
                        lastans2 = values[2].innerText;
                        lastans3 = values[3].innerText;
                    }
                }
            });
            observer.observe(messageList[0], {characterData: false, subtree: true, childList: true, attributes: false});

            document.onkeydown = function(evt) {
                evt = evt || window.event;
                // keybinds
                //console.log(evt.keyCode)
                try{
                    //F8 windows force null
                    if(evt.keyCode == 119) {
                        lastq = null;
                        lastans1 = null;
                        lastans2 = null;
                        lastans3 = null;
                    }
                    //F9 windows
                    if(evt.keyCode == 120) {
                        if(ans1 || ans2 || ans3){
                            closewindows();
                        } else {
                            createinputs();
                            openwindows(true);
                        }
                    }
                } catch(e) {
                    console.log(e)
                }

            };
        }
    },500);
});
