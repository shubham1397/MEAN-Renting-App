const express = require("express");
const Item = require("../models/item");
const Purchase = require("../models/purchase");
const router = new express.Router();
const multer = require("multer");
const checkAuth = require("../middlewares/check-auth");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];

    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const item = new Item({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
      itemDate: req.body.itemDate,
      rent: req.body.rent,
      cost: req.body.cost,
      mdate: req.body.mdate,
      isFree: req.body.isFree,
    });
    item
      .save()
      .then((item) => {
        if (item) {
          res.status(201).json({
            status: true,
            message: "item added successfully",
            item: {
              ...item,
              id: item._id,
            },
          });
        } else {
          res.status(500).json({ status: false, message: "Error Adding item" });
        }
      })
      .catch((e) => {});
  }
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res, next) => {
    let itemData = await Item.findOne({ _id: req.params.id });
    let purchaseData = await Purchase.findOne({ itemId: req.params.id });

    if (purchaseData && itemData.isFree) {
      res.status(200).json({
        status: false,
        message:
          "Item is free, and already taken out by someone for rent, Item cannot be edited",
      });
    } else {
      let imagePath = req.body.imagePath;
      if (req.file) {
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename;
      }

      const item = new Item({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId,
        cost: req.body.cost,
        rent: req.body.rent,
        mdate: req.body.mdate,
        isFree: req.body.isFree,
      });
      Item.updateOne(
        { _id: req.params.id, creator: req.userData.userId },
        item
      ).then((result) => {
        if (result) {
          res.status(200).json({ status: true, message: "Update successful!" });
        } else {
          res
            .status(500)
            .json({ status: false, message: "Error Upating item" });
        }
      });
    }
  }
);

router.get("/mypost", checkAuth, (req, res, next) => {
  Item.find({ creator: req.userData.userId })
    .then((item) => {
      if (item) {
        res.status(200).json({
          status: true,
          message: "items fetched successfully!",
          posts: item,
        });
      } else {
        res.status(404).json({ status: false, message: "item not found!" });
      }
    })
    .catch((e) => {});
});

router.get("", (req, res, next) => {
  Item.find().then((documents) => {
    if (documents) {
      res.status(200).json({
        status: true,
        message: "item fetched successfully!",
        posts: documents,
      });
    } else {
      res.status(404).json({ status: false, message: "item not found!" });
    }
  });
});

router.get("/:id", (req, res, next) => {
  Item.findById(req.params.id).then((item) => {
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ status: false, message: "item not found!" });
    }
  });
});

router.delete("/:id", checkAuth, async (req, res, next) => {
  let itemData = await Item.findOne({ _id: req.params.id });
  let purchaseData = await Purchase.findOne({ itemId: req.params.id });

  console.log("itemData", itemData);
  console.log("purchaseData", purchaseData);

  if (purchaseData && itemData.isFree) {
    res.status(200).json({
      status: false,
      message:
        "Item is free, and already taken out by someone for rent, cannot be deleted",
    });
  } else {
    Item.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(
      (result) => {
        if (result.n > 0) {
          res
            .status(200)
            .json({ status: true, message: "Deletion successful!" });
        } else {
          return res
            .status(401)
            .json({ status: false, message: "Not authorized!!" });
        }
      }
    );
  }
});

router.post("/buyItem", checkAuth, async (req, res, next) => {
  const data = new Purchase({
    itemId: req.body.itemId,
    userId: req.body.userId,
  });
  try {
    let saveData = await data.save();
    if (saveData) {
      res.status(201).json({
        status: true,
        message: "item purchased successfully",
      });
    } else {
      res.status(500).json({ status: false, message: "Error purchasing item" });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
