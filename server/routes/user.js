const express = require('express');
const router = express.Router();
const pageController = require('../controllers/userController');

router.get('/', pageController.getLandingPage);
router.get('/home', pageController.view);
router.post('/', pageController.find);
router.get('/addexercise', pageController.form);
router.post ('/addexercise', pageController.create);
router.get('/editexercise/:id', pageController.edit);

router.get('/articles', pageController.getRecipeList)
router.get('/about', pageController.getAbout);
router.get('/bmi', pageController.getBmi);

// Register page
router.get('/register', pageController.getRegisterForm);
router.post('/register', pageController.postRegisterForm);

// Login page
router.get('/login', pageController.getLoginForm);
router.post('/login', pageController.postLoginForm);

// Welcome page
router.get('/login', pageController.getWelcomePage);

router.get('/profile', pageController.getProfilePage);

module.exports = router;

