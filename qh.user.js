// ==UserScript==
// @name         qh
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  try to take over the world!
// @author       You
// @match        https://discord.com/*
// @grant        none
// @require http://code.jquery.com/jquery-3.4.1.min.js

// ==/UserScript==
/* eslint-disable */
$().ready(function() {
    'use strict';
    var questionClass = ".vote-question", answerClass=".answer-body";
    var q, ans, qencoded;
    var ans1 = null, ans2 = null, ans3 = null;
    var lastq = "", lastans1 = "", lastans2 = "", lastans3 = "";
    var deviceHeight = screen.height - 100;
    var deviceWidth = (screen.width - 630) / 3;
    let w = deviceWidth;
    var openwindows = (override) => {
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
            ans1 = window.open('https://www.google.com/?&hl=en', 'ans1', "width="+w+", height="+deviceHeight)
            ans2 = window.open('https://www.google.com/?&hl=en', 'ans2', "width="+w+", height="+deviceHeight+", left="+w)
            ans3 = window.open('https://www.google.com/?&hl=en', 'ans3', "width="+w+", height="+deviceHeight+", left="+(2*w))
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
            var observer = new MutationObserver(function() {
                var lastmsg = messageList.find("div[id^=messages-]").last();
                //console.log(lastmsg[0])
                var user = messageList.find("span[class*=username-]").last().text()
                console.log(user)
                if(user == "GrayBot") {
                    var embedded = lastmsg.find("div[class*=embedWrapper-]").last();
                    //console.log(embedded)
                    var values = embedded.find("div[class*=embedFieldValue-]");
                    //console.log(values)
                    //console.log(values[0])
                    //console.log(values[0].innerText)
                    q = values[0].innerText;
                    //console.log(q[0].innerText)

                    if(q && (q != lastq || values[1].innerText != lastans1 || values[2].innerText != lastans2 || values[3].innerText != lastans3)) {
                        if(!ans1) {
                            //console.log('openwindows')
                            openwindows(true)
                        }
                        qencoded = encodeURIComponent(q.trim());

                        if (ans1 && values[1].innerText) {
                            let answer = encodeURIComponent(values[1].innerText.trim());
                            ans1.location.href = `${enginemain}${answer} ${qencoded}&brg1=${answer}`;
                        }
                        if (ans2 && values[2].innerText) {
                            let answer = encodeURIComponent(values[2].innerText.trim());
                            ans2.location.href = `${enginemain}${answer} ${qencoded}&brg2=${answer}`;
                        }
                        if (ans3 && values[3].innerText) {
                            let answer = encodeURIComponent(values[3].innerText.trim());
                            ans3.location.href = `${enginemain}${answer} ${qencoded}&brg2=${answer}`;
                        }
                        lastq = q;
                        lastans1 = values[1].innerText;
                        lastans2 = values[2].innerText;
                        lastans3 = values[3].innerText;
                    }
                }
            });
            observer.observe(messageList[0], {characterData: true, subtree: true, childList: true, attributes: false});

            document.onkeydown = function(evt) {
                evt = evt || window.event;
                // keybinds
                try{
                    //F9 windows
                    if(evt.keyCode == 120) {
                        if(ans1){
                            closewindows()
                        } else {
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
