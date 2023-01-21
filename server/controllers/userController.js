const mysql = require("mysql");
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
//const session = require('express-session');

//Connection pool is a cache of database connections maintains so the connection can be reused when future requests to the database are required
const pool = mysql.createPool({
    connectionLimit : 100,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USER,
    password        : process.env.DB_PASS,
    database        : process.env.DB_NAME
});

//const { isAuthenticated } = require("../routes/middlewares/isAuthenticated");
// exports.login = (req, res, next) => {
//     passport.authenticate('local', (err, user, info) => {
//         if (err) {
//             return next(err);
//         }
//         if (!user) {
//             return res.status(400).json({ message: info.message });
//         }
//         req.logIn(user, (err) => {
//             if (err) {
//                 return next(err);
//             }
//             return res.json({ message: 'Successfully logged in.' });
//         });
//     })(req, res, next);
// };

exports.login = (req, res, next) => {
    // Verify user's credentials
    // ...

    // If credentials are valid, generate a JWT
    const payload = { 
        userId: user.id, 
        username: user.username 
    };
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '2h' };
    const token = jwt.sign(payload, secret, options);

    // Send JWT as a response
    return res.json({ message: 'Successfully logged in.', token });
};


// logout function

exports.logout = (req, res) => {
    req.logout();
    res.json({ message: 'Successfully logged out.' });
};


// Get the landing page
exports.getLandingPage = (req, res) => {
    res.render('register');
}

// view workout
exports.view = (req, res) => {
    // Connect to mysql database
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log("Connected as ID" + connection.threadId);

        // workout the connection
        connection.query('SELECT * FROM workouts WHERE status = "active"', (err, rows) => {
            // When done with the connection, release it
            if (!err) {
                res.render('home', { rows });
            } else {
                console.log(err);
            }
            console.log('The data from workouts table: \n', rows);
        });
    });
};

// Find a workout by search 
exports.find = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log("Connected as ID" + connection.threadId);

        let searchTerm = req.body.search;
        // workout the connection
    
        // User the connection
        connection.query('SELECT * FROM workouts WHERE exercise_name LIKE ? OR sets LIKE ?', ['%' + searchTerm + '%',  '%' + searchTerm + '%'], (err, rows) => {
            // When done with the connection, release it
            if (!err) {
                res.render('home', { rows });
            } else {
                console.log(err);
            }
            console.log('The data from workouts table: \n', rows);
        });
    
      });
}

// Render form
exports.form = (req, res) => {
    res.render('add-exercise');
}

// Add a new workout
exports.create = (req, res) => {
    const { exercise_name, sets, reps } = req.body;
    let searchTerm = req.body.search;

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected
        console.log("Connected as ID" + connection.threadId);

        let searchTerm = req.body.search;
        // Workout the connection
    
        // Workout the connection
        connection.query('INSERT INTO workouts SET exercise_name = ?, sets = ?, reps = ?', [exercise_name, sets, reps],(err, rows) => {
            // When done with the connection, release it
            if (!err) {
                res.render('add-exercise', {alert: 'Exercise logged successfully' });
            } else {
                console.log(err);
            }
            console.log('The data from workouts table: \n', rows);
        });
    
      });
}

// Edit a workout
exports.edit = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log("Connected as ID" + connection.threadId);

    // Workout the connection
    connection.query('SELECT * FROM workouts WHERE id = ?', [req.params.id], (err, rows) => {
        // When done with the connection, release it
        if (!err) {
            res.render('edit-exercise', { rows });
        } else {
            console.log(err);
        }
        console.log('The data from workouts table: \n', rows);
    });
  });
}


// Update a workout
exports.update = (req, res) => {
    const { exercise_name, sets, reps } = req.body;
    pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
      console.log("Connected as ID" + connection.threadId);
  
      // Workout the connection
      connection.query('UPDATE workouts SET exercise_name = ?, sets = ?, reps = ? WHERE id = ?', [exercise_name, sets, reps, req.params.id], (err, rows) => {
          // When done with the connection, release it
          if (!err) {
              res.render('edit-user');
          } else {
              console.log(err);
          }
          console.log('The data from workouts table: \n', rows);
      });
    });
}

// Get recipe page
exports.getRecipeList = (req, res) => {
    res.render('articles');
}

// Get about page
exports.getAbout = (req, res) => {
    res.render('about');
    console.log('Hi there Recipe');
}

// Get bmi page
exports.getBmi = (req, res) => {
    res.render('bmi');
}

// Get register
exports.getRegisterForm = (req, res) => {
    res.render('register');
}

// Get login
exports.getLoginForm = (req, res) => {
    res.render('login');
}

// Post form register
exports.postRegisterForm = (req, res) => {
    const { username, email } = req.body;
    if(!username || !email || !req.body.password){
        return res.render('register', { message: 'Please fill in all the required fields to register.' });
    }
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username],
            (err, results) => {
                if (err) {
                    return res.render('register', { message: 'An error occurred while trying to register. Please try again.' });
                }
                if (results.length > 0) {
                    return res.render('register', { message: 'This email or username is already registered. Please try again.' });
                }
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.send(err);
                    }
                    connection.query(
                        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                        [username, email, hash],
                        (err, results) => {
                            connection.release();
                            if (err) {
                                return res.render('register', { message: 'An error occurred while trying to register. Please try again.' });
                            }
                            req.session.user = { id: results.insertId, username, email };
                            res.redirect('/home');
                        });
                });
            }
        );
    });
};


exports.postLoginForm = (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.render('login', { message: 'Please fill in all the required fields to login.' });
    }
    pool.getConnection((err, connection) => {
        if (err) {
            return res.send(err);
        }
        connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            (err, results) => {
                connection.release();
                if (err) {
                    return res.render('login', { message: 'An error occurred while trying to login. Please try again.' });
                }
                if (results.length === 0) {
                    return res.render('login', { message: 'Invalid email or password. Please try again.' });
                }
                const hashedPassword = results[0].password;
                bcrypt.compare(password, hashedPassword, (err, match) => {
                    if (err) {
                        return res.render('login', { message: 'An error occurred while trying to login. Please try again.' });
                    }
                    if (!match) {
                        return res.render('login', { message: 'Invalid email or password. Please try again.' });
                    }
                    req.session.user = { id: results[0].id, username: results[0].username, email: results[0].email };
                    res.redirect('/home');
                });
            }
        );
    });
};



  // Welcome page
  exports.getWelcomePage = (req, res) => {
    res.render('welcome');
};

exports.getProfile = (req, res) => {
    if(req.session.user) {
        const { username, email } = req.session.user;
        res.render('profile', {username, email, welcomeMessage: 'Welcome to your profile page'});
    } else {
      //  res.redirect('/');
    }
};


// Get profile page
exports.getProfilePage = (req, res) => {
    res.render('profile');
};
