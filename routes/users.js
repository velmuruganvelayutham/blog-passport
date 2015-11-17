var express = require('express'); // call express
var mongoose = require('mongoose');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var util = require('util');
var GitHubStrategy = require('passport-github').Strategy;

var GITHUB_CLIENT_ID = "ee809a6c8460249d1f23"
var GITHUB_CLIENT_SECRET = "01ff71b613243de5efdfeec9cf8805c2e2aa0ce7";

var User = require('../model/user.js');
/*mongoose.connect('mongodb://localhost/learnyoumongo', function(err) {
    console.log('connected !' + err);
});*/

mongoose.connect('mongodb://admin:admin@ds053954.mongolab.com:53954/angular-blog', function(err) {
    console.log('connected !' + err);
});

mongoose.set('debug', true)
    // ROUTES FOR OUR API
    // =============================================================================
var router = express.Router(); // get an instance of the express Router

// logging middeware for all the routes
router.use(function(req, res, next) {
    console.log('something happening');
    next();
});
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({
        message: 'hooray! welcome to our api  by Vel/Mur!'
    });
});

router.route('/users').post(function(req, res) {
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;

    console.log('name is ' + user);
    user.save(function(err, user) {
        if (err)
            return handleError(res, err);
        res.json(user);

    });
}).get(function(reg, res) {
    User.find(function(err, users) {

        if (err)
            return handleError(res, err);
        if (!users)
            res.status(404).send("User Not Found !.");
        res.json(users);
    });
});

router.route('/users/:user_id')
    .get(function(req, res) {

        User.findById(req.params.user_id, function(err, user) {
            if (err)
                return handleError(res, err);
            if (!user)
                res.status(404).send("User Not Found !.");
            res.json(user);

        })
    }).put(function(req, res) {

        User.findById(req.params.user_id, function(err, user) {
            if (err)
                return handleError(res, err);
            if (!user)
                res.status(404).send("User Not Found !.");
            user.username = req.body.username;
            user.password = req.body.password;
            user.save(function(err, user) {
                if (err)
                    return handleError(res, err);
                res.json(user);
            });

        })

    }).delete(function(req, res) {
        console.log(req.params.user_id);
        User.remove(req.params.user_id, function(err, user) {
            if (err)
                res.status(404).send("User Not Found !.");
            res.json(user);
        })

    });

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
    if (req.session && req.session.user === "amy" && req.session.admin)
        return next();
    else
        return res.sendStatus(401);
};

function handleError(res, err) {
    return res.status(500).send(err);
}
var verify = function(username, password, done) {

    console.log(username + password);
    User.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {
                message: 'Incorrect username.'
            });
        }

        return done(null, user);
    });
}

// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/api/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function() {

            // To keep the example simple, the user's GitHub profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the GitHub account with a user record in your database,
            // and return that user instead.
            var user = new User();
            user.username = profile.username;
            user.password = profile.id;
            user.save(function(err, user) {
                if (err) {
                    done(err);
                }
                return done(null, user);
            });
            return done(null, user);
        });
    }
));

passport.use(new LocalStrategy(verify));
passport.serializeUser(function(user, done) {
    console.log('user is serialized !' + user);
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {

    User.findById(id, function(err, user) {
        console.log('user is deserialized !' + id);
        done(err, user);
    });
});


/* GET users listing. */
router.post('/login', passport.authenticate('local'), function(req, res, next) {

    if (req.user) {
        console.log(' already authenticated !');
        res.redirect('/');
    } else {
        console.log('authenticated now !');
        res.redirect('/');
    }

});

router.post('/signup', function(req, res) {

    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;

    console.log('User is ' + user);
    user.save(function(err, user) {
        if (err)
            return handleError(res, err);
        res.redirect('/');

    });

});


router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');

});

router.get('/me', function(req, res, next) {
    if (req.user) {
        res.json('true');
    } else {
        res.status(401).send('not authenticated!');
    }

});


// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
router.get('/auth/github',
    passport.authenticate('github'),
    function(req, res) {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
    });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.redirect('/');
    });


// more routes for our API will happen here
module.exports = router;
