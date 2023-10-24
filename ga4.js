var version = 0.2
// ==UserScript==
// @name         Ga4 tag audits
// @namespace    http://tampermonkey.net/
// @description  ga4 auditor
// @author       You
// @match        https://tagmanager.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require      https://raw.githubusercontent.com/SL-BennettYau/google/master/bililiteRange.js
// @require      https://raw.githubusercontent.com/SL-BennettYau/google/master/sendkeys.js
// @zrequire      https://raw.githubusercontent.com/SL-BennettYau/google/master/tags.js
// @zrequire      https://raw.githubusercontent.com/SL-BennettYau/google/master/ga4.js

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
/* global $ tags */
'use strict';
$().ready(function() {
    GM_addStyle`
.gtm-sheet-holder--animated .gtm-sheet {
transition: transform 0s !important;
}
    `;
    let clientTags, tagIndex = 0, missingparams = {};
    var observer = new MutationObserver(function() {
        //console.log('mutate')
        if($('.gtm-container-menu-list').length && $(`.audit`).length == 0) {
            observer.disconnect();
            //console.log(GM_info)
            $('.gtm-container-menu-list').append(`<a class="audit gtm-container-menu-list-item md-gtm-theme">Audit ${version}</a>`)
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
                //console.log('echeck')
                echeck(tag, eTable, rows);
                $(rows).map((i,p) =>{
                    //console.log(i)
                    let cells = $(p).find(`.read-only-value`);
                    //console.log(cells)
                })
            }
        }
    });
    //console.log('$(".gtm-sheet").length', $(".gtm-sheet").length)
    /*if($(".gtm-sheet").length) {
        paramObs.observe($(".gtm-sheet")[0], {characterData: false, subtree: true, childList: true, attributes: false});
    }*/

    $(document).on('click', '.audit', (e) => {
        tagIndex = 0;
        if($('.open-tag-button').eq(tagIndex) && $('.open-tag-button').eq(tagIndex)[0]) {
            e.preventDefault();
            missingparams = {}
            //console.log($('.open-tag-button').eq(0))
            clientTags = $('.open-tag-button')
            //console.log($(clientTags).length)
            paramObs.observe($(".gtm-sheet")[0], {characterData: false, subtree: true, childList: true, attributes: false});
            //tags = localTags;
            //console.log(tags)

            $('.open-tag-button').eq(tagIndex)[0].click();
        }
    })

    let echeck = (tag, eTable, rows) => {
        tag = tag.toLowerCase()
        let params = null;
        try {
            params = tags
        } catch(e) { params = localTags}

        let action = params[tag]
        //console.log(action)

        if(!action) {
            console.log(`Tag NOT FOUND`, tag, `USING BASE`)
            action = params.base;
        }
        if(action) {
            Object.keys(action).map((key) =>{
                //console.log(key)
                let keyfound = false;
                $(rows).map((i,p) =>{
                    //console.log(i)
                    let cells = $(p).find(`.read-only-value`);
                    //console.log(cells[0])
                    if(key == $(cells[0]).text().trim() && action[key] == $(cells[1]).text().trim()) {
                        keyfound = true;
                    }
                })
                if(!keyfound) {
                    missingparams[tag] = {
                        ...missingparams[tag]
                    }
                    console.log(`Missing Param ${key} = ${action[key]}`)
                    missingparams[tag][key] = action[key]
                }
            })
            if(Object.keys(missingparams[tag]).length > 0) {
                //console.log($(`.gtm-veditor-section-overlay.wd-veditor-section-overlay`).length)
                $(`.gtm-veditor-section-overlay.wd-veditor-section-overlay`)[0].click()
                Object.keys(missingparams[tag]).map((key, i) => {
                    console.log('i', i)
                    setTimeout(() => {
                        let addRow = $(`button.btn--create.vt-st-add`)
                        if(addRow) {
                            $(addRow)[0].click();
                            setTimeout(() => {
                                let newrow = $(eTable).find(`div[data-ng-repeat~='ctrl.tableHelper.rows']`).last()
                                let k = $(newrow).find(`input[data-ng-model~="ctrl.value"]`).first().focus()
                                //$(k).val(key)
                                $(k).sendkeys(key);

                                let v = $(newrow).find(`input[data-ng-model~="ctrl.value"]`).last().focus();
                                //$(v).val(missingparams[tag][key])
                                let val = missingparams[tag][key];
                                val = val.replace(/\{\{/gi, "{{{").replace(/\}\}/gi, "}}}")
                                $(v).sendkeys(val);
                                console.log(key, missingparams[tag][key])
                                if(i+1 >= Object.keys(missingparams[tag]).length) {
                                    setTimeout(() => {
                                        $('.veditor__section--edit').find('button.btn.btn-action.hide-read-only.left-spacer')[0].click()
                                    }, 500)
                                }
                            }, 250)
                        }
                    }, (i+1) * 500)
                })
                /*setTimeout(() => {
                    $('.veditor__section--edit').find('button.btn.btn-action.hide-read-only.left-spacer')[0].click()
                    setTimeout(() => {
                        $('.veditor__section--edit').find('button.btn.btn-action.hide-read-only.left-spacer')[0].click()
                        setTimeout(() => {
                            $('.veditor__section--edit').find('button.btn.btn-action.hide-read-only.left-spacer')[0].click()
                            setTimeout(() => {
                                $('.veditor__section--edit').find('button.btn.btn-action.hide-read-only.left-spacer')[0].click()
                            }, 500)
                        }, 500)
                    }, 500)
                }, 500)*/
                return;
            }

        }

        return;

        setTimeout(() =>{
            $('.gtm-sheet-header__close')[0].click();
            setTimeout(() =>{
                paramObs.observe($(".gtm-sheet")[0], {characterData: false, subtree: true, childList: true, attributes: false});
                tagIndex += 1;
                if(false && $('.open-tag-button').eq(tagIndex) && $('.open-tag-button').eq(tagIndex)[0]) {
                    $('.open-tag-button').eq(tagIndex)[0].click();
                } else {
                    console.log("ALL DONE")
                    console.log('MISSING PARAMS')
                    console.log(missingparams)
                    createFile(missingparams)
                    paramObs.disconnect();
                    new Audio('https://raw.githubusercontent.com/SL-BennettYau/google/master/click.mp3').play()
                }
            }, 100);
        }, 100)
    }




    let localTags = {
        "add_to_cart": {
            "ABC": "{{ABC}}",
            "DEF": "{{DEF}}",
            "GHI": "{{GHI}}",
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
            "content_group1": "{{content_group1}}",
            "page_path": "{{page_path}}",
            "event_label": "{{event_label}}",
            "event_action": "{{event_action}}",
            "event_category": "{{event_category}}",
        },

        "base": {
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
            "content_group1": "{{content_group1}}",
            "page_path": "{{page_path}}",
            "event_label": "{{event_label}}",
            "event_action": "{{event_action}}",
            "event_category": "{{event_category}}",
        },
    }


    let textFile = null;
    let makeTextFile = function (text) {
        let data = new Blob([text], {type: 'text/plain'});
        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }
        textFile = window.URL.createObjectURL(data);
        return textFile;
    };


    let createFile = function(db, cb) {
        let filename=$(`.suite-up-text-name`).text();
        let link = document.createElement('a');
        link.setAttribute('download', `${filename}.txt`);
        let x;
        if(Object.keys(db).length == 0) {
            x = "ALL GOOD"
        } else {
            db = Object.keys(db).sort().reduce(
                (obj, key) => {
                    obj[key] = db[key];
                    return obj;
                },
                {}
            );
            x = JSON.stringify(db, null, 4);
            x = x.replace(/\"/gim,"").replace(/\s\},/gim, ` }\n`).replace(/,/gim,"").replace(/^\{/im,"")
            //x = x.replace(/\"/gim,"").replace(/\s\},/gim, ` }\n`).replace(/\{\},/gim, ` {}\n`).replace(/,/gim,"").replace(/^\{/im,"")
            let temp = x.split('')
            temp.pop()
            x = temp.join('')
        }

        link.href = makeTextFile(x);
        document.body.appendChild(link);
        window.requestAnimationFrame(function () {
            let event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
            paramObs.disconnect();
            if(cb) {
                cb()
            }
        });
    };



});



