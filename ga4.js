// ==UserScript==
// @name         Ga4 tag audits
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://tagmanager.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com

// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @resource   IMPORTED_CSS https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css
// @grant      GM_getResourceText
// @grant      GM_addStyle
// @grant      GM_setValue
// @grant      GM_getValue
// @grant      GM_listValues
// @grant      GM_deleteValue
// @grant      GM_removeValueChangeListener
// @grant      GM_addValueChangeListener
// @grant      GM_openInTab
// @grant      GM_addElement

// ==/UserScript==
/* global $ */
'use strict';
$().ready(function() {
    GM_addStyle`
.gtm-sheet-holder--animated .gtm-sheet {
transition: transform 0s !important;
}
    `;
    let tags, tagIndex, missingparams = {};
    var observer = new MutationObserver(function() {
        //console.log('mutate')
        if($('.gtm-container-menu-list').length && $(`.audit`).length == 0) {
            observer.disconnect();
            $('.gtm-container-menu-list').append(`<a class="audit gtm-container-menu-list-item md-gtm-theme">Audit</a>`)
            observer.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
        }
    });
    if($("body").length) {
        observer.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
    }

    var paramObs = new MutationObserver(function() {
        //console.log('paramObs mutate')
        //console.log($(`div[data-ng-model="ctrl.tag.data.name"]`).text())
        let eTable = $(`gtm-inherited-params-table`);
        if(eTable && $(eTable).length) {
            let rows = $(eTable).find(`div[data-ng-repeat~='ctrl.tableHelper.rows']`);
            if(rows && rows.length) {
                paramObs.disconnect();
                let tag = $(`div[data-ng-model="ctrl.tag.data.name"]`).text();
                //let ltag = $(`div[data-ng-model="ctrl.tag.data.name"]`).text().toLowerCase();
                console.log(`Tag #${tagIndex + 1}`, tag)
                //console.log($(eTable))
                //console.log($(eTable).find(`div[data-ng-init~='rowFieldPathName']`))
                echeck(tag, rows);
                $(rows).map((i,p) =>{
                    //console.log(i)
                    let cells = $(p).find(`.read-only-value`);
                    //console.log(cells)
                })
            }
        }
    });
    //console.log('$(".gtm-sheet").length', $(".gtm-sheet").length)
    if($(".gtm-sheet").length) {
        paramObs.observe($(".gtm-sheet")[0], {characterData: false, subtree: true, childList: true, attributes: false});
    }

    $(document).on('click', '.audit', (e) => {
        e.preventDefault();
        //console.log($('.open-tag-button').eq(0))
        tags = $('.open-tag-button')
        tagIndex = 0;
        //console.log($(tags).length)
        paramObs.observe($(".gtm-sheet")[0], {characterData: false, subtree: true, childList: true, attributes: false});
        $('.open-tag-button').eq(tagIndex)[0].click();
    })

    let echeck = (tag, rows) => {
        tag = tag.toLowerCase()
        let params = events[tag]
        //console.log(params)
        if(!params) {
            console.log(`Tag NOT FOUND`, tag)
            missingparams[tag] = {}
        } else {
            Object.keys(params).map((key) =>{
                //console.log(key)
                let keyfound = false;
                $(rows).map((i,p) =>{
                    //console.log(i)
                    let cells = $(p).find(`.read-only-value`);
                    //console.log(cells[0])
                    if(key == $(cells[0]).text().trim() && params[key] == $(cells[1]).text().trim()) {
                        keyfound = true;
                    }
                })
                if(!keyfound) {
                    missingparams[tag] = {
                        ...missingparams[tag]
                    }
                    missingparams[tag][key] = params[key]
                }
            })
        }

        setTimeout(() =>{
            $('.gtm-sheet-header__close')[0].click();
            setTimeout(() =>{
                paramObs.observe($(".gtm-sheet")[0], {characterData: false, subtree: true, childList: true, attributes: false});
                tagIndex += 1;
                if($('.open-tag-button').eq(tagIndex) && $('.open-tag-button').eq(tagIndex)[0]) {
                    $('.open-tag-button').eq(tagIndex)[0].click();
                } else {
                    console.log("ALL DONE")
                    console.log('MISSING PARAMS')
                    console.log(missingparams)
                }
            }, 500);
        }, 500)
    }




    let events = {
        "add_to_cart": {
            "storeID": "{{storeID}}",
            "listingID": "{{listingID}}",
            "viewName": "{{viewName}}",
            "language": "{{language}}",
            "storeDMA": "{{storeDMA}}",
            "storePostalCode": "{{storePostalCode}}",
            "storeName": "{{storeName}}",
            "retailerID": "{{retailerID}}",
            "retailerName": "{{retailerName}}",
            "siteName": "{{siteName}}",
            "navOrigin": "{{navOrigin}}",
            "navMethod": "{{navMethod}}",
            "viewMode": "{{viewMode}}",
            "viewTitle": "{{viewTitle}}",
            "sendIf": "{{sendIf}}",
            "content_group1": "{{content_group1}}",
            "page_path": "{{page_path}}",
            "event_label": "{{event_label}}",
            "children": "{{children}}",
            "event_action": "{{event_action}}",
            "event_category": "{{event_category}}",
        }
    }




    });
