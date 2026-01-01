import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Use MONGODB_URI if provided, otherwise construct from components
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      const username = process.env.MONGODB_USERNAME || 'bharatbusinessconsulting_db_user';
      const password = process.env.MONGODB_PASSWORD || 'yKCydlrATxesRnf5';
      const databaseName = process.env.MONGODB_DATABASE || 'cleartax';
      const clusterHost = process.env.MONGODB_CLUSTER || 'tax.shpv78g.mongodb.net';
      // mongodb+srv://bharatbusinessconsulting_db_user:yKCydlrATxesRnf5@tax.shpv78g.mongodb.net/?appName=tax

      mongoUri = `mongodb+srv://${username}:${password}@${clusterHost}/${databaseName}?retryWrites=true&w=majority`;
    }
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  } catch (error: any) {
    console.error('Failed to connect to MongoDB:', error);
    
    // Provide helpful error messages for common issues
    if (error.message?.includes('IP') || error.message?.includes('whitelist')) {
      console.error('\n⚠️  IP Whitelist Issue Detected!');
      console.error('Your IP address is not whitelisted in MongoDB Atlas.');
      console.error('\n📝 To fix this:');
      console.error('1. Go to MongoDB Atlas Dashboard: https://cloud.mongodb.com/');
      console.error('2. Navigate to: Network Access (or IP Access List)');
      console.error('3. Click "Add IP Address"');
      console.error('4. Click "Add Current IP Address" (or add 0.0.0.0/0 for all IPs - less secure)');
      console.error('5. Wait 1-2 minutes for changes to propagate');
      console.error('\n💡 For development, you can temporarily allow all IPs: 0.0.0.0/0');
      console.error('   (NOT recommended for production!)\n');
    } else if (error.message?.includes('authentication')) {
      console.error('\n⚠️  Authentication Failed!');
      console.error('Please check your MongoDB username and password in .env file.');
      console.error('Required variables: MONGODB_USERNAME, MONGODB_PASSWORD\n');
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('DNS')) {
      console.error('\n⚠️  DNS/Network Issue!');
      console.error('Could not resolve MongoDB hostname. Check your internet connection and cluster hostname.\n');
    }
    
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

