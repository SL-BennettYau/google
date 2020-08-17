// ==UserScript==
// @name         googler
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  nothing to see here
// @author       burger
// @match        https://www.google.com/*
// @match        https://www.bing.com/*
// @match        https://discord.com/*

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
$().ready(()=>{
    'use strict';
    if(location.hostname.match(/discord.com/gi)) {
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

input[name=role], input[name=layout], input[name=searchtype]{
display: block;
color: white;
cursor:pointer;
height:16px;
line-height:16px;
}

input[name=role]:after, input[name=layout]:after, input[name=searchtype]:after{
padding-left: 18px;
width: auto;
white-space: nowrap;
display: inline-block;
font-size: 15px;
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
input[value=manualfork]:after{
content: '{option} + {manual input}';
}

input[value=left]:after{
content: 'left';
}
input[value=right]:after{
content: 'right';
}
input[value=op1]:after{
content: 'option 1';
}
input[value=op2]:after{
content: 'option 2';
}
input[value=op3]:after{
content: 'option 3';
}

input[value=justq], input[value=manualq] {
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
.s1, .s2, .s3, .simg{
color: var(--channels-default);
background-color: var(--background-primary);
height: 75%;
border:1px solid #202225;
display:flex;
align-items: center;
justify-content: center;
font-size:35px;
font-weight:600px;
cursor: pointer;
}
.simg{
font-size:25px;
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
        var questionClass = ".vote-question", answerClass=".answer-body";
        var q, ans, qencoded;
        var ans1 = null, ans2 = null, ans3 = null, container, op1, op2, op3, left, right, bezel, monitor, simg, s1, s2, s3, full, fullrev, justans, justq, manual, manualq, manualfork, forkw;
        var lastq = "", lastans1 = "", lastans2 = "", lastans3 = "";
        var deviceHeight = screen.height - 100;
        var w, offset;
        var cookieappend = `;path=/;max-age=31556952`;

        var createinputs = () =>  {
            var channels=$("div[aria-label=Channels]");
            if(channels && channels[0] && $(".inputscontainer").length == 0) {
                var cookies = document.cookie || "";

                channels[0].style.position = "relative";
                container = document.createElement("div");
                container.className="inputscontainer";
                $(container).insertBefore(channels);

                $(container).append('<div class="searchtype" title='+GM_info.script.version+' style="position:relative"><svg class="arrow-gKvcEx icon-WnO6o2" width="24" height="24" viewBox="0 0 24 24"><path fill="#8e9297" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path></svg><div class="section">Search Type '+GM_info.script.version+'</div></div>')
                $(".searchtype").on("click", () => {
                    $("input[name=searchtype], .sub").toggle();
                    if($("input[name=searchtype]").css("display") == "none") {
                        $(".searchtype").find("svg").css('transform','rotate(-90deg)');
                        document.cookie = `collapseST=true${cookieappend}`;
                    } else {
                        $(".searchtype").find("svg").css('transform','rotate(0deg)');
                        document.cookie = `collapseST=false${cookieappend}`;
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
                full.title = "automatically googles option + question";
                full.onclick = () => {
                    updatemonitor();
                    document.cookie = `searchtype=full${cookieappend}`;
                };
                container.append(full);

                fullrev = document.createElement("input");
                fullrev.type = "radio";
                fullrev.name = 'searchtype';
                fullrev.value = 'fullrev';
                fullrev.checked = cookies.match(/searchtype=fullrev/gi) ? true : false;
                fullrev.title = "automatically googles question + option";
                fullrev.onclick = () => {
                    updatemonitor();
                    document.cookie = `searchtype=fullrev${cookieappend}`;
                };
                container.append(fullrev);

                justans = document.createElement("input");
                justans.type = "radio";
                justans.name = 'searchtype';
                justans.value = 'justans';
                justans.checked = cookies.match(/searchtype=justans/gi) ? true : false;
                justans.title = "automatically googles option";
                justans.onclick = () => {
                    updatemonitor();
                    document.cookie = `searchtype=justans${cookieappend}`;
                };
                container.append(justans);

                justq = document.createElement("input");
                justq.type = "radio";
                justq.name = 'searchtype';
                justq.value = 'justq';
                justq.checked = cookies.match(/searchtype=justq/gi) ? true : false;
                justq.title = "automatically googles question";
                justq.onclick = () => {
                    updatemonitor();
                    document.cookie = `searchtype=justq${cookieappend}`;
                };
                container.append(justq);

                $(container).append("<div class='section sub'>[ manual ] works best with 1 role</div>");
                manual = document.createElement("input");
                manual.type = "radio";
                manual.name = 'searchtype';
                manual.value = 'manual';
                manual.checked = cookies.match(/searchtype=manual/gi) ? true : false;
                manual.title = "opens google with answer waiting for input"
                manual.onclick = () => {
                    updatemonitor();
                    document.cookie = `searchtype=manual${cookieappend}`;
                };
                container.append(manual);

                manualq = document.createElement("input");
                manualq.type = "radio";
                manualq.name = 'searchtype';
                manualq.value = 'manualq';
                manualq.checked = cookies.match(/searchtype=manualq/gi) ? true : false;
                manualq.title = "opens google with question waiting for input"
                manualq.onclick = () => {
                    updatemonitor();
                    document.cookie = `searchtype=manualq${cookieappend}`;
                };
                container.append(manualq);

                $(container).append("<div class='section sub'>[ manual forks all + img ]</div>");
                manualfork = document.createElement("input");
                manualfork.type = "radio";
                manualfork.name = 'searchtype';
                manualfork.value = 'manualfork';
                manualfork.checked = cookies.match(/searchtype=manualfork/gi) ? true : false;
                manualfork.title = "opens google with option waiting for input then searches both ALL and IMAGES"
                manualfork.onclick = () => {
                    updatemonitor();
                    document.cookie = `searchtype=manualfork${cookieappend}`;
                };
                container.append(manualfork);


                $(container).append('<div class="layout" style="position:relative"><svg class="arrow-gKvcEx icon-WnO6o2" width="24" height="24" viewBox="0 0 24 24"><path fill="#8e9297" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path></svg><div class="section">Layout</div></div>')
                $(".layout").on("click", () => {
                    $("input[name=layout]").toggle();
                    if($("input[name=layout]").css("display") == "none") {
                        $(".layout").find("svg").css('transform','rotate(-90deg)');
                        document.cookie = `collapseLAY=true${cookieappend}`;
                    } else {
                        $(".layout").find("svg").css('transform','rotate(0deg)');
                        document.cookie = `collapseLAY=false${cookieappend}`;
                    }
                    if($("input[name=layout]").css("display") == "none" && $("input[name=role]").css("display") == "none") {
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
                    document.cookie = `layout=left${cookieappend}`;
                };
                container.append(left);

                right = document.createElement("input");
                right.type = "radio";
                right.name = 'layout';
                right.value = 'right';
                right.checked = cookies.match(/layout=right/gi) ? true : false;
                right.onclick = () => {
                    updatemonitor();
                    document.cookie = `layout=right${cookieappend}`;
                };
                container.append(right);

                $(container).append('<div class="role" style="position:relative"><svg class="arrow-gKvcEx icon-WnO6o2" width="24" height="24" viewBox="0 0 24 24"><path fill="#8e9297" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path></svg><div class="section">Role</div></div>')
                $(".role").on("click", () => {
                    $("input[name=role]").toggle();
                    if($("input[name=role]").css("display") == "none") {
                        $(".role").find("svg").css('transform','rotate(-90deg)');
                        document.cookie = `collapseROLE=true${cookieappend}`;
                    } else {
                        $(".role").find("svg").css('transform','rotate(0deg)');
                        document.cookie = `collapseROLE=false${cookieappend}`;
                    }
                    if($("input[name=layout]").css("display") == "none" && $("input[name=role]").css("display") == "none") {
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
                op1.name = 'role';
                op1.value = 'op1';
                op1.checked = cookies && cookies.match(/op1=false/gi) ? false : true;
                op1.onclick = (e) => {
                    updatemonitor();
                    document.cookie = `op1=${op1.checked}${cookieappend}`;
                };
                container.append(op1);

                op2 = document.createElement("input");
                op2.type = "checkbox";
                op2.name = 'role';
                op2.value = 'op2';
                op2.checked = cookies && cookies.match(/op2=false/gi) ? false : true;
                op2.onclick = (e) => {
                    updatemonitor();
                    document.cookie = `op2=${op2.checked}${cookieappend}`;
                };
                container.append(op2);

                op3 = document.createElement("input");
                op3.type = "checkbox";
                op3.name = 'role';
                op3.value = 'op3';
                op3.checked = cookies && cookies.match(/op3=false/gi) ? false : true;
                op3.onclick = (e) => {
                    updatemonitor();
                    document.cookie = `op3=${op3.checked}${cookieappend}`;
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

                if(cookies.match(/collapseST=true/gi)) {
                    $(".searchtype").click();
                }
                if(cookies.match(/collapseLAY=true/gi)) {
                    $(".layout").click();
                }
                if(cookies.match(/collapseROLE=true/gi)) {
                    $(".role").click();
                }
            }
        }
        var updatemonitor = () => {
            if(manual.checked || manualq.checked || manualfork.checked){
                var first = $("input[name=role]:checked");
                $(op1).attr("type","radio")
                $(op2).attr("type","radio")
                $(op3).attr("type","radio")
                if(first[0]) {
                    first[0].checked = true;
                } else {
                    op1.checked = true;
                }

                if(op1.checked) {
                    document.cookie = `op1=true${cookieappend}`;
                    document.cookie = `op2=false${cookieappend}`;
                    document.cookie = `op3=false${cookieappend}`;
                }
                if(op2.checked) {
                    document.cookie = `op2=true${cookieappend}`;
                    document.cookie = `op1=false${cookieappend}`;
                    document.cookie = `op3=false${cookieappend}`;
                }
                if(op3.checked) {
                    document.cookie = `op3=true${cookieappend}`;
                    document.cookie = `op1=false${cookieappend}`;
                    document.cookie = `op2=false${cookieappend}`;
                }

            } else {
                $(op1).attr("type","checkbox")
                $(op2).attr("type","checkbox")
                $(op3).attr("type","checkbox")
            }


            let count = 0;
            count = op1.checked ? ++count : count;
            count = op2.checked ? ++count : count;
            count = op3.checked ? ++count : count;
            if(manualfork.checked) {
                count++;
            }
            var sw = 100 / (count + 1);
            monitor.style.justifyContent = left.checked ? "flex-start" : "flex-end";
            s1.style.width = `${sw}%`
        s2.style.width = `${sw}%`
        s3.style.width = `${sw}%`
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
            $(".simg").remove();
            if(manualfork.checked) {
                simg = document.createElement("div");
                simg.className="simg";
                simg.innerText = "img";
                simg.style.width = `${sw}%`;
                if(left.checked) {
                    monitor.prepend(simg);
                } else {
                    monitor.append(simg);
                }
            }
        }

        var openwindows = (override) => {
            let count = 0;
            count = op1.checked ? ++count : count;
            count = op2.checked ? ++count : count;
            count = op3.checked ? ++count : count;
            if(manualfork.checked) {
                count++;
            }
            w = (screen.width - 630) / count;
            //var maxW = screen.width / 2;
            offset = right.checked ? 630 : 0;
            if(manualfork.checked) {
                offset += right.checked ? 0 : w;
            }
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
                if(forkw) {
                    forkw.close();
                }
                /*if(manualfork.checked) {
                forkw = window.open(`https://www.google.com/?&hl=en`, `forkw`, `width=${w},height=${deviceHeight},left=${0}`);
            }*/
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
                if(forkw) {
                    forkw.close();
                    forkw = null;
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
                    console.log('mutation')
                    var user = messageList.find("span[class*=username-]").last().text()
                    //console.log(user)
                    if(user == "GrayBot") {
                        let googlemain = `https://www.google.com/search?q=`;
                        let bingmain = `https://www.bing.com/search?q=`;
                        let enginemain = googlemain;
                        if(manual.checked || manualq.checked || manualfork.checked) {
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
                                openwindows(true)
                            }
                            qencoded = encodeURIComponent(q.trim());
                            if(justans.checked) {
                                qencoded = "";
                            }
                            let allanswers = `&brg1=${encodeURIComponent(values[1].innerText.trim())}&brg2=${encodeURIComponent(values[2].innerText.trim())}&brg3=${encodeURIComponent(values[3].innerText.trim())}`

                        let fork = manualfork.checked ? `&fork=true&width=${w}&height=${deviceHeight}&offset=${offset}&left=${left.checked}` : ``;

                            var launch = (target, answer, i) => {
                                if(manual.checked) {
                                    target.location.href = `${enginemain}prepend${i}=${answer}${allanswers}`;
                                } else if(manualq.checked) {
                                    target.location.href = `${enginemain}prepend${i}=${qencoded}${allanswers}`;
                                } else if(manualfork.checked) {
                                    //forkw.location.href = `https://www.google.com/search?q=${answer}&tbm=isch`;
                                    //setTimeout(() => {
                                    target.location.href = `${enginemain}prepend${i}=${answer}${allanswers}${fork}`;
                                    //},100);
                                } else if(fullrev.checked) {
                                    target.location.href = `${enginemain}${qencoded} ${answer}${allanswers}`;
                                } else if(justq.checked) {
                                    target.location.href = `${enginemain}${qencoded}${allanswers}`;
                                } else {
                                    target.location.href = `${enginemain}${answer} ${qencoded}${allanswers}`;
                                }
                            }

                            if (ans1 && op1.checked && values[1].innerText) {
                                let answer = encodeURIComponent(values[1].innerText.trim());
                                launch(ans1, answer, 1)
                            }
                            if (ans2 && op2.checked && values[2].innerText) {
                                let answer = encodeURIComponent(values[2].innerText.trim());
                                launch(ans2, answer, 2)
                            }
                            if (ans3 && op3.checked && values[3].innerText) {
                                let answer = encodeURIComponent(values[3].innerText.trim());
                                launch(ans3, answer, 3)
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
    } else {
        // GOOGLER

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
min-width: 170px;
font-family: "Consolas", Arial, sans-serif;
z-index: 9999;
font-weight:600;
position: fixed;
overflow:hidden;
font-size: 13px;
}

#dialog {
min-height: unset !important;
max-height: 100%;
height: auto;
font-size:12px;
padding:0 5px;
line-height: 15px;
overflow: hidden;
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
input[name=hilite]{
cursor:pointer;
}
`);

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
        if(searchform.length == 0){
            searchform = $("#b_header").find('form')
        }

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
            instance.unmark();
            localStorage.setItem("hilite", "off");
            //searchform.submit();
        }
        $(ctn).append(off);

        solid = document.createElement("input");
        solid.type = "radio";
        solid.name = 'hilite';
        solid.value = 'on';
        solid.onclick = () => {
            marking();
            localStorage.setItem("hilite", "on");
            //searchform.submit();
        }
        $(ctn).append(solid);

        var dragposition;
        var dialogclosed = sessionStorage.getItem("dialogclosed");
        var dialogsize = sessionStorage.getItem("dialogsize");
        if(dialogsize) {
            dialogsize = JSON.parse(dialogsize);
            console.log(dialogsize)
        }
        $("#dialog").dialog({
            autoOpen: dialogclosed ? false : (tbm && tbm.match(/isch/gi) ? false : true),
            dialogClass: "no-close",
            title: `shorties ${GM_info.script.version}`,
            closeText: "x",
            minHeight: 30,
            minWidth: 170,
            width: 170,
            resizable : false,
            //height: dialogsize && dialogsize.height || 'auto',
            dragStop: function( event, ui ) {
                localStorage.setItem("dialogposition", JSON.stringify(ui.position))
            },
            resize: function(event, ui) {
                $("#dialog").css("height","auto");
                if(ui.size.height <= 30) {
                    $(".colbtn").html("+");
                    sessionStorage.setItem("dialogmin", "true");
                    $(".ui-dialog").addClass("collapsed");
                } else {
                    $(".colbtn").html("-");
                    sessionStorage.setItem("dialogmin", "false");
                    $(".ui-dialog").removeClass("collapsed");
                }
            },
            resizeStop: function( event, ui ) {
                $("#dialog").css("height","auto");
                if(ui.size.height > 30) {
                    $(".ui-dialog").attr("data-height",ui.size.height);
                    sessionStorage.setItem("dialogsize", JSON.stringify(ui.size))
                }
            },
            position: { my: "left top", at: "right top", of: window },
            open: function( event, ui) {
                var cl = $(".ui-dialog").find(".ui-dialog-titlebar-close");
                var col = $(cl).clone();
                $(col).addClass('colbtn')
                col.insertBefore(cl)
                col.css({"right":"30px"})
                col.html("-");
                $(".ui-dialog").attr("data-height",$(".ui-dialog").css("height"));
                col.on("click", ()=>{
                    if(!$(".ui-dialog").hasClass("collapsed")) {
                        col.html("+");
                        sessionStorage.setItem("dialogmin", "true");
                        $(".ui-dialog").addClass("collapsed").animate({"height":"30px"}, {duration: 150});
                    } else {
                        col.html("-");
                        sessionStorage.setItem("dialogmin", "false");
                        $(".ui-dialog").removeClass("collapsed").animate({"height":$(".ui-dialog").attr("data-height")}, {duration: 150});
                    }
                });
                if(sessionStorage.getItem("dialogmin") == "true") {
                    col.html("+");
                    $(".ui-dialog").addClass("collapsed").animate({"height":"30px"}, {duration: 0});
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


        var dialogposition = localStorage.getItem("dialogposition")
        if(dialogposition) {
            dialogposition=JSON.parse(dialogposition);
            let w = parseInt($('.ui-dialog').css("width"));
            var h = parseInt($('.ui-dialog').css("height"));
            var tw = w + dialogposition.left;
            var th = h + dialogposition.top;
            $('.ui-dialog').css({
                top: `${th > window.innerHeight ? window.innerHeight - h - 20 : dialogposition.top}px`,
                left: `${tw > window.innerWidth ? window.innerWidth - w - 20 : dialogposition.left}px`,
                height: `${dialogsize && dialogsize.height}px`,
                width: `${dialogsize && dialogsize.width}px`
            });
        } else {
            $('.ui-dialog').css({
                left: `${parseInt($('.ui-dialog').css("left")) - 10}px`
        })
        }

        var hi = localStorage.getItem("hilite");
        if(!hi || hi == "on") {
            solid.checked = true;
        } else {
            off.checked = true;
        }

        var marking = () => {
            q = urlParams.get('q')
            instance.mark(q, options);
            console.log(q)
            q = q.split(" ");

            q.map(w => {
                if(w.length >= 3) {
                    instance.mark(w, {
                        ...options
                    });
                }
            });
        }

        if(q && solid.checked) {
            marking();
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
    }
});
