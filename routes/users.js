var express = require('express'); // call express
var mongoose = require('mongoose');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var User = require('../model/user.js');
mongoose.connect('mongodb://localhost/learnyoumongo', function(err) {
    console.log('connected !' + err);
});

/*mongoose.connect('mongodb://admin:admin@ds053954.mongolab.com:53954/angular-blog', function(err) {
    console.log('connected !' + err);
});*/
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

passport.use(new LocalStrategy(verify));
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
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


// more routes for our API will happen here
module.exports = router;
