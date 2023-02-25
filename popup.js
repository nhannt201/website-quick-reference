var pub_json = "";
var pub_urls = "";
var pub_hostname = "";

document.addEventListener('DOMContentLoaded', function() {
    var ifConnected = window.navigator.onLine;
    var checkPageButton = document.getElementById('checkPage');
    if (ifConnected) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            const tab = tabs[0];
            console.log(tab, 'tab');

            const urla = tab.url;
            pub_urls = urla;

            const tabId = tab.id;

            const urls = new URL(urla)

            const host_name = urls.hostname;
            pub_hostname = host_name;

            const isChromeWebStore = urla.includes('chrome.google.com/webstore');



            if (isValidWebUrl(urls)) {


                if (!isChromeWebStore) {
                    chrome.debugger.attach({
                        tabId: tabId
                    }, '1.0', function() {
                        chrome.debugger.sendCommand({
                            tabId: tabId
                        }, 'DOM.getDocument', {}, function(result) {
                            if (result) {
                                var rootNodeId = result.root.nodeId;
                                chrome.debugger.sendCommand({
                                    tabId: tabId
                                }, 'DOM.getOuterHTML', {
                                    "nodeId": rootNodeId
                                }, function(result) {
                                    var html = result.outerHTML;
                                    var parser = new DOMParser();
                                    var doc = parser.parseFromString(html, 'text/html');

                                    var title = doc?.title || '';

                                    const author = [
                                        doc.querySelector('meta[name="author"]')?.getAttribute('content'),
                                        doc.querySelector('meta[property="author"]')?.getAttribute('content'),
                                        doc.querySelector('meta[name="twitter:creator"]')?.getAttribute('content'),
                                        doc.querySelector('meta[property="twitter:author"]')?.getAttribute('content'),
                                        doc.querySelector('meta[property="og:article:author"]')?.getAttribute('content'),
                                        doc.querySelector('meta[property="og:profile:first_name"]')?.getAttribute('content'),
                                        doc.querySelector('meta[property="og:profile:last_name"]')?.getAttribute('content'),
                                        doc.querySelector('meta[property="og:profile:username"]')?.getAttribute('content'),
                                        doc.querySelector('a[rel="author"]')?.textContent
                                    ].find(value => value !== undefined && value !== '');



                                    const sitename = [
                                        doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content'),
                                        doc.querySelector('meta[name="application-name"]')?.getAttribute('content'),
                                        doc.querySelector('meta[name="msapplication-tooltip"]')?.getAttribute('content'),
                                        doc.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content'),
                                        doc.querySelector('meta[name="og:title"]')?.getAttribute('content')
                                    ].find(value => value !== undefined && value !== '');


                                    const published_time_elem = doc.querySelector('meta[property="article:published_time"]');
                                    let published_time = '';
                                    if (published_time_elem) {
                                        const date = new Date(published_time_elem.getAttribute('content'));
                                        if (!isNaN(date.getTime())) {
                                            published_time = date.getFullYear().toString();
                                        }
                                    }

                                    var pageInfo = {
                                        title: title,
                                        author: author,
                                        sitename: host_name,
                                        published_time: published_time,
                                        url: urla,
                                        domain: host_name
                                    };


                                    pub_json = pageInfo
                                    processJSON(pub_json);

                                    chrome.debugger.detach({
                                        tabId: tabId
                                    });
                                });

                            } else {
                                var pageInfo = {
                                    title: tab.title,
                                    author: '',
                                    sitename: host_name,
                                    url: urla,
                                    domain: host_name
                                };


                                pub_json = pageInfo
                                processJSON(pub_json);
                            }

                        });

                    });


                } else {
                    var pageInfo = {
                        title: tab.title,
                        author: '',
                        sitename: host_name,
                        url: urla,
                        domain: host_name
                    };


                    pub_json = pageInfo
                    processJSON(pub_json);
                }




                var xmlhttpgg = new XMLHttpRequest();
                var nepssss = 'aHR0cHM6Ly93d3cuZ29vZ2xlLWFuYWx5dGljcy5jb20vZy9jb2xsZWN0P3Y9MiZ0aWQ9Ry1CRENTVjBUM01TJl9kYmc9MSZjaWQ9MTA5NDk5MTI1NS4xNjIyMDE4MTY3JmVuPUNocm9tZUV4dGVuc3Rpb24mZXAub3JpZ2luPWZpcmViYXNl';
                var urlssss = window.atob(nepssss);

                xmlhttpgg.onreadystatechange = function() {
                    if (xmlhttpgg.readyState == 4 && xmlhttpgg.status == 200) {
                        console.log("getinfo()");
                    }
                }

                xmlhttpgg.open("GET", (urlssss), true);
                xmlhttpgg.send();



            } else {
                document.getElementById("main-content").innerHTML = "<br><div class='logohome text-center'><img src='./img/warn.png' width='80px'><br><br><h4>No valid URL found!</h4></div>";
            }
        });
        var btnCopy1 = document.getElementById('btnCopy1');
        btnCopy1.addEventListener('click', function() {
            CopyToClipboard("refweb");
            btnCopy1.innerHTML = "Copied content!";
        });

        var btnEdit = document.getElementById('btnEdit');
        btnEdit.addEventListener('click', function() {
            var ncCl = document.getElementById("edit_nc");
            if (ncCl.style.display == "block") {
                ncCl.style.display = "none";
            } else {
                ncCl.style.display = "block";
            }

        });
        var btnEdit = document.getElementById('update_ref');
        btnEdit.addEventListener('click', function() {
            var fname = document.getElementById('firstname').value;
            var lname = document.getElementById('lastname').value;
            var sname = document.getElementById('sitename').value;
            var pname = document.getElementById('pagetitle').value;
            var ypublic = document.getElementById('published_time').value;

            procJSONwithEdit(pub_json, pub_hostname, pub_urls, fname, lname, pname, sname, ypublic);
            document.getElementById("edit_nc").style.display = "none";

        });




    } else {
        document.getElementById("main-content").innerHTML = "<br><div class='logohome text-center'><img src='./img/nointernet.png' width='80px'><br><br><h4>Unable to connect to server!</h4></div>";
    }

}, false);

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function processJSON(json_res) {
    var d = new Date();
    var hostname = json_res.domain || '';
    var url_tab = json_res.url;
    var domain = capitalizeFirstLetter(hostname.replace('www.', ''));
    var arr = json_res;
    if (arr.title == null) {
        var PageName = "";
    } else {
        var PageName = arr.title.trim();
    }
    document.getElementById("pagetitle").value = PageName;
    if (arr.auhtor == null) {
        var Author = "";
        var FName = "";
        var LName = "";

    } else {
        var Author = arr.auhtor.split(" ");
        var FName = Author[0];
        document.getElementById("firstname").value = FName;
        var LName = "";
        if (Author.length > 1) {
            FName = Author[0];
            for (i = 1; i < Author.length; i++) {
                LName += Author[i] + " ";
            }
        } else {
            FName = Author[0];
        }
        LName = LName.trim();
        document.getElementById("lastname").value = LName;
    }
    if (arr.published_time == null) {
        YearPublic = "n.d";
    } else {
        var YearPublic = arr.published_time;
        if (YearPublic == "") {
            YearPublic = d.getFullYear();
        }
    }
    document.getElementById("published_time").value = YearPublic;

    var UrlX = decodeURI(url_tab);




    var Year = d.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var Month = monthNames[d.getMonth()];
    var Day = d.getDate();
    if (arr.sitename == null) {
        var SiteName = "";
    } else {
        var SiteName = arr.sitename;
    }
    document.getElementById("sitename").value = SiteName;

    var Result = "";
    var InText = "";

    var pageNameS = "";
    var pageName_inText = "";
    if (PageName == "") {
        pageNameS = ""
    } else {
        pageNameS = PageName + ". "
    }
    if (PageName == "") {
        pageName_inText = domain + ", ";
    } else {
        pageName_inText = PageName + ", ";
    }

    if ((FName == "") && (LName == "")) {
        var siteNameS = "";
        if (SiteName == "") {
            siteNameS = domain + ". ";
            SiteName = domain;
        } else {
            siteNameS = SiteName + ". ";
        }
        Result += siteNameS + YearPublic + ". <i>" + pageNameS + "</i>[ONLINE] Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += pageName_inText + YearPublic;
    } else if ((FName.length > 0) && (LName == "") && (SiteName == "")) {
        var siteNameS = "";
        if (SiteName == "") {
            siteNameS = domain + ". ";
            SiteName = domain;
        } else {
            siteNameS = SiteName + ". ";
        }
        Result += siteNameS + YearPublic + ". <i>" + pageNameS + "</i>[ONLINE] Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += pageName_inText + YearPublic;
    } else if ((FName == "") && (LName.length > 0)) {
        Result += LName + ", " + YearPublic + ". <i>" + pageNameS + "</i>[ONLINE] Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += LName + ", " + YearPublic;
    } else if ((FName.length > 0) && (LName == "")) {
        var siteNameS = "";
        if (SiteName == "") {
            siteNameS = domain + ". ";
            SiteName = domain;
        } else {
            siteNameS = SiteName + ". ";
        }
        Result += siteNameS + YearPublic + ". <i>" + pageNameS + "</i>[ONLINE] Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += pageName_inText + YearPublic;
    } else {
        var FnameS = FName.substring(0, 1);
        var siteNameS = "";
        if (SiteName == "") {
            siteNameS = "";
            SiteName = domain;
        } else {
            siteNameS = SiteName + ". ";
        }
        Result += LName + ", " + FnameS + "., " + YearPublic + ". <i>" + pageNameS + "</i> [ONLINE] " + siteNameS + "Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += LName + ", " + YearPublic;

    }
    InText = InText.replace(/[\n\r]+/g, ' ');
    Result = Result.replace(/[\n\r]+/g, ' ');
    document.getElementById("refweb").innerHTML = Result;
    document.getElementById("intext").innerHTML = "<p>(" + InText + ")</p>";
    document.getElementById('btnCopy1').style.display = "block";
    document.getElementById('after-intext').style.display = "block";
    document.getElementById('content-tam').style.display = "none";

}

