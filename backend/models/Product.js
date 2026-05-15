const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: String, // e.g., Cleanser, Moisturizer, Serum
  skinTypes: [String], // ['Dry', 'Oily', 'Combination', 'Sensitive']
  concerns: [String], // ['Acne', 'Aging', 'Dryness']
  ingredients: [String],
  imageUrl: String,
  price: Number,
  description: String,
});

module.exports = mongoose.model('Product', productSchema);
