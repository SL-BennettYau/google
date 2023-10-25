var version = 0.3
'use strict';

$().ready(function() {
    GM_addStyle`
.gtm-sheet-holder--animated .gtm-sheet.notrans {
transition: transform 0s !important;
}
.audit, .autofill, .auditall {
user-select: none;
}
.noaudits {
opacity: 0.50;
}
.noaudits a {
cursor: no-drop;
}
.checkall, .checkaudit {
margin-right: 10px;
height: 18px !important;
width: 18px !important;
cursor: pointer;
position: relative;
top: -1px;
}
.sloverlay {
position: absolute;
top:0;
left:0;
height:100%;
width: 100%;
z-index: 99999;
background-color: rgba(0,0,0,0.25);
display:none;
}
    `;

    $("body").append(`<div class="sloverlay"></div>`)

    let clientTags, tagIndex = 0, missingparams = {}, autofill = false, clientIndexArray = [], clientIndex = 0, auditall = false;
    let getchecked = () =>{
        $(`.checkaudit`).map((i,p) => {
            if($(p).prop("checked")) {
                let client = $(p).next().text().trim();
                if($.inArray(i,clientIndexArray) == -1) {
                    clientIndexArray.push(i)
                }
            } else {
                if($.inArray(i,clientIndexArray) != -1) {
                    clientIndexArray.splice($.inArray(i,clientIndexArray), 1);
                }
            }
        });
        clientIndexArray.sort(function(a, b) {
            return a - b;
        })
        //console.log(clientIndexArray)
    }

    let checkBoxTO = null;
    var observer = new MutationObserver(function() {
        //console.log('mutate')
        //console.log(window.location.href)
        if(window.location.href.match(/tab=accounts/gi) || window.location.href.match(/\/\#\/home$/gi)) {
            if(checkBoxTO) {
                clearTimeout(checkBoxTO);
                checkBoxTO = null;
            }
            checkBoxTO = setTimeout(() =>{
                let clientsChecked = localStorage.getItem('clientsChecked') || "{}"
                clientsChecked = JSON.parse(clientsChecked)

                if($(`.auditall`).length == 0) {
                    observer.disconnect();
                    $(`shrouter-view`).find('._md-nav-bar-list').append(`<li class='noaudits auditall md-nav-item'><a class="_md-nav-button md-accent md-button md-gtm-theme md-ink-ripple md-active md-primary">Audit All Clients</a></li>`)
                    observer.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
                }
                if($(`.checkall`).length == 0) {
                    observer.disconnect();
                    let table = null;
                    $(`.wd-account-name`).map((i,p) =>{
                        if($(p).text().match(/fusion92 shopper platform/gi)) {
                            table = $(p).closest('.account.card')
                        }
                    })

                    if(table && $(table).length) {
                        //$(`.container-name`).first().css({"display":"flex","justify-content":"flex-start","align-items":"center"})
                        $(table).find(`.container-name`).prepend(`<input type="checkbox" class='checkall' ${clientsChecked.all ? 'checked' : ''} />`)

                        $(table).find(`.gtm-table`).find(`a.wd-container-name.md-gtm-theme`).map((i,p) =>{
                            let client = $(p).text().trim();
                            $(p).css({"display":"inline-block"})
                            $(p).parent().css({"position":"relative","display":"flex","justify-content":"flex-start","align-items":"center"})
                            $(p).parent().prepend(`<input type="checkbox" class='checkaudit' ${clientsChecked[client] ? 'checked' : ''} />`)
                            $(p).parent().prepend(`<div style="position:absolute; left:3px; top:50%; transform: translate(0, -50%); font-size: 12px; font-weight: bold; line-height: 14px;">${i+1}: </div>`)
                        })
                        $(`.checkaudit`).map((i,p) => {
                            if($(p).prop('checked')) {
                                $(`.noaudits`).removeClass(`noaudits`)
                            }
                        });
                        getchecked()
                    }

                    observer.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
                }
            }, 0)
        }

        if($('.gtm-container-menu-list').length && $(`.audit`).length == 0) {
            observer.disconnect();
            //console.log(GM_info)
            $('.gtm-container-menu-list').append(`<a class="audit gtm-container-menu-list-item md-gtm-theme">Audit Params ${version}</a>`)
            $('.gtm-container-menu-list').append(`<a class="autofill gtm-container-menu-list-item md-gtm-theme">AutoFill Params ${version}</a>`)
            observer.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
        }
    });
    if($("body").length) {
        observer.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
    }

    let paramObsTO = null, loopTO = null
    var paramObs = new MutationObserver(function() {
        //console.log('paramObs mutate')
        //console.log($(`div[data-ng-model="ctrl.tag.data.name"]`).text())
        if(paramObsTO) {
            clearTimeout(paramObsTO)
            paramObsTO = null;
        }
        if(loopTO) {
            clearTimeout(loopTO)
            loopTO = null;
        }
        //paramObsTO = setTimeout(() => {
            let eTable = $(`gtm-inherited-params-table`);
            if(eTable && $(eTable).length) {
                //console.log('TABLE FOUND')
                let rows = $(eTable).find(`div[data-ng-repeat~='ctrl.tableHelper.rows']`);
                let tag = $(`div[data-ng-model="ctrl.tag.data.name"]`).text();
                let filename=$(`.suite-up-text-name`).text();
                console.log(`[${filename}] TAG: #${tagIndex + 1}`, tag)
                //console.log('rows', rows)
                if(rows && rows.length) {
                    //console.log('rows found', rows)
                    paramObs.disconnect();
                    //console.log($(eTable))
                    //console.log($(eTable).find(`div[data-ng-init~='rowFieldPathName']`))
                    //console.log('echeck')
                    echeck(tag, eTable, rows);
                } else {
                    console.log(`no rows [${filename}]`);
                    loopTO = setTimeout(() =>{
                        $(`label`).map((i,p) => {
                            if($(p).text().match(/Event Name/gi)) {
                                //console.log($(p).text())
                                paramObs.disconnect();
                                echeck(tag, eTable, []);
                            }
                        });
                    }, 3000)
                }
            } else {
                let client = $(`.suite-up-text-name`).text();
                let tag = $(`div[data-ng-model="ctrl.tag.data.name"]`).text();
                //paramObs.disconnect();
                loopTO = setTimeout(() =>{
                    console.log(`NO TABLE [${client}] TAG: #${tagIndex + 1} ${tag}`)
                    missingparams[tag] = "Possible Errors"
                    loop()

                    /*let tag = $(`div[data-ng-model="ctrl.tag.data.name"]`).text();
                    paramObs.disconnect();
                    echeck(tag, eTable, []);*/
                }, 3000)
            }
        //}, 250)
    });

    let auditor = (e) => {
        $(`.gtm-sheet-holder--animated .gtm-sheet`).addClass('notrans');
        $(`.sloverlay`).fadeIn()
        tagIndex = 0;
        let doAudit = () =>{
            if($('.open-tag-button').eq(tagIndex) && $('.open-tag-button').eq(tagIndex)[0]) {
                e.preventDefault();
                missingparams = {}
                //console.log($('.open-tag-button').eq(0))
                clientTags = $('.open-tag-button')
                //console.log($(clientTags).length)
                paramObs.observe($(".gtm-sheet")[0], {characterData: false, subtree: true, childList: true, attributes: false});
                $('.open-tag-button').eq(tagIndex)[0].click();
            }
        }
        if($('.open-tag-button').length) {
            doAudit()
        } else {
            var tagObs = new MutationObserver(function() {
                //console.log('mutate')
                if($('.open-tag-button').length) {
                    tagObs.disconnect()
                    doAudit();
                }
            });
            if($("body").length) {
                tagObs.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
            }
        }
    }

    let backtoclients = () => {
        setTimeout(() =>{
            tagIndex = 0;
            missingparams = {}
            $('button.gms-chip-button.gms-back-arrow-icon')[0].click();
            var clientObs2 = new MutationObserver(function() {
                //console.log(`$('.auditall').length`, $('.auditall').length)
                if($('.auditall').length) {
                    clientObs2.disconnect();
                    setTimeout(() =>{
                        runAuditAll();
                    }, 500)
                } else {
                }
            })
            clientObs2.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
        }, 500)
    }

    let runAuditAll = () => {
        auditall = true;
        let indices = localStorage.getItem('indices') || "[]";
        indices = JSON.parse(indices)
        let clientIndex = indices.shift()
        localStorage.setItem('indices', JSON.stringify(indices))
        clientIndex = parseInt(clientIndex);
        console.log('');
        console.log('clientIndex', clientIndex, typeof clientIndex)
        //console.log($(`.gtm-table`).first().find(`a.wd-container-name.md-gtm-theme`).eq(clientIndex))
        //console.log($(`.gtm-table`).first().find(`a.wd-container-name.md-gtm-theme`).eq(clientIndex)[0])
        //console.log('clientIndexArray', clientIndexArray)
        //return;
        if(isNaN(clientIndex)) {
            if(auditall) {
                auditall = false
                new Audio('https://raw.githubusercontent.com/SL-BennettYau/google/master/click.mp3').play()
            }
            $(`.gtm-sheet-holder--animated .gtm-sheet`).removeClass('notrans');
            $(`.sloverlay`).fadeOut()
            console.log('CLIENT LIST DONE')
            return;
        }

        if($(`.gtm-table`).first().find(`a.wd-container-name.md-gtm-theme`).eq(clientIndex) && $(`.gtm-table`).first().find(`a.wd-container-name.md-gtm-theme`).eq(clientIndex)[0]) {
            let client = $(`.gtm-table`).first().find(`a.wd-container-name.md-gtm-theme`).eq(clientIndex).text().trim();
            $(`.gtm-table`).first().find(`a.wd-container-name.md-gtm-theme`).eq(clientIndex)[0].click()

            var clientObs = new MutationObserver(function() {
                if($('.gtm-container-menu-list').length && $(`.audit`).length == 1) {
                    //console.log('clientObs mutate')
                    clientObs.disconnect()
                    $(`.audit`).trigger('dblclick')
                }
            });

            if($("body").length) {
                clientObs.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
            }

        }
    }

    // Checkboxes
    $(document).on('change', '.checkall', (e) => {
        let clientsChecked = localStorage.getItem('clientsChecked') || "{}"
        clientsChecked = JSON.parse(clientsChecked)
        if($(e.target).prop("checked")) {
            clientsChecked.all = $(e.target).prop("checked");
            $(`.auditall`).removeClass(`noaudits`)
        } else {
            delete clientsChecked.all
            $(`.auditall`).addClass(`noaudits`)
        }

        $(`.checkaudit`).map((i,p) => {
            $(p).prop("checked", $(e.target).prop("checked"))
            let client = $(p).next().text().trim();
            if($(p).prop("checked")) {
                clientsChecked[client] = $(p).prop("checked");
            } else {
                delete clientsChecked[client]
            }
            localStorage.setItem('clientsChecked', JSON.stringify(clientsChecked))
        });
        getchecked()
    })
    $(document).on('change', '.checkaudit', (e) => {
        //console.log('checkaudit')
        let client = $(e.target).next().text().trim();
        let clientsChecked = localStorage.getItem('clientsChecked') || "{}"
        clientsChecked = JSON.parse(clientsChecked)
        if($(e.target).prop("checked")) {
            clientsChecked[client] = $(e.target).prop("checked");
        } else {
            delete clientsChecked[client]
        }
        localStorage.setItem('clientsChecked', JSON.stringify(clientsChecked))

        $(`.auditall`).addClass(`noaudits`)
        $(`.checkaudit`).map((i,p) => {
            if($(p).prop('checked')) {
                $(`.noaudits`).removeClass(`noaudits`)
            }
        });
        getchecked()
    })

    // ClientList Audit
    $(document).on('dblclick', '.auditall', (e) => {
        //clientIndex = 0;
        let indices = localStorage.setItem('indices', JSON.stringify(clientIndexArray))
        runAuditAll();
    });

    // Audit / Autofill
    $(document).on('dblclick', '.audit', (e) => {
        $('.open-tag-list-button')[0].click()
        autofill = false;
        auditor(e);
    })
    $(document).on('dblclick', '.autofill', (e) => {
        $('.open-tag-list-button')[0].click()
        autofill = true;
        auditor(e);
    })

    let loop = () => {
        let closeSheet = () =>{
            $('.gtm-sheet-header__close')[0].click();
            setTimeout(() =>{
                paramObs.observe($(".gtm-sheet")[0], {characterData: false, subtree: true, childList: true, attributes: false});
                tagIndex += 1;
                let doNext = () =>{
                    if($('.open-tag-button').eq(tagIndex) && $('.open-tag-button').eq(tagIndex)[0]) {
                        $('.open-tag-button').eq(tagIndex)[0].click();
                    } else {
                        let client = $(`.suite-up-text-name`).text();
                        console.log(`[${client}] ALL DONE`)
                        console.log(`[${client}] MISSING PARAMS`)
                        console.log(missingparams)
                        createFile(missingparams)
                        paramObs.disconnect();
                        if(!auditall) {
                            new Audio('https://raw.githubusercontent.com/SL-BennettYau/google/master/click.mp3').play()
                        }
                        $(`.gtm-sheet-holder--animated .gtm-sheet`).removeClass('notrans');
                        $(`.sloverlay`).fadeOut()
                    }
                }
                if($('.open-tag-button').length) {
                    doNext();
                } else {
                    var looptagObs = new MutationObserver(function() {
                        //console.log('mutate')
                        if($('.open-tag-button').length) {
                            looptagObs.disconnect()
                            doNext();
                        }
                    });
                    looptagObs.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
                }
            }, 100);
        }
        if($('.gtm-sheet-header__close').length) {
            closeSheet()
        } else {
            var closeSheetObs = new MutationObserver(function() {
                if($('.gtm-sheet-header__close').length) {
                    //console.log('clientObs mutate')
                    closeSheetObs.disconnect()
                    closeSheet()
                }
            });
            closeSheetObs.observe($("body")[0], {characterData: false, subtree: true, childList: true, attributes: false});
        }
    }

    let echeck = (tag, eTable, rows) => {
        tag = tag.toLowerCase()
        let params = null;
        try {
            params = tags
        } catch(e) { params = localTags}
        let action = {
            ...base,
            ...params[tag]
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

            if(autofill && missingparams[tag] && Object.keys(missingparams[tag]).length > 0) {
                //console.log($(`.gtm-veditor-section-overlay.wd-veditor-section-overlay`).length)
                $(`.gtm-veditor-section-overlay.wd-veditor-section-overlay`)[0].click()
                Object.keys(missingparams[tag]).map((key, i) => {
                    //console.log('i', i)
                    setTimeout(() => {
                        let addRow = $(`button.btn--create.vt-st-add`)
                        if(addRow) {
                            $(addRow)[0].click();
                            setTimeout(() => {
                                let newrow = $(eTable).find(`div[data-ng-repeat~='ctrl.tableHelper.rows']`).last()
                                let k = $(newrow).find(`input[data-ng-model~="ctrl.value"]`).first().focus()
                                $(k).sendkeys(key);

                                let v = $(newrow).find(`input[data-ng-model~="ctrl.value"]`).last().focus();
                                let val = missingparams[tag][key];
                                val = val.replace(/\{\{/gi, "{{{").replace(/\}\}/gi, "}}}")
                                $(v).sendkeys(val);
                                //console.log(key, missingparams[tag][key])
                                if(i+1 >= Object.keys(missingparams[tag]).length) {
                                    setTimeout(() => {
                                        $('.veditor__section--edit').find('button.btn.btn-action.hide-read-only.left-spacer')[0].click()
                                        //console.log('loop1')
                                        loop()
                                    }, 500)
                                }
                            }, 250)
                        }
                    }, (i+1) * 500)
                })
                return;
            } else {
                //console.log('loop2')
                loop()
            }
        }
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
        let x;
        if(Object.keys(db).length == 0) {
            link.setAttribute('download', `${filename}-${!autofill ? 'Audit':'Autofill'}-ALLPASSED.txt`);
            x = "ALL TAGS PASSED"
        } else {
            link.setAttribute('download', `${filename}-${!autofill ? 'Audit':'Autofill'}-[${Object.keys(db).length}].txt`);
            db = Object.keys(db).sort().reduce(
                (obj, key) => {
                    obj[key] = db[key];
                    return obj;
                },
                {}
            );
            x = JSON.stringify(db, null, 4);

            x = x.replace(/\"/gim,"").replace(/\s\},/gim, ` }\n`).replace(/,/gim,"").replace(/^\{/im, `${filename} ${!autofill ? 'Audit:\n':'Autofill:\n'}`).replace(/\{\}/gi,`{}\n`).replace(/Possible Errors/gi,`{\n        Possible Errors\n    }\n`)
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
            autofill = false;
            if(cb) {
                cb()
            }
            if(auditall) {
                backtoclients();
            }
        });
    };



});



