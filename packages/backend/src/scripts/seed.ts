import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';

config({ path: resolve(__dirname, '../../.env') });

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'x_clone',
    entities: [User, Post],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const userRepository = dataSource.getRepository(User);
    const postRepository = dataSource.getRepository(Post);

    // Check if users already exist
    const existingUsers = await userRepository.find();
    if (existingUsers.length > 0) {
      console.log('Database already seeded. Skipping seed operation.');
      return;
    }

    // Create sample users
    const users = [
      {
        username: 'johndoe',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      {
        username: 'janedoe',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
      {
        username: 'alice',
        avatar: 'https://i.pravatar.cc/150?img=9',
      },
      {
        username: 'bob',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
    ];

    const createdUsers = await userRepository.save(users);
    console.log(`Created ${createdUsers.length} users`);

    // Create sample posts
    const posts = [
      {
        content:
          'Just launched my new project! Excited to share it with the world. 🚀',
        userId: createdUsers[0].id,
      },
      {
        content: 'Beautiful sunset today! Nature never fails to amaze me. 🌅',
        userId: createdUsers[0].id,
      },
      {
        content: 'Working on something exciting. Stay tuned! 💻',
        userId: createdUsers[1].id,
      },
      {
        content: 'Coffee and code - the perfect combination ☕',
        userId: createdUsers[1].id,
      },
      {
        content: 'Just finished reading an amazing book. Highly recommend! 📚',
        userId: createdUsers[2].id,
      },
      {
        content: 'Weekend vibes! Time to relax and recharge. 😎',
        userId: createdUsers[2].id,
      },
      {
        content: 'Learning new technologies is always fun! 🎓',
        userId: createdUsers[3].id,
      },
      {
        content: 'Great meeting today with the team. Lots of progress! 👥',
        userId: createdUsers[3].id,
      },
      {
        content: 'Random thought: What if we could code in our dreams? 🤔',
        userId: createdUsers[0].id,
      },
      {
        content:
          'The best part of coding is seeing your ideas come to life! ✨',
        userId: createdUsers[1].id,
      },
    ];

    const createdPosts = await postRepository.save(posts);
    console.log(`Created ${createdPosts.length} posts`);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

seed()
  .then(() => {
    console.log('Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
