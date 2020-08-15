// ==UserScript==
// @name         qh
// @namespace    http://tampermonkey.net/
// @version      1.7
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
position: absolute;
bottom: 0;
left: 0;
right: 0;
height: 300px;
background-color: black;
}
input[name=op1], input[name=op2], input[name=op3], input[value=left], input[value=right]{
display: block;
color: white;
}
input[name=op1]:after, input[name=op2]:after, input[name=op3]:after, input[value=left]:after, input[value=right]:after{
margin-left: 15px;
width: 100px;
display: inline-block;
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
input[value=left]:after{
content: 'left';
}
input[value=right]:after{
content: 'right';
}
input[value=right], input[name=op3]{
margin-bottom: 20px;
}
.bezel {
height: 75px;
width:  80%;
margin: 0 auto;
padding: 10px 10px 20px 10px;
border:2px solid grey;
border-radius: 5px;
}
.monitor{
background-color: white;
height: 100%;

margin: 0 auto;
border:1px solid grey;
border-radius: 5px;
display:flex;
align-items: center;
justify-content: flex-start;
padding: 0 5px;
}
.s1, .s2, .s3{
color: black;
height: 75%;
border:1px solid grey;
display:flex;
align-items: center;
justify-content: center;
}
`);
$().ready(function() {
    'use strict';
    var questionClass = ".vote-question", answerClass=".answer-body";
    var q, ans, qencoded;
    var ans1 = null, ans2 = null, ans3 = null, container, op1, op2, op3, left, right, bezel, monitor, s1, s2, s3;
    var lastq = "", lastans1 = "", lastans2 = "", lastans3 = "";
    var deviceHeight = screen.height - 100;

    var createinputs = () =>  {
        var channels=$("div[aria-label=Channels]");

        if(channels && channels[0] && $(".inputscontainer").length == 0) {
            channels[0].style.position = "relative";
            container = document.createElement("div");
            container.className="inputscontainer";
            channels[0].append(container);

            container.append("Layout");
            left = document.createElement("input");
            left.type = "radio";
            left.name = 'layout';
            left.value = 'left';
            left.checked = true;
            left.onclick = () => {
                updatemonitor();
            };
            container.append(left);

            right = document.createElement("input");
            right.type = "radio";
            right.name = 'layout';
            right.value = 'right';
            right.onclick = () => {
                updatemonitor();
            };
            container.append(right);

            container.append("Role");

            op1 = document.createElement("input");
            op1.type = "checkbox";
            op1.name = 'op1';
            op1.checked = true;
            op1.onclick = (e) => {
                updatemonitor();
            };
            container.append(op1);

            op2 = document.createElement("input");
            op2.type = "checkbox";
            op2.name = 'op2';
            op2.checked = true;
            op2.onclick = (e) => {
                updatemonitor();
            };
            container.append(op2);

            op3 = document.createElement("input");
            op3.type = "checkbox";
            op3.name = 'op3';
            op3.checked = true;
            op3.onclick = (e) => {
                updatemonitor();
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
            monitor.append(s1);

            s2 = document.createElement("div");
            s2.className="s2";
            s2.innerText = "2";
            s2.style.width = "25%";
            monitor.append(s2);

            s3 = document.createElement("div");
            s3.className="s3";
            s3.innerText = "3";
            s3.style.width = "25%";
            monitor.append(s3);

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
    }

    var openwindows = (override) => {
        let count = 0;
        count = op1.checked ? ++count : count;
        count = op2.checked ? ++count : count;
        count = op3.checked ? ++count : count;
        var w = (screen.width - 630) / count;
        var offset = right.checked ? 630 : 0;

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
            lastq = null;
            lastans1 = null;
            lastans2 = null;
            lastans3 = null;
        } catch(e){}
    }

    window.onbeforeunload = function(){
        closewindows();
    };

    let googlemain = `https://www.google.com/search?q=`;
    let bingmain = `https://www.bing.com/search?q=`;
    let enginemain = googlemain;

    var waitbody = setInterval(() =>{
        var messageList = $("#messages");
        if(messageList && messageList[0]) {
            clearInterval(waitbody);
            waitbody=null;
            createinputs();
            var observer = new MutationObserver(function() {
                //console.log('mutation')
                var user = messageList.find("span[class*=username-]").last().text()
                //console.log(user)
                if(user == "GrayBot") {
                    var lastmsg = messageList.find("div[id^=messages-]").last();
                    //console.log(lastmsg[0])
                    var embedded = lastmsg.find("div[class*=embedWrapper-]").last();
                    //console.log(embedded)
                    var values = embedded.find("div[class*=embedFieldValue-]");
                    //console.log(values)
                    //console.log(values[0])
                    //console.log(values[0].innerText)
                    q = values[0].innerText;
                    //console.log(q[0].innerText)
                    //console.log('q', q)
                    if(q && (q != lastq || values[1].innerText != lastans1 || values[2].innerText != lastans2 || values[3].innerText != lastans3)) {
                        //console.log("inside");
                        if((op1.checked && !ans1) || (op2.checked && !ans2) || (op3.checked && !ans3)) {
                            //console.log('openwindows')
                            openwindows(true)
                        }
                        qencoded = encodeURIComponent(q.trim());
                        let allanswers = `&brg1=${encodeURIComponent(values[1].innerText.trim())}&brg2=${encodeURIComponent(values[2].innerText.trim())}&brg3=${encodeURIComponent(values[3].innerText.trim())}`

                        if (ans1 && op1.checked && values[1].innerText) {
                            let answer = encodeURIComponent(values[1].innerText.trim());
                            ans1.location.href = `${enginemain}${answer} ${qencoded}${allanswers}`;
                        }
                        if (ans2 && op2.checked && values[2].innerText) {
                            let answer = encodeURIComponent(values[2].innerText.trim());
                            ans2.location.href = `${enginemain}${answer} ${qencoded}${allanswers}`;
                        }
                        if (ans3 && op3.checked && values[3].innerText) {
                            let answer = encodeURIComponent(values[3].innerText.trim());
                            ans3.location.href = `${enginemain}${answer} ${qencoded}${allanswers}`;
                        }
                        lastq = q;
                        lastans1 = values[1].innerText;
                        lastans2 = values[2].innerText;
                        lastans3 = values[3].innerText;
                    }
                }
            });
            observer.observe(messageList[0], {characterData: false, subtree: false, childList: true, attributes: false});

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
