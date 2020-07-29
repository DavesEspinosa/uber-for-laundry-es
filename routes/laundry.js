const express = require("express");

const User = require("../models/user");

//Se añade porque es el object id de user
const LaundryPickup = require('../models/laundry-pickup'); 

const { findByIdAndUpdate } = require("../models/user");

const laundryRouter = express.Router();

// MIDDLEWARE =>
laundryRouter.use((req, res, next) => {
  if (req.session.currentUser) {
    next();
    return;
  }
  res.redirect("/login");
});

/* laundryRouter.get("/dashboard", (req, res, next) => {
  res.render("laundry/dashboard");
}); */
laundryRouter.get('/dashboard', (req, res, next) => {
  let query;

  if (req.session.currentUser.isLaunderer) {
    query = { launderer: req.session.currentUser._id };
  } else {
    query = { user: req.session.currentUser._id };
  }

  LaundryPickup
    .find(query)
    .populate('user', 'name')
    .populate('launderer', 'name')
    .sort('pickupDate')
    .exec((err, pickupDocs) => {
      if (err) {
        next(err);
        return;
      }

      res.render('laundry/dashboard', {
        pickups: pickupDocs
      });
    });
});


laundryRouter.post("/launderers", (req, res, next) => {
  User.findByIdAndUpdate(
    req.session.currentUser._id,
    { $set: { fee: req.body.fee, isLaunderer: true } },
    { new: true }
  )
    .then((user) => {
      req.session.currentUser = user;
      res.redirect("/dashboard");
    })
    .catch((error) => {
      console.log(`Error updating user by ID: ${error.message}`);
      next(error);
    });
});
/* 
laundryRouter.post('/launderers', (req, res, next) => {
    const userId = req.session.currentUser._id;
    const laundererInfo = {
      fee: req.body.fee,
      isLaunderer: true
    };
  
    User.findByIdAndUpdate(userId, laundererInfo, { new: true }, (err, theUser) => {
      if (err) {
        next(err);
        return;
      }
  
      req.session.currentUser = theUser;
  
      res.redirect('/dashboard');
    });
  }); */

laundryRouter.get("/launderers", (req, res, next) => {
  User.find({ isLaunderer: true })
  .then((launderersList) => {
    res.render("laundry/launderers", { launderers: launderersList })
  .catch((error) => {
        next(error);
      });
  });
});
/*   laundryRouter.get('/launderers', (req, res, next) => {
    User.find({ isLaunderer: true }, (err, launderersList) => {
      if (err) {
        next(err);
        return;
      }
  
      res.render('laundry/launderers', {
        launderers: launderersList
      });
    });
  }); */

/*   laundryRouter.get('/launderers/:id', (req, res, next) =>
 {
  const laundererId = req.params.id;

  User.findById(laundererId, (err, theUser) => {
    if (err) {
      next(err);
      return;
    }

    res.render('laundry/launderer-profile', {
      theLaunderer: theUser
    });
  });
}); */

laundryRouter.get('/launderers/:id', (req, res, next) =>{
 const laundererId = req.params.id;

 User.findById(laundererId)
  .then((theUser) =>{
    res.render('laundry/launderer-profile', {
      theLaunderer: theUser
    })
    .catch((error) => {
      next(error);
    });
  })
});

laundryRouter.post('/laundry-pickups', (req, res, next) => {
  const pickupInfo = {
    pickupDate: req.body.pickupDate,
    launderer: req.body.laundererId,
    user: req.session.currentUser._id
  };

  const thePickup = new LaundryPickup(pickupInfo);

  thePickup.save((err) => {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/dashboard');
  });
});


module.exports = laundryRouter;
