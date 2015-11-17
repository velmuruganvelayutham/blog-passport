"use strict";
angular.module("votingApp", ["ngCookies", "ngResource", "ngSanitize", "ngRoute", "ui.bootstrap", "chart.js"]).config(["$routeProvider", "$locationProvider", "$httpProvider", function(a, b, c) {
    a.otherwise({
        redirectTo: "/"
    }), b.html5Mode(!0), c.interceptors.push("authInterceptor")
}]).factory("authInterceptor", ["$rootScope", "$q", "$cookieStore", "$location", function(a, b, c, d) {
    return {
        request: function(a) {
            return a.headers = a.headers || {}, c.get("token") && (a.headers.Authorization = "Bearer " + c.get("token")), a
        },
        responseError: function(a) {
            return 401 === a.status ? (d.path("/login"), c.remove("token"), b.reject(a)) : b.reject(a)
        }
    }
}]).run(["$rootScope", "$location", "Auth", function(a, b, c) {
    a.$on("$routeChangeStart", function(a, d) {
        c.isLoggedInAsync(function(a) {
            d.authenticate && !a && b.path("/login")
        })
    })
}]), angular.module("votingApp").config(["$routeProvider", function(a) {
    a.when("/login", {
        templateUrl: "app/account/login/login.html",
        controller: "LoginCtrl"
    }).when("/signup", {
        templateUrl: "app/account/signup/signup.html",
        controller: "SignupCtrl"
    }).when("/settings", {
        templateUrl: "app/account/settings/settings.html",
        controller: "SettingsCtrl",
        authenticate: !0
    })
}]), angular.module("votingApp").controller("LoginCtrl", ["$scope", "Auth", "$location", "$window", function(a, b, c, d) {
    a.user = {}, a.errors = {}, a.login = function(d) {
        a.submitted = !0, d.$valid && b.login({
            email: a.user.email,
            password: a.user.password
        }).then(function() {
            c.path("/")
        })["catch"](function(b) {
            a.errors.other = b.message
        })
    }, a.loginOauth = function(a) {
        d.location.href = "/auth/" + a
    }
}]), angular.module("votingApp").controller("SettingsCtrl", ["$scope", "User", "Auth", function(a, b, c) {
    a.errors = {}, a.changePassword = function(b) {
        a.submitted = !0, b.$valid && c.changePassword(a.user.oldPassword, a.user.newPassword).then(function() {
            a.message = "Password successfully changed."
        })["catch"](function() {
            b.password.$setValidity("mongoose", !1), a.errors.other = "Incorrect password", a.message = ""
        })
    }, a.loginOauth = function(a) {
        $window.location.href = "/auth/" + a
    }
}]), angular.module("votingApp").controller("SignupCtrl", ["$scope", "Auth", "$location", "$window", function(a, b, c, d) {
    a.user = {}, a.errors = {}, a.register = function(d) {
        a.submitted = !0, d.$valid && b.createUser({
            name: a.user.name,
            email: a.user.email,
            password: a.user.password
        }).then(function() {
            c.path("/")
        })["catch"](function(b) {
            b = b.data, a.errors = {}, angular.forEach(b.errors, function(b, c) {
                d[c].$setValidity("mongoose", !1), a.errors[c] = b.message
            })
        })
    }, a.loginOauth = function(a) {
        d.location.href = "/auth/" + a
    }
}]), angular.module("votingApp").controller("AdminCtrl", ["$scope", "$http", "Auth", "User", function(a, b, c, d) {
    a.users = d.query(), a["delete"] = function(b) {
        d.remove({
            id: b._id
        }), angular.forEach(a.users, function(c, d) {
            c === b && a.users.splice(d, 1)
        })
    }
}]), angular.module("votingApp").config(["$routeProvider", function(a) {
    a.when("/admin", {
        templateUrl: "app/admin/admin.html",
        controller: "AdminCtrl"
    })
}]), angular.module("votingApp").controller("MainCtrl", ["$scope", "$http", "$location", "Auth", function(a, b, c, d) {
    if (a.isLoggedIn = d.isLoggedIn, a.page = "newPoll", a.placeholders = ["Coke", "Pepsi"], a.pollName = {
            name: ""
        }, a.pollOptions = [], a.pollResults = [], a.currentUser = d.getCurrentUser().name, a.loadPoll = function(c, d, e) {
            b.get("/api/polls/" + c + "/" + d).success(function(b, c) {
                if (b[0]) {
                    console.log(b[0].poll_results), console.log(b[0].poll_options);
                    var d = [];
                    d.push(b[0].poll_results), a.data = d, a.labels = b[0].poll_options, a.pollName = b[0].poll_name, a.pollCreator = b[0].user_name, a.pollOptions = b[0].poll_options, a._id = b[0]._id
                }
                a.page = e, "results" === e && $(".results").css({
                    display: "block",
                    visibility: "visible",
                    backgroundColor: "pink"
                })
            }).error(function(a, b) {
                console.log(b)
            })
        }, a.addPoll = function() {
            console.log("Submitting poll for " + d.getCurrentUser().name + "..."), a.pollName = a.pollName.name.split("").map(function(a) {
                return /[\w\s]/.test(a) ? a : void 0
            }).join(""), b.post("/api/polls", {
                user_name: d.getCurrentUser().name,
                poll_name: a.pollName,
                poll_options: a.pollOptions,
                poll_results: a.makeArr(a.pollOptions.length)
            }).success(function() {
                console.log("New poll posted"), a.page = "newPollPosted", a.pollName = {
                    name: ""
                }, a.pollOptions = []
            }), a.url = "", a.url = window.location + d.getCurrentUser().name + "/" + a.pollName
        }, a.loadNewPoll = function() {
            $(".results").css("display", "none"), a.page = "newPoll", a.pollName = {
                name: ""
            }, a.pollOptions = [], c.path("/")
        }, a.addVote = function() {
            var c = $("input[type='radio']:checked").val();
            console.log("Submitting " + d.getCurrentUser().name + "'s vote for poll id: " + a._id), c = Number(c), b.put("api/polls/" + a._id + "/" + c).success(function(b) {
                console.log("Vote submitted"), a.loadPoll(a.pollCreator, a.pollName, "results")
            })
        }, a.loadAllPolls = function() {
            b.get("api/polls/" + d.getCurrentUser().name).success(function(b) {
                a.polls = b, $(".results").css("display", "none"), a.page = "allPolls"
            })
        }, a.deletePoll = function(a) {
            b["delete"]("api/polls/" + a).success(function() {
                var b = a;
                b = "#" + b.split(" ")[0], $(b).remove()
            })
        }, a.addOption = function() {
            a.placeholders.push("New Option")
        }, a.makeArr = function(a) {
            for (var b = [], c = 0; a > c; c++) b.push(0);
            return b
        }, /[^\/].*(?=\/)/.test(c.path())) {
        a.page = "";
        var e = c.path(),
            f = e.match(/[^\/].*(?=\/)/),
            g = e.match(/.\/.*(?=$)/);
        g = g[0].substr(2, g[0].length), a.loadPoll(f, g, "vote")
    }
}]), angular.module("votingApp").config(["$routeProvider", function(a) {
    a.when("/", {
        templateUrl: "app/main/main.html",
        controller: "MainCtrl"
    }).when("/:user_name/:poll_name", {
        templateUrl: "app/main/main.html",
        controller: "MainCtrl"
    })
}]).config(["ChartJsProvider", function(a) {
    a.setOptions({
        responsive: !1
    }), a.setOptions("Line", {
        datasetFill: !1
    })
}]), angular.module("votingApp").factory("Auth", ["$location", "$rootScope", "$http", "User", "$cookieStore", "$q", function(a, b, c, d, e, f) {
    var g = {};
    return e.get("token") && (g = d.get()), {
        login: function(a, b) {
            var h = b || angular.noop,
                i = f.defer();
            return c.post("/auth/local", {
                email: a.email,
                password: a.password
            }).success(function(a) {
                return e.put("token", a.token), g = d.get(), i.resolve(a), h()
            }).error(function(a) {
                return this.logout(), i.reject(a), h(a)
            }.bind(this)), i.promise
        },
        logout: function() {
            e.remove("token"), g = {}
        },
        createUser: function(a, b) {
            var c = b || angular.noop;
            return d.save(a, function(b) {
                return e.put("token", b.token), g = d.get(), c(a)
            }, function(a) {
                return this.logout(), c(a)
            }.bind(this)).$promise
        },
        changePassword: function(a, b, c) {
            var e = c || angular.noop;
            return d.changePassword({
                id: g._id
            }, {
                oldPassword: a,
                newPassword: b
            }, function(a) {
                return e(a)
            }, function(a) {
                return e(a)
            }).$promise
        },
        getCurrentUser: function() {
            return g
        },
        isLoggedIn: function() {
            return g.hasOwnProperty("role")
        },
        isLoggedInAsync: function(a) {
            g.hasOwnProperty("$promise") ? g.$promise.then(function() {
                a(!0)
            })["catch"](function() {
                a(!1)
            }) : a(g.hasOwnProperty("role") ? !0 : !1)
        },
        isAdmin: function() {
            return "admin" === g.role
        },
        getToken: function() {
            return e.get("token")
        }
    }
}]), angular.module("votingApp").factory("User", ["$resource", function(a) {
    return a("/api/users/:id/:controller", {
        id: "@_id"
    }, {
        changePassword: {
            method: "PUT",
            params: {
                controller: "password"
            }
        },
        get: {
            method: "GET",
            params: {
                id: "me"
            }
        }
    })
}]), angular.module("votingApp").factory("Modal", ["$rootScope", "$modal", function(a, b) {
    function c(c, d) {
        var e = a.$new();
        return c = c || {}, d = d || "modal-default", angular.extend(e, c), b.open({
            templateUrl: "components/modal/modal.html",
            windowClass: d,
            scope: e
        })
    }
    return {
        confirm: {
            "delete": function(a) {
                return a = a || angular.noop,
                    function() {
                        var b, d = Array.prototype.slice.call(arguments),
                            e = d.shift();
                        b = c({
                            modal: {
                                dismissable: !0,
                                title: "Confirm Delete",
                                html: "<p>Are you sure you want to delete <strong>" + e + "</strong> ?</p>",
                                buttons: [{
                                    classes: "btn-danger",
                                    text: "Delete",
                                    click: function(a) {
                                        b.close(a)
                                    }
                                }, {
                                    classes: "btn-default",
                                    text: "Cancel",
                                    click: function(a) {
                                        b.dismiss(a)
                                    }
                                }]
                            }
                        }, "modal-danger"), b.result.then(function(b) {
                            a.apply(b, d)
                        })
                    }
            }
        }
    }
}]), angular.module("votingApp").directive("mongooseError", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(a, b, c, d) {
            b.on("keydown", function() {
                return d.$setValidity("mongoose", !0)
            })
        }
    }
}), angular.module("votingApp").controller("NavbarCtrl", ["$scope", "$location", "Auth", function(a, b, c) {
    a.menu = [{
        title: "Home",
        link: "/"
    }], a.isCollapsed = !0, a.isLoggedIn = c.isLoggedIn, a.isAdmin = c.isAdmin, a.getCurrentUser = c.getCurrentUser, a.logout = function() {
        c.logout(), b.path("/login")
    }, a.isActive = function(a) {
        return a === b.path()
    }
}]), angular.module("votingApp").run(["$templateCache", function(a) {
    a.put("app/main/main.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><header id=banner class=hero-unit><div class=container><div ng-hide=isLoggedIn()><h1>VotePlex</h1><p class=lead>Create custom polls with live results.</p><a href=/signup><button class="btn btn-lg btn-success main-signup">Sign Up</button></a></div><div ng-show=isLoggedIn()><h1>Dashboard</h1><p class=lead>What would you like to do today?</p><button class="btn btn-lg btn-success" ng-click=loadNewPoll()>New Poll</button> <button class="btn btn-lg btn-primary" ng-click=loadAllPolls()>My Polls</button></div></div></header><div class=container><div class=row><div ng-hide=isLoggedIn() class="col-lg-12 home"><div class=col-lg-4><i class="fa fa-bolt"></i><h2>Live Results</h2><p>Live graphs show your poll results immediately in an easy to understand format. One graph will not provide the whole picture, that\'s why we provide multiple graph types to better describe your results.</p></div><div class=col-lg-4><i class="fa fa-globe"></i><h2>Works Everywhere</h2><p>Traditional desktop computers now represent only 30% of Internet traffic. Your poll must work on the tablets, smart phones, netbooks and notebooks that your visitors are using. Our responsive designs do just that.</p></div><div class=col-lg-4><i class="fa fa-facebook"></i><h2>Social Integration</h2><p>Free integrated facebook or traditional comments allow your poll voters to provide immediate feedback and discuss results. Social share buttons encourage your poll voters to help spread the word.</p></div></div><div ng-show=isLoggedIn()><div ng-include=&quot;components/newpoll/newpoll.html&quot; class=col-lg-12></div><div ng-show="page===\'newPollPosted\'"><div class=col-lg-4></div><div class="col-lg-4 poll-posted"><h2>Congratulations!</h2><p class=lead>Your poll has been posted to <a ng-click="loadPoll(userName, pollName.name)" href={{url}}>{{url}}</a></p></div><div class=col-lg-4></div></div><div ng-include="\'components/vote/vote.html\'"></div></div><div ng-include="\'components/results/results.html\'"></div><div ng-include="\'components/allpolls/allpolls.html\'"></div></div></div><footer ng-hide=isLoggedIn() class=footer><div class=container><p>FreeCodeCamp Basejump | <a href=https://twitter.com/umgauper>@umgauper</a></p></div></footer>'), a.put("components/allpolls/allpolls.html", '<div ng-show="page===\'allPolls\'"><div class=col-lg-4></div><div class="col-lg-4 allpolls"><ul class=list-group><li class=list-group-item id="{{poll.poll_name.split(\' \')[0]}}" ng-repeat="poll in polls" ng-click="loadPoll(poll.user_name, poll.poll_name, \'results\')">{{poll.poll_name}} <button class=btn ng-click="deletePoll(poll.poll_name); $event.stopPropagation()">Delete</button></li></ul></div><div class=col-lg-4></div></div>'), a.put("components/newpoll/newpoll.html", '<div ng-show="page===\'newPoll\'"><div class=col-lg-4></div><div class="col-lg-4 new-poll"><h2>New Poll</h2><form name=newpoll ng-submit=addPoll() novalidate><div class=form-group><label for=name>Name your poll.</label><input id=name ng-model=pollName.name name=poll placeholder="What is your favorite brand?" class=form-control required></div><div class=form-group><label>Options</label><input ng-repeat="n in placeholders track by $index" ng-model=pollOptions[$index] placeholder={{placeholders[$index]}} class=form-control required></div><div class=form-buttons width=350px><button type=button ng-click=addOption() class="btn btn-default">More Options</button> <button type=submit class="btn btn-success" ng-disabled=newpoll.$invalid>Submit</button></div></form></div><div class=col-lg-4></div></div>'), a.put("components/results/results.html", '<div class=results><div class=col-lg-2></div><div class="col-lg-8 graph"><h1>{{pollName}}</h1><canvas id=bar class="chart chart-bar col-lg-offset-2" data=data labels=labels></canvas></div><div class=col-lg-2></div></div>'), a.put("components/vote/vote.html", '<div ng-show="page===\'vote\'" class=vote><div class=col-lg-4><h1>{{pollName}}?</h1><p class=lead>by {{pollCreator}}</p></div><div class=col-lg-4><form ng-submit=addVote()><ul class=list-group><li class=list-group-item ng-repeat="option in pollOptions track by $index"><input type=radio name=option value="{{$index}}"> {{option}}</li></ul><br><button class="btn btn-lg btn-success vote" type=submit>Vote!</button></form></div><div class=col-lg-4><p id=comments>Sorry, no comments yet.</p></div></div>')
}]), angular.module("votingApp").run(["$templateCache", function(a) {
    a.put("app/account/login/login.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><header id=banner class=hero-unit><div class=container><h1>VotePlex</h1><p class=lead>Create custom polls with live results.</p></div></header><div class=container><div class="row login"><div class=col-sm-12></div><div class=col-sm-12><form name=form ng-submit=login(form) novalidate class=form><div class=form-group><label>Email</label><input name=email ng-model=user.email class="form-control"></div><div class=form-group><label>Password</label><input type=password name=password ng-model=user.password class="form-control"></div><div class="form-group has-error"><p ng-show="form.email.$error.required &amp;&amp; form.password.$error.required &amp;&amp; submitted" class=help-block>Please enter your email and password.</p><p class=help-block>{{ errors.other }}</p></div><div id=login><button type=submit class="btn btn-success">Login</button></div><div id=twitter><a href="" ng-click="loginOauth(\'twitter\')" class="btn btn-twitter"><i class="fa fa-twitter">Connect with Twitter</i></a></div></form></div></div></div>'), a.put("app/account/settings/settings.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form name=form ng-submit=changePassword(form) novalidate class=form><div class=form-group><label>Current Password</label><input type=password name=password ng-model=user.oldPassword mongoose-error="" class="form-control"><p ng-show=form.password.$error.mongoose class=help-block>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword ng-model=user.newPassword ng-minlength=3 required class="form-control"><p ng-show="(form.newPassword.$error.minlength || form.newPassword.$error.required) &amp;&amp; (form.newPassword.$dirty || submitted)" class=help-block>Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button type=submit class="btn btn-lg btn-primary">Save changes</button></form></div></div></div>'), a.put("app/account/signup/signup.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><header id=banner class=hero-unit><div class=container><h1>VotePlex</h1><p class=lead>Create custom polls with live results.</p></div></header><div class=container><div class="row signup"><div class=col-sm-12></div><div class=col-sm-12><form name=form ng-submit=register(form) novalidate class=form><div ng-class="{ &quot;has-success&quot;: form.name.$valid &amp;&amp; submitted,        &quot;has-error&quot;: form.name.$invalid &amp;&amp; submitted }" class=form-group><label>Name</label><input name=name ng-model=user.name required class="form-control"><p ng-show="form.name.$error.required &amp;&amp; submitted" class=help-block>A name is required</p></div><div ng-class="{ &quot;has-success&quot;: form.email.$valid &amp;&amp; submitted,        &quot;has-error&quot;: form.email.$invalid &amp;&amp; submitted }" class=form-group><label>Email</label><input type=email name=email ng-model=user.email required mongoose-error="" class="form-control"><p ng-show="form.email.$error.email &amp;&amp; submitted" class=help-block>Doesn\'t look like a valid email.</p><p ng-show="form.email.$error.required &amp;&amp; submitted" class=help-block>What\'s your email address?</p><p ng-show=form.email.$error.mongoose class=help-block>{{ errors.email }}</p></div><div ng-class="{ &quot;has-success&quot;: form.password.$valid &amp;&amp; submitted,        &quot;has-error&quot;: form.password.$invalid &amp;&amp; submitted }" class=form-group><label>Password</label><input type=password name=password ng-model=user.password ng-minlength=3 required mongoose-error="" class="form-control"><p ng-show="(form.password.$error.minlength || form.password.$error.required) &amp;&amp; submitted" class=help-block>Password must be at least 3 characters.</p><p ng-show=form.password.$error.mongoose class=help-block>{{ errors.password }}</p></div><div id=signup><button type=submit class="btn btn-success">Sign up</button></div><div id=twitter><a href="" ng-click="loginOauth(\'twitter\')" class="btn btn-twitter"><i class="fa fa-twitter">Connect with Twitter</i></a></div></form></div></div></div>'), a.put("app/admin/admin.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><div class=container><p>The delete user and user index api routes are restricted to users with the \'admin\' role.</p><ul class=list-group><li ng-repeat="user in users" class=list-group-item><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span><a ng-click=delete(user) class=trash><span class="glyphicon glyphicon-trash pull-right"></span></a></li></ul></div>'), a.put("components/modal/modal.html", '<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat="button in modal.buttons" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>'), a.put("components/navbar/navbar.html", '<div ng-controller=NavbarCtrl class="navbar navbar-default navbar-static-top"><div class=container><div class=navbar-header><button type=button ng-click="isCollapsed = !isCollapsed" class=navbar-toggle><span class=sr-only>Toggle navigation</span><span class=icon-bar></span><span class=icon-bar></span><span class=icon-bar></span></button><a href="/" class=navbar-brand>VotePlex</a></div><div id=navbar-main collapse=isCollapsed class="navbar-collapse collapse"><ul class="nav navbar-nav"><li ng-repeat="item in menu" ng-class="{active: isActive(item.link)}"><a ng-href={{item.link}}>{{item.title}}</a></li><li ng-show=isAdmin() ng-class="{active: isActive(&quot;/admin&quot;)}"><a href=/admin>Admin</a></li></ul><ul class="nav navbar-nav navbar-right"><li ng-hide=isLoggedIn() ng-class="{active: isActive(&quot;/signup&quot;)}"><a href=/signup>Sign up</a></li><li ng-hide=isLoggedIn() ng-class="{active: isActive(&quot;/login&quot;)}"><a href=/login>Login</a></li><li ng-show=isLoggedIn()><p class=navbar-text>Hello {{ getCurrentUser().name }}</p></li><li ng-show=isLoggedIn() ng-class="{active: isActive(&quot;/settings&quot;)}"><a href=/settings><span class="glyphicon glyphicon-cog"></span></a></li><li ng-show=isLoggedIn() ng-class="{active: isActive(&quot;/logout&quot;)}"><a href="" ng-click=logout()>Logout</a></li></ul></div></div></div>')
}]);
