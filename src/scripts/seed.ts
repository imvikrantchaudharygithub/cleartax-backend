import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User.model';
import { Blog } from '../models/Blog.model';
import { Service } from '../models/Service.model';
import { Team } from '../models/Team.model';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Blog.deleteMany({});
    // await Service.deleteMany({});
    // await Team.deleteMany({});

    // Create admin user
    const adminEmail = 'admin@cleartax.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const admin = await User.create({
        fullName: 'Admin User',
        email: adminEmail,
        phone: '9876543210',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample blog
    const existingBlog = await Blog.findOne({ slug: 'income-tax-slabs-fy-2024' });
    if (!existingBlog) {
      const blog = await Blog.create({
        slug: 'income-tax-slabs-fy-2024',
        title: 'Complete Guide to Income Tax Slabs for FY 2023-24',
        category: 'Income Tax',
        author: {
          name: 'Priya Sharma',
          avatar: '👩‍💼',
        },
        date: new Date('2024-03-15'),
        readTime: '8 min read',
        excerpt: 'Understand the new income tax slabs, exemptions, and how to optimize your tax savings for Financial Year 2023-24 with our comprehensive guide.',
        content: '<h2>Understanding India\'s Tax Structure for FY 2023-24</h2><p>The Finance Act 2023 introduced significant changes to the income tax structure in India.</p>',
        image: '/images/blog-tax-slabs.jpg',
        featured: true,
      });
      console.log('✅ Sample blog created:', blog.title);
    } else {
      console.log('ℹ️  Sample blog already exists');
    }

    // Create sample service
    const existingService = await Service.findOne({ slug: 'gst-registration' });
    if (!existingService) {
      const service = await Service.create({
        slug: 'gst-registration',
        title: 'GST Registration',
        shortDescription: 'Get your business registered under GST with expert guidance. Fast, hassle-free process for all business types.',
        longDescription: 'GST Registration is mandatory for businesses with an annual turnover exceeding ₹40 lakhs.',
        iconName: 'Receipt',
        category: 'GST',
        price: {
          min: 999,
          max: 2999,
          currency: 'INR',
        },
        duration: '3-5 business days',
        features: [
          'Complete GST registration assistance',
          'GSTIN within 3-5 business days',
          'Document preparation and verification',
        ],
        benefits: [
          'Legal recognition for your business',
          'Claim input tax credit',
          'Inter-state business operations',
        ],
        requirements: [
          'PAN card of the business',
          'Aadhaar card of promoters/directors',
          'Proof of business registration',
        ],
        process: [
          {
            step: 1,
            title: 'Document Collection',
            description: 'Gather all required documents including PAN, Aadhaar, address proof, and business registration documents.',
            duration: '1 day',
          },
          {
            step: 2,
            title: 'Application Filing',
            description: 'Submit the application on the GST portal and receive an Application Reference Number (ARN).',
            duration: '1 day',
          },
        ],
        faqs: [
          {
            id: 'gst-reg-1',
            question: 'Who needs to register for GST?',
            answer: 'Businesses with an annual turnover exceeding ₹40 lakhs must register for GST.',
          },
        ],
        relatedServices: [],
      });
      console.log('✅ Sample service created:', service.title);
    } else {
      console.log('ℹ️  Sample service already exists');
    }

    // Create sample team member
    const existingTeamMember = await Team.findOne({ id: 'ananya-mehta' });
    if (!existingTeamMember) {
      const teamMember = await Team.create({
        id: 'ananya-mehta',
        name: 'Ananya Mehta',
        role: 'Chief Executive Officer',
        description: 'Guides vision, product direction, and builds high-performing teams focused on customer trust.',
        linkedin: 'https://www.linkedin.com/',
        accent: 'from-orange-400 to-amber-500',
      });
      console.log('✅ Sample team member created:', teamMember.name);
    } else {
      console.log('ℹ️  Sample team member already exists');
    }

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

seedDatabase();

