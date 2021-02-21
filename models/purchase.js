const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;


var Purchase = mongoose.model('Purchase', new mongoose.Schema({
    itemId:[{type:ObjectId,ref:"items"}],
    userId:[{type:ObjectId,ref:"profiles"}]
},{timestamps:true}));


module.exports = Purchase;
