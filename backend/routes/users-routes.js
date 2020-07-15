const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const bucketlistControllers = require('../controllers/bucketList-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);
router.get('/bucketlist/:uid', bucketlistControllers.getBucketList);
router.patch('/bucketlist/:pid', bucketlistControllers.createBucketList);
router.put('/bucketlist/:pid', bucketlistControllers.visitedPlace);
router.delete('/bucketlist/:pid', bucketlistControllers.deleteBucketList);

module.exports = router;
