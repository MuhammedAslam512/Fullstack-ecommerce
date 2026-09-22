// DATABASE QUERY PERFORMANCE MEASUREMENT SCRIPT

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('../models/Product');

const analyzeQueryPerformance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for Performance Analysis\n');

    console.log('🔍 Analyzing Query: Product.find({ price: { $gte: 500 } }).sort({ price: -1 })...');

    // Mongoose .explain('executionStats') returns database execution details
    const explanation = await Product.find({ price: { $gte: 500 } })
      .sort({ price: -1 })
      .explain('executionStats');

    const stats = explanation.executionStats;

    console.log('\n📊 PERFORMANCE RESULTS:');
    console.log('───────────────────────────────────────');
    console.log(`⏱️ Execution Time:      ${stats.executionTimeMillis} ms`);
    console.log(`📄 Documents Examined:  ${stats.totalDocsExamined}`);
    console.log(`🎯 Documents Returned:  ${stats.nReturned}`);
    console.log(`🔎 Winning Stage:       ${explanation.queryPlanner.winningPlan.stage}`);
    console.log('───────────────────────────────────────');

    if (explanation.queryPlanner.winningPlan.stage.includes('IXSCAN')) {
      console.log('⚡ SUCCESS: Query used an INDEX SCAN (IXSCAN)! Ultra fast!');
    } else {
      console.log('⚠️ WARNING: Query used a FULL COLLECTION SCAN (COLLSCAN)! Consider adding an index.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error analyzing performance:', err.message);
  }
};

analyzeQueryPerformance();