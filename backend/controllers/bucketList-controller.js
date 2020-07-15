const mongoose = require('mongoose');

const Place = require('../models/place');
const User = require('../models/user');
const HttpError = require('../models/http-error');

const getBucketList = async (req, res, next) => {
    const userId = req.params.uid;
    let userBucketList;
    try {
        userBucketList = await User.findById(userId).populate('bucketList.id');
        res.json({
            BucketList: userBucketList.bucketList.toObject({
                getters: true,
            }),
            name: userBucketList.name,
        });
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a bucket list place.',
            500
        );
        return next(error);
    }
};

const createBucketList = async (req, res, next) => {
    const placeId = req.params.pid;
    let bucketListPlace;
    try {
        bucketListPlace = await Place.findById(placeId).populate('creator');
        if (!bucketListPlace) {
            const error = new HttpError(
                'Could not find a place for the provided place id.',
                404
            );
            return next(error);
        }
    } catch (err) {
        const error = new HttpError(
            'Could not find a place for the provided id.',
            500
        );
        return next(error);
    }
    const userId = req.userData.userId;
    let currentUser;

    try {
        currentUser = await User.findById(userId);
    } catch (err) {
        const error = new HttpError(
            'Could not find a user for the provided id.',
            500
        );
        return next(error);
    }

    const createdBucketList = {
        id: bucketListPlace.id,
        createdBy: bucketListPlace.creator.name,
        isVisited: false,
    };
    const notUniqueArr = currentUser.bucketList.filter((item) => {
        return item.id === bucketListPlace.id;
    });

    const checkUnique = () => {
        if (notUniqueArr.length > 0) {
            return false;
        } else {
            return true;
        }
    };
    const isUnique = checkUnique();

    if (!isUnique) {
        const error = new HttpError('Place already exists.', 403);
        return next(error);
    }

    if (bucketListPlace.creator !== req.userData.userId && isUnique) {
        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            currentUser.bucketList.push(createdBucketList);

            await currentUser.save({ session: sess });

            await sess.commitTransaction();
        } catch (err) {
            const error = new HttpError(
                'Adding place failed, please try again.',
                500
            );
            return next(error);
        }
    } else {
        const error = new Error(
            'You are not allowed to add  your own places to your bucket list',
            403
        );
        return next(error);
    }

    res.json({
        addedPlace: bucketListPlace,
    });
};

const visitedPlace = async (req, res, next) => {
    const userId = req.userData.userId;
    const placeId = req.params.pid;

    let currentUser;
    try {
        currentUser = await User.findById(userId);
        const currentBucketList = currentUser.bucketList;
        const currentItemBucketList = currentBucketList.find(
            (item) => item.id === placeId
        );
        currentItemBucketList.isVisited = !currentItemBucketList.isVisited;
        await currentUser.save();
    } catch (err) {
        return next(err);
    }
    res.send({ message: 'Place visited' });
};

const deleteBucketList = async (req, res, next) => {
    const placeId = req.params.pid;
    const userId = req.userData.userId;
    let currentUser;
    if (req.userData.userId === userId) {
        try {
            currentUser = await User.findById(userId);
            await currentUser.bucketList.pull({ id: placeId });
            await currentUser.save();
        } catch (err) {
            const error = new HttpError(`${error}`, 500);
            return next(error);
        }
        res.status(200).json({ message: 'place deleted from the bucket list' });
    } else {
        const error = new HttpError(
            'You are not allowed to delete this place',
            403
        );
        return next(error);
    }
};

exports.getBucketList = getBucketList;
exports.createBucketList = createBucketList;
exports.visitedPlace = visitedPlace;
exports.deleteBucketList = deleteBucketList;