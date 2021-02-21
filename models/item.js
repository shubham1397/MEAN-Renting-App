const mongoose = require("mongoose");

const Item = mongoose.model("Item", {
  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },

  itemDate: {
    type: String,
    required: true,
  },
  rent: {
    type: String,
    required: true,
  },
  cost: {
    type: String,
    required: true,
  },
  mdate: {
    type: String,
    required: true,
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isFree: {
    type: Boolean,
    required: true,
  },
});

module.exports = Item;
