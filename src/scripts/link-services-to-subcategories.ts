/**
 * Migration Script: Link Services to Subcategories
 * 
 * This script helps link services that have category: "ipo" (string) to their correct subcategory categories.
 * 
 * Usage:
 *   npx ts-node src/scripts/link-services-to-subcategories.ts
 * 
 * The script will:
 * 1. Find all services with category as a string (e.g., "ipo")
 * 2. Find all subcategory categories for that categoryType
 * 3. Attempt to match services to subcategories based on slug/title keywords
 * 4. Update services to have category pointing to the subcategory category's ObjectId
 * 
 * IMPORTANT: Review the matches before applying updates. Some services may need manual assignment.
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

interface ServiceMatch {
  service: any;
  subcategory: any;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

const extractKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .split(/[-_\s]+/)
    .filter(k => k.length > 2)
    .filter(k => !['and', 'the', 'for', 'with', 'from'].includes(k));
};

const matchServiceToSubcategory = (service: any, subcategory: any): { matches: boolean; confidence: 'high' | 'medium' | 'low'; reason: string } => {
  const serviceSlug = service.slug?.toLowerCase() || '';
  const serviceTitle = service.title?.toLowerCase() || '';
  const subcategorySlug = subcategory.slug?.toLowerCase() || '';
  const subcategoryId = subcategory.id?.toLowerCase() || '';
  const subcategoryTitle = subcategory.title?.toLowerCase() || '';
  
  const subcategoryKeywords = [
    ...extractKeywords(subcategorySlug),
    ...extractKeywords(subcategoryId),
    ...extractKeywords(subcategoryTitle),
  ];
  
  const serviceKeywords = [
    ...extractKeywords(serviceSlug),
    ...extractKeywords(serviceTitle),
  ];
  
  // High confidence: Service slug/title contains subcategory slug/id
  if (serviceSlug.includes(subcategorySlug) || serviceSlug.includes(subcategoryId)) {
    return { matches: true, confidence: 'high', reason: `Service slug contains subcategory slug/id` };
  }
  
  if (serviceTitle.includes(subcategoryTitle)) {
    return { matches: true, confidence: 'high', reason: `Service title contains subcategory title` };
  }
  
  // Medium confidence: Multiple keywords match
  const matchingKeywords = subcategoryKeywords.filter(kw => 
    serviceKeywords.some(sk => sk.includes(kw) || kw.includes(sk))
  );
  
  if (matchingKeywords.length >= 2) {
    return { matches: true, confidence: 'medium', reason: `Multiple keywords match: ${matchingKeywords.join(', ')}` };
  }
  
  // Low confidence: At least one keyword matches
  if (matchingKeywords.length >= 1) {
    return { matches: true, confidence: 'low', reason: `Some keywords match: ${matchingKeywords.join(', ')}` };
  }
  
  return { matches: false, confidence: 'low', reason: 'No matching keywords found' };
};

const linkServicesToSubcategories = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 Finding services with category as string (e.g., "ipo")...\n');
    
    // Find all services where category is a string (not ObjectId)
    const allServices = await Service.find({}).lean();
    
    const servicesWithStringCategory = allServices.filter((service: any) => {
      const category = service.category;
      // Check if category is a string (not ObjectId)
      return typeof category === 'string' && !mongoose.Types.ObjectId.isValid(category);
    });
    
    console.log(`Found ${servicesWithStringCategory.length} services with category as string\n`);
    
    // Group services by categoryType
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
    
    // For each categoryType, find subcategory categories and match services
    const matches: ServiceMatch[] = [];
    const unmatched: any[] = [];
    
    for (const [categoryType, services] of Object.entries(servicesByCategoryType)) {
      console.log(`\n📋 Processing categoryType: ${categoryType}`);
      
      // Find all subcategory categories for this categoryType
      const subcategories = await ServiceCategory.find({
        categoryType: categoryType,
      }).lean();
      
      console.log(`  Found ${subcategories.length} subcategory categories`);
      
      // Try to match each service to a subcategory
      for (const service of services) {
        let bestMatch: ServiceMatch | null = null;
        let bestConfidence: 'high' | 'medium' | 'low' = 'low';
        
        for (const subcategory of subcategories) {
          const matchResult = matchServiceToSubcategory(service, subcategory);
          
          if (matchResult.matches) {
            // Prioritize higher confidence matches
            const confidenceOrder = { high: 3, medium: 2, low: 1 };
            if (confidenceOrder[matchResult.confidence] > confidenceOrder[bestConfidence]) {
              bestMatch = {
                service,
                subcategory,
                confidence: matchResult.confidence,
                reason: matchResult.reason,
              };
              bestConfidence = matchResult.confidence;
            }
          }
        }
        
        if (bestMatch) {
          matches.push(bestMatch);
          console.log(`  ✅ ${service.slug} -> ${bestMatch.subcategory.slug} (${bestMatch.confidence} confidence: ${bestMatch.reason})`);
        } else {
          unmatched.push(service);
          console.log(`  ❌ ${service.slug} -> No match found`);
        }
      }
    }
    
    console.log('\n\n📊 Summary:');
    console.log(`  Total services to link: ${servicesWithStringCategory.length}`);
    console.log(`  Matched: ${matches.length}`);
    console.log(`  Unmatched: ${unmatched.length}`);
    
    // Group matches by confidence
    const highConfidence = matches.filter(m => m.confidence === 'high');
    const mediumConfidence = matches.filter(m => m.confidence === 'medium');
    const lowConfidence = matches.filter(m => m.confidence === 'low');
    
    console.log(`\n  Confidence breakdown:`);
    console.log(`    High: ${highConfidence.length}`);
    console.log(`    Medium: ${mediumConfidence.length}`);
    console.log(`    Low: ${lowConfidence.length}`);
    
    if (unmatched.length > 0) {
      console.log(`\n⚠️  Unmatched services (need manual assignment):`);
      unmatched.forEach(service => {
        console.log(`    - ${service.slug} (${service.title})`);
      });
    }
    
    // Ask for confirmation before updating
    console.log('\n\n💡 To apply updates, uncomment the code below and run again.');
    console.log('   Or manually update services using the matches shown above.\n');
    
    // Uncomment below to apply updates
    /*
    console.log('\n🔄 Applying updates...\n');
    
    let updated = 0;
    for (const match of matches) {
      if (match.confidence === 'high' || match.confidence === 'medium') {
        await Service.updateOne(
          { _id: match.service._id },
          { 
            $set: { 
              category: match.subcategory._id,
              categoryName: match.subcategory.title,
            } 
          }
        );
        updated++;
        console.log(`  ✅ Updated: ${match.service.slug} -> ${match.subcategory.slug}`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} services\n`);
    */
    
    await disconnectDatabase();
    console.log('✅ Migration script completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

// Run the migration
linkServicesToSubcategories();

