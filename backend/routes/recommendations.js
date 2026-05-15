const express = require('express');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { skinProfile, hairProfile, quizMode } = req.body;
    console.log('Generating recommendations for:', { userId: user._id, quizMode, skinProfile, hairProfile });

    // Paywall check: 1 free use, then subscription required
    const hasActiveSubscription = user.subscription?.isActive && 
      (!user.subscription.endDate || new Date() <= new Date(user.subscription.endDate));
    
    if ((user.recommendationCount || 0) >= 1 && !hasActiveSubscription) {
      return res.status(403).json({ 
        message: 'SUBSCRIPTION_REQUIRED',
        detail: 'You have used your free recommendation. Please subscribe to continue.',
        recommendationCount: user.recommendationCount,
      });
    }
    
    // Update user profile based on quiz mode
    if (quizMode === 'hair' && hairProfile) {
      await User.findByIdAndUpdate(user._id, { hairProfile });
    } else if (skinProfile) {
      await User.findByIdAndUpdate(user._id, { skinProfile });
    }
    console.log('User profile updated');

    console.log('Using API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const productImages = {
      "Toleriane Hydrating Gentle Cleanser": "https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-loreal-master-catalog-LRP/default/dw7e58319e/products/Toleriane/3337875543169_Toleriane_Hydrating_Gentle_Cleanser_400ml_Front.jpg",
      "Toleriane Purifying Foaming Cleanser": "https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-loreal-master-catalog-us/default/dw78670409/products/LRP/3337875685894_toleriane_purifying_foaming_cleanser_400ml.jpg",
      "Azelaic Acid Suspension 10%": "https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master-catalog/default/dw6e5a0e5b/Images/Products/The-Ordinary/rdn-azelaic-acid-suspension-10-30ml.png",
      "Toleriane Double Repair Face Moisturizer": "https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-loreal-master-catalog-LRP/default/dw6b5a0e5b/products/Toleriane/3337875545842_Toleriane_Double_Repair_Face_Moisturizer_75ml_Front.jpg",
      "PM Facial Moisturizing Lotion": "https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/master/us/products/pm-facial-moisturizing-lotion/cerave_pm-facial-moisturizing-lotion_3oz_front-v2.jpg",
      "AM Facial Moisturizing Lotion": "https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/master/us/products/am-facial-moisturizing-lotion/cerave_am-facial-moisturizing-lotion_3oz_front-v2.jpg",
      "Anthelios Clear Skin Dry Touch Sunscreen SPF 60": "https://www.laroche-posay.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-loreal-master-catalog-us/default/dw06b2f7f9/products/LRP/3606000430488_anthelios_clear_skin_spf60.jpg",
      "Hyaluronic Acid 2% + B5": "https://theordinary.com/dw/image/v2/BFKJ_PRD/on/demandware.static/-/Sites-deciem-master-catalog/default/dw6b5a0e5b/Images/Products/The-Ordinary/rdn-hyaluronic-acid-2-b5-30ml.png",
      "CeraVe Hydrating Facial Cleanser": "https://www.cerave.com/-/media/project/loreal/brand-sites/cerave/master/us/products/hydrating-facial-cleanser/700x700/cerave_hydrating_facial_cleanser_12oz_front-v2.jpg"
    };

    let prompt;

    if (quizMode === 'hair' && hairProfile) {
      // Hair care prompt
      prompt = `
        As a professional trichologist and hair care expert, provide a personalized hair care recommendation based on the following profile:
        Hair Type: ${hairProfile.hairType}
        Hair Concerns: ${hairProfile.hairConcerns.join(', ')}
        Scalp Condition: ${hairProfile.scalpCondition}
        Routine Preference: ${hairProfile.hairRoutinePreference}

        You MUST return your response in strictly valid JSON format.
        For the "imageUrl", try to provide a direct URL to a high-quality product image if you are certain of it.
        If you are unsure, use this high-quality placeholder: https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400

        The JSON should have the following structure:
        {
          "analysis": "A brief analysis of their hair and scalp needs.",
          "products": [
            {
              "name": "Product Name",
              "brand": "Brand Name",
              "reason": "Why it is recommended.",
              "link": "https://www.google.com/search?q=Product+Name+Brand",
              "imageUrl": "Image URL"
            }
          ],
          "routine": {
            "washDay": ["Step 1", "Step 2"],
            "maintenance": ["Step 1", "Step 2"]
          },
          "tips": ["Tip 1", "Tip 2"]
        }
      `;
    } else {
      // Skin care prompt (original)
      prompt = `
        As a professional dermatologist, provide a personalized skincare recommendation based on the following profile:
        Skin Type: ${skinProfile.skinType}
        Concerns: ${skinProfile.concerns.join(', ')}
        Sensitivity: ${skinProfile.sensitivity}
        Routine Preference: ${skinProfile.routinePreference}

        You MUST return your response in strictly valid JSON format.
        For the "imageUrl", try to provide a direct URL to a high-quality product image if you are certain of it (especially for brands like The Ordinary, La Roche-Posay, CeraVe). 
        If you are unsure, use this high-quality placeholder: https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400

        The JSON should have the following structure:
        {
          "analysis": "A brief analysis of their skin needs.",
          "products": [
            {
              "name": "Product Name",
              "brand": "Brand Name",
              "reason": "Why it is recommended.",
              "link": "https://www.google.com/search?q=Product+Name+Brand",
              "imageUrl": "Image URL" 
            }
          ],
          "routine": {
            "morning": ["Step 1", "Step 2"],
            "evening": ["Step 1", "Step 2"]
          },
          "tips": ["Tip 1", "Tip 2"]
        }
      `;
    }

    console.log('Calling Gemini API...');
    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (err) {
        if (err.status === 503 && retries > 1) {
          console.log('Gemini API 503 error, retrying...');
          retries--;
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw err;
        }
      }
    }
    
    const response = await result.response;
    const text = response.text().trim();
    console.log('Gemini API response received');
    
    // Robust JSON extraction
    let adviceJson;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        adviceJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      throw new Error('Invalid AI response format');
    }
    
    // After parsing — map known product images (for skin care):
    if (quizMode !== 'hair' && adviceJson.products && Array.isArray(adviceJson.products)) {
      adviceJson.products = adviceJson.products.map(p => {
        if (productImages[p.name]) {
          p.imageUrl = productImages[p.name];
        }
        return p;
      });
    }

    // Increment recommendation count
    await User.findByIdAndUpdate(user._id, { $inc: { recommendationCount: 1 } });
    console.log('Recommendation count incremented');

    res.json({ advice: adviceJson });
  } catch (error) {
    console.error('Error in /generate:', error);
    res.status(500).json({ 
      message: 'Error generating recommendations', 
      error: error.message,
      details: error.status === 503 ? 'AI Service is currently overloaded. Please try again in a few seconds.' : 'Unexpected error.'
    });
  }
});

module.exports = router;