function procJSONwithEdit(json_res, hostname, url_tab, fname, lname, pname, sname, ypublic) {
    var d = new Date();
    var domain = capitalizeFirstLetter(hostname.replace('www.', ''));
    var arr = json_res;
    var PageName = pname;
    var FName = fname;
    var LName = lname.trim();
    var YearPublic = ypublic;

    var UrlX = decodeURIComponent(url_tab);




    var Year = d.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var Month = monthNames[d.getMonth()];
    var Day = d.getDate();
    var SiteName = sname;

    var Result = "";
    var InText = "";

    var pageNameS = "";
    var pageName_inText = "";
    if (PageName == "") {
        pageNameS = ""
    } else {
        pageNameS = PageName + ". "
    }
    if (PageName == "") {
        pageName_inText = domain + ", ";
    } else {
        pageName_inText = PageName + ", ";
    }

    if ((FName == "") && (LName == "")) {
        var siteNameS = "";
        if (SiteName == "") {
            siteNameS = domain + ". ";
            SiteName = domain;
        } else {
            siteNameS = SiteName + ". ";
        }
        Result += siteNameS + YearPublic + ". <i>" + pageNameS + "</i>[ONLINE] Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += pageName_inText + YearPublic;
    } else if ((FName.length > 0) && (LName == "") && (SiteName == "")) {
        var siteNameS = "";
        if (SiteName == "") {
            siteNameS = domain + ". ";
            SiteName = domain;
        } else {
            siteNameS = SiteName + ". ";
        }
        Result += siteNameS + YearPublic + ". <i>" + pageNameS + "</i>[ONLINE] Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += pageName_inText + YearPublic;
    } else if ((FName == "") && (LName.length > 0)) {
        Result += LName + ", " + YearPublic + ". <i>" + pageNameS + "</i>[ONLINE] Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += LName + ", " + YearPublic;
    } else if ((FName.length > 0) && (LName == "")) {
        var siteNameS = "";
        if (SiteName == "") {
            siteNameS = domain + ". ";
            SiteName = domain;
        } else {
            siteNameS = SiteName + ". ";
        }
        Result += siteNameS + YearPublic + ". <i>" + pageNameS + "</i>[ONLINE] Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += pageName_inText + YearPublic;
    } else {
        var FnameS = FName.substring(0, 1);
        var siteNameS = "";
        if (SiteName == "") {
            siteNameS = "";
            SiteName = domain;
        } else {
            siteNameS = SiteName + ". ";
        }
        Result += LName + ", " + FnameS + "., " + YearPublic + ". <i>" + pageNameS + "</i>[ONLINE] " + siteNameS + "Available at: " + UrlX + ". [Accessed " + Day + " " + Month + " " + Year + "].";
        InText += LName + ", " + YearPublic;

    }
    InText = InText.replace(/[\n\r]+/g, ' ');
    Result = Result.replace(/[\n\r]+/g, ' ');
    document.getElementById("refweb").innerHTML = Result;

    document.getElementById("intext").innerHTML = "(" + InText + ")";
    document.getElementById('btnCopy1').style.display = "block";
    document.getElementById('after-intext').style.display = "block";
    document.getElementById('content-tam').style.display = "none";

}


function CopyToClipboard(containerid) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select().createTextRange();
        document.execCommand("copy");
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().addRange(range);
        document.execCommand("copy");

    }
}

function isValidWebUrl(url) {
    let regEx = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
    return regEx.test(url);
}