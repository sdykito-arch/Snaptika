import { PrismaClient, MediaType, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@snaptika.com' },
    update: {},
    create: {
      email: 'admin@snaptika.com',
      username: 'admin',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      bio: 'Official Snaptika Admin Account',
      verified: true,
      monetizationStatus: 'APPROVED',
    },
  });

  // Create sample users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const password = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        username: `user${i}`,
        password,
        firstName: `User`,
        lastName: `${i}`,
        bio: `This is user ${i}'s bio`,
        followersCount: Math.floor(Math.random() * 10000),
        followingCount: Math.floor(Math.random() * 1000),
        postsCount: Math.floor(Math.random() * 100),
      },
    });
    users.push(user);
  }

  // Create some follows
  for (let i = 0; i < 20; i++) {
    const follower = users[Math.floor(Math.random() * users.length)];
    const following = users[Math.floor(Math.random() * users.length)];
    
    if (follower.id !== following.id) {
      try {
        await prisma.follow.create({
          data: {
            followerId: follower.id,
            followingId: following.id,
          },
        });
      } catch (error) {
        // Ignore duplicate follows
      }
    }
  }

  // Create sample posts
  const samplePosts = [
    {
      caption: 'Beautiful sunset at the beach 🌅',
      mediaUrls: ['https://example.com/sunset.jpg'],
      mediaType: MediaType.IMAGE,
      hashtags: ['sunset', 'beach', 'beautiful', 'nature'],
    },
    {
      caption: 'My latest dance routine! What do you think?',
      mediaUrls: ['https://example.com/dance.mp4'],
      mediaType: MediaType.VIDEO,
      duration: 30,
      hashtags: ['dance', 'routine', 'moves', 'fun'],
    },
    {
      caption: 'Delicious homemade pasta 🍝',
      mediaUrls: ['https://example.com/pasta1.jpg', 'https://example.com/pasta2.jpg'],
      mediaType: MediaType.CAROUSEL,
      hashtags: ['food', 'pasta', 'homemade', 'cooking'],
    },
  ];

  for (const user of users) {
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      const postData = samplePosts[Math.floor(Math.random() * samplePosts.length)];
      await prisma.post.create({
        data: {
          ...postData,
          authorId: user.id,
          likesCount: Math.floor(Math.random() * 1000),
          commentsCount: Math.floor(Math.random() * 100),
          viewsCount: Math.floor(Math.random() * 10000),
        },
      });
    }
  }

  // Create sample notifications
  await prisma.notification.create({
    data: {
      receiverId: users[0].id,
      type: NotificationType.SYSTEM,
      title: 'Welcome to Snaptika!',
      message: 'Thanks for joining our community. Start by following some users and sharing your first post!',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@snaptika.com / admin123`);
  console.log(`👥 Created ${users.length} sample users`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
