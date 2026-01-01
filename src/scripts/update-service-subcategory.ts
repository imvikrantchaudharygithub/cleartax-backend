/**
 * Script to Update Service Subcategory
 * 
 * This script updates a specific service (or all services) to link them to their correct subcategory.
 * 
 * Usage:
 *   npx ts-node src/scripts/update-service-subcategory.ts <service-slug> <subcategory-slug>
 *   OR
 *   npx ts-node src/scripts/update-service-subcategory.ts --all
 * 
 * Examples:
 *   npx ts-node src/scripts/update-service-subcategory.ts financial-disclosures-notes-preparation financial-due-diligence
 *   npx ts-node src/scripts/update-service-subcategory.ts --all
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Service } from '../models/Service.model';
import { ServiceCategory } from '../models/ServiceCategory.model';
import { connectDatabase, disconnectDatabase } from '../config/database';

dotenv.config();

const connectDB = async () => {
  try {
    // Use the same connection logic as the main app
    await connectDatabase();
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

interface ServiceUpdate {
  service: any;
  subcategory: any;
  updateType: 'category' | 'subcategory' | 'both';
}

const updateServiceSubcategory = async (serviceSlug: string, subcategorySlug: string) => {
  try {
    await connectDB();
    
    console.log(`\n🔍 Finding service: ${serviceSlug}`);
    console.log(`🔍 Finding subcategory: ${subcategorySlug}\n`);
    
    // Find the service
    const service = await Service.findOne({ slug: serviceSlug }).lean();
    if (!service) {
      console.error(`❌ Service not found: ${serviceSlug}`);
      await disconnectDatabase();
      process.exit(1);
    }
    
    console.log(`✅ Found service: ${service.title}`);
    console.log(`   Current category: ${service.category} (type: ${typeof service.category})`);
    console.log(`   Current subcategory: ${service.subcategory || 'none'}\n`);
    
    // Find the subcategory category
    const subcategory = await ServiceCategory.findOne({
      $or: [
        { slug: subcategorySlug.toLowerCase() },
        { id: subcategorySlug.toLowerCase() },
      ],
    }).lean();
    
    if (!subcategory) {
      console.error(`❌ Subcategory not found: ${subcategorySlug}`);
      await disconnectDatabase();
      process.exit(1);
    }
    
    console.log(`✅ Found subcategory: ${subcategory.title}`);
    console.log(`   Subcategory ID: ${subcategory._id}`);
    console.log(`   Category Type: ${subcategory.categoryType}\n`);
    
    // Determine what to update
    const updates: any = {};
    let updateType: 'category' | 'subcategory' | 'both' = 'subcategory';
    
    // If service has category as string (e.g., "ipo"), update it to point to subcategory
    if (typeof service.category === 'string' && !mongoose.Types.ObjectId.isValid(service.category)) {
      // Category is a string like "ipo" - update it to point to the subcategory category
      updates.category = subcategory._id;
      updates.categoryName = subcategory.title;
      updateType = 'both';
      console.log(`📝 Will update category field to point to subcategory category`);
    }
    
    // Always update subcategory field
    updates.subcategory = subcategory._id;
    updateType = updateType === 'both' ? 'both' : 'subcategory';
    console.log(`📝 Will update subcategory field to point to subcategory category\n`);
    
    // Apply the update
    const result = await Service.updateOne(
      { _id: service._id },
      { $set: updates }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully updated service: ${serviceSlug}`);
      console.log(`   Updated fields: ${updateType === 'both' ? 'category and subcategory' : 'subcategory'}\n`);
      
      // Verify the update
      const updatedService = await Service.findById(service._id).lean();
      console.log(`📋 Updated service details:`);
      console.log(`   Category: ${updatedService?.category} (type: ${typeof updatedService?.category})`);
      console.log(`   Subcategory: ${updatedService?.subcategory} (type: ${typeof updatedService?.subcategory})`);
      console.log(`   Category Name: ${updatedService?.categoryName || 'none'}\n`);
    } else {
      console.log(`⚠️  No changes made (service may already be up to date)`);
    }
    
    await disconnectDatabase();
    console.log('✅ Update completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

const updateAllServices = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 Finding all services with category as string (e.g., "ipo")...\n');
    
    // Find all services where category is a string (not ObjectId)
    const allServices = await Service.find({}).lean();
    
    const servicesWithStringCategory = allServices.filter((service: any) => {
      const category = service.category;
      return typeof category === 'string' && !mongoose.Types.ObjectId.isValid(category);
    });
    
    console.log(`Found ${servicesWithStringCategory.length} services with category as string\n`);
    
    if (servicesWithStringCategory.length === 0) {
      console.log('✅ No services need updating');
      await disconnectDatabase();
      process.exit(0);
    }
    
    // Group by categoryType
    const servicesByCategoryType: Record<string, any[]> = {};
    for (const service of servicesWithStringCategory) {
      const categoryType = String(service.category).toLowerCase();
      if (!servicesByCategoryType[categoryType]) {
        servicesByCategoryType[categoryType] = [];
      }
      servicesByCategoryType[categoryType].push(service);
    }
    
    console.log('Services grouped by categoryType:');
    Object.keys(servicesByCategoryType).forEach(type => {
      console.log(`  - ${type}: ${servicesByCategoryType[type].length} services`);
    });
    console.log('');
    
    // For each categoryType, find subcategories and try to match
    const updates: ServiceUpdate[] = [];
    
    for (const [categoryType, services] of Object.entries(servicesByCategoryType)) {
      console.log(`\n📋 Processing categoryType: ${categoryType}`);
      
      // Find all subcategory categories for this categoryType
      const subcategories = await ServiceCategory.find({
        categoryType: categoryType,
      }).lean();
      
      console.log(`  Found ${subcategories.length} subcategory categories`);
      
      // For each service, try to find the best matching subcategory
      for (const service of services) {
        let bestMatch: { subcategory: any; confidence: number } | null = null;
        
        for (const subcategory of subcategories) {
          const serviceSlug = service.slug?.toLowerCase() || '';
          const serviceTitle = service.title?.toLowerCase() || '';
          const subcategorySlug = subcategory.slug?.toLowerCase() || '';
          const subcategoryId = subcategory.id?.toLowerCase() || '';
          const subcategoryTitle = subcategory.title?.toLowerCase() || '';
          
          // Calculate confidence score
          let confidence = 0;
          
          // High confidence: Service slug contains subcategory slug/id
          if (serviceSlug.includes(subcategorySlug) || serviceSlug.includes(subcategoryId)) {
            confidence = 100;
          }
          // Medium confidence: Service title contains subcategory title
          else if (serviceTitle.includes(subcategoryTitle)) {
            confidence = 80;
          }
          // Lower confidence: Keyword matching
          else {
            const subcategoryKeywords = [
              ...subcategorySlug.split('-'),
              ...subcategoryId.split('-'),
              ...subcategoryTitle.split(' '),
            ].filter(k => k.length > 2);
            
            const matchingKeywords = subcategoryKeywords.filter(kw => 
              serviceSlug.includes(kw) || serviceTitle.includes(kw)
            );
            
            confidence = matchingKeywords.length * 20; // 20 points per keyword
          }
          
          if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
            bestMatch = { subcategory, confidence };
          }
        }
        
        if (bestMatch && bestMatch.confidence >= 40) {
          updates.push({
            service,
            subcategory: bestMatch.subcategory,
            updateType: 'both',
          });
          console.log(`  ✅ ${service.slug} -> ${bestMatch.subcategory.slug} (confidence: ${bestMatch.confidence}%)`);
        } else {
          console.log(`  ❌ ${service.slug} -> No match found (best: ${bestMatch?.confidence || 0}%)`);
        }
      }
    }
    
    console.log(`\n\n📊 Summary:`);
    console.log(`  Total services to update: ${servicesWithStringCategory.length}`);
    console.log(`  Matched services: ${updates.length}`);
    console.log(`  Unmatched services: ${servicesWithStringCategory.length - updates.length}`);
    
    if (updates.length === 0) {
      console.log('\n⚠️  No services matched. Please update manually.');
      await disconnectDatabase();
      process.exit(0);
    }
    
    // Ask for confirmation
    console.log(`\n⚠️  About to update ${updates.length} services.`);
    console.log('   Uncomment the code below to apply updates.\n');
    
    // Uncomment below to apply updates
    /*
    console.log('\n🔄 Applying updates...\n');
    
    let updated = 0;
    for (const update of updates) {
      const updateData: any = {
        subcategory: update.subcategory._id,
      };
      
      // If service has category as string, update it too
      if (typeof update.service.category === 'string' && !mongoose.Types.ObjectId.isValid(update.service.category)) {
        updateData.category = update.subcategory._id;
        updateData.categoryName = update.subcategory.title;
      }
      
      await Service.updateOne(
        { _id: update.service._id },
        { $set: updateData }
      );
      
      updated++;
      console.log(`  ✅ Updated: ${update.service.slug} -> ${update.subcategory.slug}`);
    }
    
    console.log(`\n✅ Updated ${updated} services\n`);
    */
    
    await disconnectDatabase();
    console.log('✅ Analysis completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  npx ts-node src/scripts/update-service-subcategory.ts <service-slug> <subcategory-slug>');
  console.log('  npx ts-node src/scripts/update-service-subcategory.ts --all');
  console.log('');
  console.log('Examples:');
  console.log('  npx ts-node src/scripts/update-service-subcategory.ts financial-disclosures-notes-preparation financial-due-diligence');
  console.log('  npx ts-node src/scripts/update-service-subcategory.ts --all');
  process.exit(1);
}

if (args[0] === '--all') {
  updateAllServices();
} else if (args.length === 2) {
  updateServiceSubcategory(args[0], args[1]);
} else {
  console.error('❌ Invalid arguments');
  console.log('Usage:');
  console.log('  npx ts-node src/scripts/update-service-subcategory.ts <service-slug> <subcategory-slug>');
  console.log('  npx ts-node src/scripts/update-service-subcategory.ts --all');
  process.exit(1);
}

